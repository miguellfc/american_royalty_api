import {cnx} from "../pg_connection.js";
import ServiceRequest from "./Service-Request.js";
import Request from "./Request.js";

const Service = () => {
}

Service.getAll = async ({start, limit}) => {
    const query = `SELECT s.id_servicio,
                          s.nombre_servicio  AS servicio,
                          s.precio_servicio  AS precio,
                          s.id_tipo_servicio AS tipo_servicio,
                          ts.nombre_ts
                   FROM public.servicio s
                            LEFT JOIN public.tipo_servicio ts ON (ts.id_tipo_servicio = s.id_tipo_servicio)
                   ORDER BY precio_servicio ASC
                       ${start ? `OFFSET ${start}` : ''} ${limit ? `LIMIT ${limit}` : ''}`;

    const result = await cnx.query(query);
    const count = await all();

    return {
        data: result.rows,
        count: parseInt(count.rows[0].count)
    }
}

Service.create = async (new_service) => {
    const {servicio, precio, tipo_servicio} = new_service;

    const query = `INSERT INTO public.servicio (nombre_servicio, precio_servicio, id_tipo_servicio)
                   VALUES ('${servicio}', ${precio}, ${tipo_servicio})`;

    return await cnx.query(query);
}

Service.update = async (new_values) => {
    const {id_servicio, servicio, precio, tipo_servicio} = new_values;

    const query = `UPDATE public.servicio
                   SET nombre_servicio  = '${servicio}',
                       precio_servicio  = ${precio},
                       id_tipo_servicio = ${tipo_servicio}
                   WHERE id_servicio = ${id_servicio}`;

    return await cnx.query(query);
}

Service.delete = async (ids) => {
    const precios = await precioServicios(ids);

    precios.map( async (service) => {
        let requests = await ServiceRequest.getAllByService(service.id_servicio);

        requests.map( async (request) => {
            const new_precio = request.total_precio - service.precio_servicio;

            await Request.updatePrecio(request.id_solicitud, new_precio);
        })
    });

    await ServiceRequest.deleteByService(ids);

    const query = `DELETE
                   FROM public.servicio
                   WHERE id_servicio IN (${ids})`;

    return await cnx.query(query);
}

Service.bests = async () => {
    const query = `SELECT s.nombre_servicio, sum(s.precio_servicio)
                            FROM public.servicio s
                            LEFT JOIN public.servicio_solicitud ss on s.id_servicio = ss.id_servicio
                            LEFT JOIN public.solicitud s2 on s2.id_solicitud = ss.id_solicitud
                            WHERE estado = 'F'
                            GROUP BY s.id_servicio
                            ORDER BY SUM DESC`;

    const result = await cnx.query(query);

    return result.rows;
}

const all = async () => {
    const query = `SELECT count(id_servicio)
                   FROM public.servicio`;

    return await cnx.query(query);
}

const precioServicios = async (ids) => {
    const query = `SELECT id_servicio, precio_servicio
                   FROM public.servicio
                   WHERE id_servicio = ${ids}`;

    const result = await cnx.query(query);

    return result.rows;
}
export default Service