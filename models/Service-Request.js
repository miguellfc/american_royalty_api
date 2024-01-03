import { cnx} from "../pg_connection.js";
const ServiceRequest = () => {};

ServiceRequest.getById = async (id_request) => {
    const query = `SELECT id_servicio
                            FROM public.servicio_solicitud
                            WHERE id_solicitud = ${id_request}`;

    const result = await cnx.query(query);

    return result.rows;
}

ServiceRequest.getAllByService = async (id) => {
    const query = `SELECT s.id_solicitud, s.total_precio
                            FROM public.servicio_solicitud ss
                            LEFT JOIN public.solicitud s ON (ss.id_solicitud = s.id_solicitud)
                            LEFT JOIN public.servicio s2 on (s2.id_servicio = ss.id_servicio)
                            WHERE ss.id_servicio = ${id} AND s.estado NOT IN ('F', 'C')`;

    const result = await cnx.query(query);

    return result.rows;
}

ServiceRequest.create = async (id_request, services) => {
    let query = `INSERT INTO public.servicio_solicitud (id_solicitud, id_servicio)
                            VALUES `;

    services.map((service, index) => {
        index === 0
            ? query += `(${id_request}, ${service.id_servicio})`
            : query += `, (${id_request}, ${service.id_servicio})`
    })

    return await cnx.query(query);
}

ServiceRequest.deleteAllById = async (ids) => {
    const query = `DELETE FROM public.servicio_solicitud
                            WHERE id_solicitud IN (${ids})`;

    return await cnx.query(query);
}

ServiceRequest.deleteById = async (id_request, services) => {
    const auxServices = services.map((service) => service.id_servicio);

    const query = `DELETE FROM public.servicio_solicitud
                            WHERE id_solicitud IN (${id_request})
                            AND id_servicio IN (${auxServices.join(',')})`;

    return await cnx.query(query);
}

ServiceRequest.deleteByService = async (ids) => {
    const query = `DELETE FROM public.servicio_solicitud
                            WHERE id_servicio IN (${ids})`;

    return await cnx.query(query);
}
export default ServiceRequest;