import { cnx } from "../pg_connection.js";

const Role = () => {}

Role.getAll = async () => {
    const query = `SELECT id_rol, nombre_rol AS rol, descripcion_rol
                            FROM public.rol_system`;

    const result = await cnx.query(query);

    return result.rows;
}

export default Role;