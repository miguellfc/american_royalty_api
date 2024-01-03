import {cnx} from "../pg_connection.js";
import {toTimestamp} from "../utils.js";
import ServiceRequest from "./Service-Request.js";
import date from "date-and-time";
import ES from "date-and-time/locale/es"

date.locale(ES);

const Request = () => {
};

Request.getAll = async ({start, limit}) => {
    const query = `SELECT s.id_solicitud,
                          s.total_precio   AS                       precio_total,
                          s.direccion,
                          s.estado,
                          s.fecha_hora,
                          s.nombre_cliente AS                       cliente,
                          s.telf_cliente,
                          s.id_usuario     AS                       usuario,
                          u.nombre,
                          u.apellido,
                          u.foto,
                          (SELECT json_agg(json_build_object('id_servicio', sv.id_servicio, 'nombre_servicio',
                                                             sv.nombre_servicio,
                                                             'precio_servicio', sv.precio_servicio)) servicios
                           FROM public.servicio sv
                                    LEFT JOIN public.tipo_servicio ts ON (sv.id_tipo_servicio = ts.id_tipo_servicio)
                                    LEFT JOIN public.servicio_solicitud ss ON (sv.id_servicio = ss.id_servicio)
                                    LEFT JOIN public.solicitud req ON (ss.id_solicitud = req.id_solicitud)
                           WHERE s.id_solicitud = req.id_solicitud) servicios
                   FROM public.solicitud s
                            LEFT JOIN public.usuario u ON (s.id_usuario = u.id_usuario)
                   OFFSET ${start} LIMIT ${limit}`;

    const result = await cnx.query(query);

    const count = await all();

    return {
        data: result.rows,
        count: parseInt(count.rows[0].count)
    };
}

Request.create = async (new_request) => {
    const {precio_total, direccion, estado, fecha_hora, cliente, telf_cliente, usuario, servicios} = new_request;
    const {lat, lng} = direccion;

    let query = `INSERT INTO public.solicitud (total_precio, direccion, estado, fecha_hora, nombre_cliente,
                                               telf_cliente, id_usuario)
                 VALUES (${precio_total}, '{"lat": ${lat}, "lng": ${lng}}', '${estado}',
                         '${toTimestamp(new Date(fecha_hora))}', '${cliente}', '${telf_cliente}',
                         ${usuario}) RETURNING id_solicitud`;

    const result = await cnx.query(query);
    const id_solicitud = result.rows[0].id_solicitud;

    return await ServiceRequest.create(id_solicitud, servicios);
}

Request.update = async (old_request) => {
    const {
        id_solicitud,
        precio_total,
        direccion,
        estado,
        fecha_hora,
        cliente,
        telf_cliente,
        usuario,
        servicios
    } = old_request;
    const {lat, lng} = direccion;

    const query = `UPDATE public.solicitud
                   SET total_precio   = ${precio_total},
                       direccion      = '{"lat": ${lat}, "lng": ${lng}}',
                       estado         = '${estado}',
                       fecha_hora     = '${toTimestamp(new Date(fecha_hora))}',
                       nombre_cliente = '${cliente}',
                       telf_cliente   = '${telf_cliente}',
                       id_usuario     = ${usuario}
                   WHERE id_solicitud = ${id_solicitud}`;

    let result = await cnx.query(query);

    const old_servicios = await ServiceRequest.getById(id_solicitud);

    const toAdd = servicios.filter(servicio1 => !old_servicios.some(servicio2 => servicio1.id_servicio === servicio2.id_servicio));
    if (toAdd.length > 0) result = await ServiceRequest.create(id_solicitud, toAdd);

    const toDelete = old_servicios.filter(servicio1 => !servicios.some(servicio2 => servicio1.id_servicio === servicio2.id_servicio));
    if (toDelete.length > 0) result = await ServiceRequest.deleteById(id_solicitud, toDelete);

    return result;
}

Request.updatePrecio = async (id, new_precio) => {
    const query = `UPDATE public.solicitud
                   SET total_precio = ${new_precio}
                   WHERE id_solicitud = ${id}`;

    return await cnx.query(query);
}

Request.delete = async (ids) => {

    await ServiceRequest.deleteAllById(ids);
    const query = `DELETE
                   FROM public.solicitud
                   WHERE id_solicitud IN (${ids})`;

    return await cnx.query(query);
}

Request.deleteUserInRequest = async (ids) => {
    const query = `UPDATE public.solicitud
                   SET id_usuario = NULL
                   WHERE id_usuario IN (${ids})`;

    return await cnx.query(query);
}

Request.resumeMonth = async (options) => {

    let result = await Promise.all(options.map(async (option) => {
        const {ini, fin} = option;
        let data = {
            id: date.format(new Date(ini), 'MMMM'),
            data: {}
        };

        let query = `SELECT count(s.id_solicitud)
                     FROM public.solicitud s
                     WHERE fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        let resp = await cnx.query(query);

        data.data = {...data.data, total: parseInt(resp.rows[0].count)};

        query = `SELECT count(s.id_solicitud)
                 FROM public.solicitud s
                 WHERE estado = 'F'
                   AND fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        resp = await cnx.query(query);

        data.data = {...data.data, finished: parseInt(resp.rows[0].count)};

        query = `SELECT count(s.id_solicitud)
                 FROM public.solicitud s
                 WHERE estado = 'C'
                   AND fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        resp = await cnx.query(query);

        data.data = {...data.data, canceled: parseInt(resp.rows[0].count)};

        return data;
    }));

    return result;
}

Request.budgetCollect = async (options) => {

    let result = {
        id: [],
    }

    let collect = await Promise.all(options.map(async (option) => {
        const {ini, fin} = option;

        result.id.push(date.format(new Date(ini), "MMMM"));

        const query = `SELECT sum(s.total_precio)
                           FROM public.solicitud s
                           WHERE estado = 'F'
                             AND fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        const resp = await cnx.query(query);

        return resp.rows[0].sum === null ? 0 : resp.rows[0].sum;
    }));

    let canceled = await Promise.all(options.map(async (option) => {
        const {ini, fin} = option;

        const query = `SELECT sum(s.total_precio)
                           FROM public.solicitud s
                           WHERE estado = 'C'
                             AND fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        const resp = await cnx.query(query);

        return resp.rows[0].sum === null ? 0 : resp.rows[0].sum;
    }));

    let estimated = await Promise.all(options.map(async (option) => {
        const {ini, fin} = option;

        const query = `SELECT sum(s.total_precio)
                           FROM public.solicitud s
                           WHERE fecha_hora BETWEEN '${ini}' AND '${fin}'`;

        const resp = await cnx.query(query);

        return resp.rows[0].sum === null ? 0 : resp.rows[0].sum;
    }));

    result = { ...result, data: { estimated, collect, canceled } };

    return result;
}

const all = async () => {
    const query = `SELECT count(id_solicitud)
                   FROM public.solicitud`;

    return await cnx.query(query);
}

export default Request;