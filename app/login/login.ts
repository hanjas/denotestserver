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
    if ( await validateJwt(token, jwt_key) ) {
        await next();
    } else {
        return utils.authFailure('Failed to authenticate the token', ctx);
    }
};

const getUserByEmail = async (email: string) => {
    let query = `SELECT id, name, email, usertype, meta, createdat, updatedat FROM users WHERE email = ?`;
    let params = [email];
    return await mysql.query(query, params);
};

const createGoogleUser = async (name: string, email: string, usertype: string, meta: string, callback: any) => {
    const query = `INSERT INTO users(name, email, usertype, meta, createdat) VALUES(?,?,?,?,?)`;
    let currtime = new Date().getTime();
    const params = [name, email, usertype, meta, currtime];
    const result = await mysql.execute(query, params);

    let userinfo: any = {
        "userid": result.lastInsertId,
        email,
        usertype,
        meta,
        "createdat": currtime
    };

    generateToken(userinfo, callback);
};

let generateToken = async (userinfo: any, callback: any) => {

    const payload: Payload = {
        "userinfo": userinfo,
        exp: setExpiration(new Date().getTime() + 60000),
    };
    const token: String = await makeJwt({ "key": jwt_key, header, payload });
    
    return callback(null, {token, userinfo}, "get google token success");
}

const checkAndGetGUserToken = async (ctx: Context, tokenData: any, usertype: string, callback: any) => {

    ctx.response.body = await getUserByEmail(tokenData.email);

    // callback(null, getUserByEmail(tokenData.email), "done");

    // const user = getUserByEmail(tokenData.email, call1);
    // console.log("user", user);
    // callback(null, user, "done");
    
    // getUserByEmail(tokenData.email).then(result=>{
    //     console.log("result", result);
    //     callback(null, result, "done");
    // });
    // console.log(user);
    // callback(null, {user}, "usergotsuccess");


    // getUserByEmail(tokenData.email).then((user) => {
    //     return callback(null, user, "done");
    // });

    // if (user && user.length) {
    //     return callback(null, user, "done");
    //     // generateToken({"userid": user[0].id, "email": user[0].email}, callback);
    // } else {
    //     await createGoogleUser(tokenData.name, tokenData.email, usertype, "{}", callback);
    // }
}

const getGoogleToken = async (ctx: Context, callback: any) => {

    const {value} = await ctx.request.body();
    const {token, usertype} = value;
    const tokenData:any = await parseAndDecode(token).payload;

    if (tokenData && tokenData.email && tokenData.email_verified && (tokenData.exp * 1000 + (86400*1000*30)) - Date.now() > 0) {
        checkAndGetGUserToken(ctx, tokenData, usertype, callback);
    } else {
        return utils.authFailure("Token not valid", ctx);
    }
};

const getUsers = async () => {
    const result = await mysql.query("SELECT id, name, email, usertype, meta, createdat, updatedat FROM denotesting.users");
    return result;
}

const getUsers2 = async (callback: any) => {
    const result = await mysql.query("SELECT id, name, email, usertype, meta, createdat, updatedat FROM denotesting.users");
    return callback(null, result, "done");
}

export const login = {
    getToken,
    verifyToken,
    getGoogleToken,
    getUsers,
    getUsers2
};