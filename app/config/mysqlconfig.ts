import { Client } from "https://deno.land/x/mysql/mod.ts";

import {mysqlconfig} from './appconfig.ts';

const client = await new Client().connect(mysqlconfig);

export default client;