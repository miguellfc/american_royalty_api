import * as pg from "pg";
import conf from "./db-conf.json" assert {type: 'json'};

const { pg_conf } = conf;
const { Client } = pg.default;

const dbConf = {
    host: pg_conf.host,
    port: pg_conf.port,
    database: pg_conf.db,
    user: pg_conf.user,
    password: pg_conf.pass
};
export const cnx = new Client(dbConf);