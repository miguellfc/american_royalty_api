import { cnx } from "../pg_connection.js";

const TypeService = () => {}

TypeService.getAll = async () => {
    const query = `SELECT id_tipo_servicio AS tipo_servicio, nombre_ts, descripcion_ts
                            FROM public.tipo_servicio`;

    return await cnx.query(query);
}

export default TypeService