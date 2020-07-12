import { Context } from "https://deno.land/x/oak/mod.ts";
import { validateJwt, parseAndDecode } from "https://deno.land/x/djwt/validate.ts";
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";
import "https://deno.land/x/dotenv/load.ts";

import {jwt_key} from "../config/jwtconfig.ts";
import utils from "../common/utils.ts";
import users from "../user/users.ts";
import mysql from "../config/mysqlconfig.ts";
// import mongodb from '../config/mongoconfig.ts';

const header: Jose = {
    alg: "HS256",
    typ: "JWT",
};

const getToken = async (ctx: Context ) => {
    const {value} = await ctx.request.body();

    for (const user of users) {
        if (value.username === user.username && value.password === user.password) {
            
            const payload: Payload = {
                "userinfo": user,
                exp: setExpiration(new Date().getTime() + 60000),
            };
            const token = makeJwt({ "key": jwt_key, header, payload });

            return utils.succReply({token, "userinfo":user}, "succ", ctx)
        }
    }
    return utils.authFailure("invalid username or password", ctx);
};

const verifyToken = async (ctx: Context, next: any) => {
    const {value} = await ctx.request.body();
    if ( !('token' in value)) {
        return utils.authFailure("Token not found", ctx);
    }

    const token = value.token;
    let tokend: any = await validateJwt(token, jwt_key);
    if ( tokend.isValid == true ) {
        await ctx.request.headers.set('tokend', JSON.stringify(tokend.payload));
        await next();
    } else {
        return utils.authFailure('Failed to authenticate the token', ctx);
    }
};

let getUserByEmail = async (email: string) => {
    let query = `SELECT id, name, email, usertype, meta, createdat, updatedat FROM users WHERE email = ?`;
    let params = [email];
    return await mysql.query(query, params);
};

let getUserById = async (id: any) => {
    let query = `SELECT id, name, email, usertype, meta, createdat, updatedat FROM users WHERE id = ?`;
    let params = [id];
    return await mysql.query(query, params);
};


let generateToken = async (userinfo: any, callback: any) => {

    const payload: Payload = {
        "userinfo": userinfo,
        exp: setExpiration(new Date().getTime() + 86400*1000*1),
    };
    const token: String = await makeJwt({ "key": jwt_key, header, payload });
    
    return callback(null, {token, userinfo}, "get google token success");
}

const createGoogleUserHelper = async (name: string, email: string, usertype: string, meta: string, callback: any) => {
    const query = `INSERT INTO users(name, email, usertype, meta, createdat) VALUES(?,?,?,?,?)`;
    let currtime = new Date().getTime();
    const params = [name, email, usertype, meta, currtime];

    try {
        const result = await mysql.execute(query, params);
        const user = await getUserByEmail(email);
        await generateToken(user[0], callback);
    } catch(err) {
        console.log("Error", err);
        return await callback(err, null, "create user failed");
    }
};

let checkAndGetGUserToken = async (tokenData: any, usertype: string, callback: any) => {
    const user = await getUserByEmail(tokenData.email);
    
    if (user && user.length) {
        await generateToken(user[0], callback);
    } else {
        return callback("Token failure", null, "user not exist");
        // await createGoogleUser(tokenData.name, tokenData.email, usertype, "{}", callback);
    }
};

let getGoogleToken = async (ctx: Context, callback: any) => {
    const {value} = await ctx.request.body();
    const {token, usertype} = value;
    const tokenData:any = await parseAndDecode(token).payload;

    if (tokenData && tokenData.email && tokenData.email_verified && (tokenData.exp * 1000 + (86400*1000*30)) - Date.now() > 0) {
        await checkAndGetGUserToken(tokenData, usertype, callback);
    } else {
        return utils.authFailure("Token not valid", ctx);
    }
};

let createGoogleUser = async (ctx: Context, callback: any) => {
    const {value} = await ctx.request.body();
    const {token, usertype} = value;
    const tokenData:any = await parseAndDecode(token).payload;
    await createGoogleUserHelper(tokenData.name, tokenData.email, usertype, "{}", callback);
};

export const login = {
    getToken,
    verifyToken,
    getGoogleToken,
    createGoogleUser
};