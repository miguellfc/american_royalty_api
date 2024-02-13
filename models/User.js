import { unlinkSync, stat } from 'node:fs';
import * as path from "node:path";
import { cnx } from "../pg_connection.js";
import bcrypt from "bcrypt";
import Request from "./Request.js";

const User = () => {}

User.login = async (email) => {
    const query =`SELECT *
                        FROM public.usuario
                        WHERE email = '${email}'`

    return await cnx.query(query)
}

User.getAll = async (data) => {
    const role = data.role;
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;

    const start = (page - 1) * limit;

    const query = `SELECT u.id_usuario, u.email,
                                u.nombre, u.apellido,
                                u.foto, u.password, u.telefono, u.usuario,
                                u.id_rol, r.nombre_rol AS rol
                            FROM public.usuario u
                            LEFT JOIN public.rol_system r ON (u.id_rol = r.id_rol)
                            ${ role ? `WHERE u.id_rol = '${role}'` : ''}
                            ORDER BY nombre, apellido ASC
                            ${start ? `OFFSET ${start}` : ``}
                            ${limit ? `LIMIT ${limit}` : ``}`;

    const result = await cnx.query(query);

    const count = await all(role);

    return {
        data: result.rows,
        count: parseInt(count.rows[0].count)
    }
}

User.create = async (new_user) => {
    const {email, nombre, apellido, fotoPath, password, telefono, usuario, id_rol} = new_user

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    const query = `INSERT INTO public.usuario (email, nombre, apellido, foto, password, telefono, usuario, id_rol)
                          VALUES ('${email}', '${nombre}', '${apellido}', '${fotoPath}', '${passwordHash}', '${telefono}', '${usuario}', '${id_rol}')`

    return await cnx.query(query)
}

User.update = async (new_values) => {
    const {id_usuario, email, nombre, apellido, fotoPath, password, telefono, usuario, id_rol} = new_values

    const validations = {
        password: await validatePass(id_usuario, password),
        email: await validateEmail(id_usuario, email),
        telf: await validateTelf(id_usuario, telefono),
        user: await validateUser(id_usuario, usuario),
        foto: await validatePhoto(id_usuario, fotoPath)
    }

    let passwordHash = '';

    if (!validations.password) {
        const salt = await bcrypt.genSalt();
        passwordHash = await bcrypt.hash(password, salt);
    }

    if (!validations.foto) {
        const old_foto = await getPhotos(id_usuario);
        const dir = path.resolve('public/assets/', old_foto[0].foto);

        stat(dir,(error,stats) => {
            if (!error && stats.isFile()) {
                unlinkSync(dir);
            }
        });
    }

    const query = `UPDATE public.usuario
                            SET ${ !validations.email ? `email = '${email}',` : ''} nombre = '${nombre}',
                                apellido = '${apellido}', ${ !validations.foto ? `foto = '${fotoPath}',` : ''} password = '${ validations.password ? password : passwordHash }',
                                ${ !validations.telf ? `telefono = '${telefono}',` : ''} ${ !validations.user ? `usuario = '${usuario}',` : ''}
                                id_rol = ${id_rol}
                            WHERE id_usuario = ${id_usuario}`;

    return await cnx.query(query);
}

User.delete = async (ids) => {

    const photos = await getPhotos(ids);

    photos.map((photo) => {
        if (photo.foto !== "") {
            const dir = path.resolve('public/assets/', photo.foto);

            stat(dir,(error, stats) => {
                if (!error && stats.isFile()) unlinkSync(dir);
            });
        }
    });

    await Request.deleteUserInRequest(ids);

    const query = `DELETE FROM public.usuario
                            WHERE id_usuario IN (${ids})`

    return await cnx.query(query);
}

User.totals = async () => {
    const query = `SELECT count(u.id_rol) AS value, rs.nombre_rol AS label, rs.color
                            FROM public.usuario u
                            LEFT JOIN public.rol_system rs ON (u.id_rol = rs.id_rol)
                            GROUP BY rs.id_rol`;

    let result = await cnx.query(query);

    return Array.from(result.rows,(item) => ({ ...item, value: parseInt(item.value)}));
}

User.waiter = async () => {
    const query = `SELECT count(s.id_solicitud) AS value, u.id_usuario, u.nombre, u.apellido, u.email
                            FROM public.usuario u
                            LEFT JOIN public.solicitud s ON u.id_usuario = s.id_usuario
                            WHERE u.id_rol = 3 AND s.estado = 'W'
                            GROUP BY u.id_usuario
                            ORDER BY value DESC
                            LIMIT 1;`

    const result = await cnx.query(query);

    return result.rows[0];
}

User.finisher = async () => {
    const query = `SELECT count(s.id_solicitud) AS value, u.id_usuario, u.nombre, u.apellido, u.email
                            FROM public.usuario u
                            LEFT JOIN public.solicitud s ON u.id_usuario = s.id_usuario
                            WHERE u.id_rol = 3 AND s.estado = 'F'
                            GROUP BY u.id_usuario
                            ORDER BY value DESC
                            LIMIT 1;`

    const result = await cnx.query(query);

    return result.rows[0];
}

User.sellers = async () => {
    const query = `SELECT u.nombre, u.apellido, u.email, u.foto, sum(s.total_precio) AS SUM
                            FROM public.usuario u
                            LEFT JOIN public.solicitud s ON (u.id_usuario = s.id_usuario)
                            WHERE u.id_rol = 3 AND s.estado = 'F'
                            GROUP BY u.id_usuario
                            ORDER BY SUM DESC
                            LIMIT 5`;

    const result = await cnx.query(query);

    return result.rows;
}

const all = async (role) => {
    const query = `SELECT count(id_usuario)
                            FROM public.usuario
                            ${role ? `WHERE id_rol = ${role}` : ''}`;

    return await cnx.query(query);
}
const validateTelf = async (id, telf) => {
    const query = `SELECT telefono
                            FROM public.usuario
                            WHERE id_usuario = ${id}`;

    const usuario = await cnx.query(query);

    return usuario.rows[0].telefono === telf;
}
const validateUser = async (id, user) => {
    const query = `SELECT usuario
                            FROM public.usuario
                            WHERE id_usuario = '${id}'`;

    const usuario = await cnx.query(query);

    return usuario.rows[0].usuario === user;
}
const validatePass = async (id, pass) => {
    const query = `SELECT password
                            FROM public.usuario
                            WHERE id_usuario = '${id}'`

    const usuario = await cnx.query(query)

    return usuario.rows[0].password === pass
}
const validateEmail = async (id, email) => {
    const query = `SELECT email
                            FROM public.usuario
                            WHERE id_usuario = '${id}'`

    const usuario = await cnx.query(query)

    return usuario.rows[0].email === email
}
const validatePhoto = async (id, foto) => {
    return await getPhotos(id) === foto;
}
const getPhotos = async (id) => {
    const query = `SELECT foto
                            FROM public.usuario
                            WHERE id_usuario IN (${id})`;

    const usuario = await cnx.query(query);

    return usuario.rows;
}
export default User