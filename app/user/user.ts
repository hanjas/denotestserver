import { Context } from "https://deno.land/x/oak/mod.ts";

import utils from "../common/utils.ts";
import users from "../user/users.ts";
import mysql from "../config/mysqlconfig.ts";

const getAllUsers = (ctx: Context, callback: any ) => {
    callback(null, users, "getallusers success");
};

const getUserName = async (ctx: Context, callback: any) => {
    const {value} = await ctx.request.body();
    const userid = value.userid;

    for (const user of users) {
        if (user.id == userid) {
            return callback(null, {"username": user.username}, "getusername success")
        }
    }

    return callback("getusername failed", null, "user not found");
};

const addUser = async (ctx: Context, callback: any) => {
    const {value} = await ctx.request.body();
    const {userid, username, password} = value;

    users.push({"id": userid, username, password});

    return callback(null, {userid, username, password}, "add user success");
};

const deleteUser = async (ctx: Context, callback: any) => {
    let headers: Headers = await ctx.request.headers;
    let tokend: any = headers.get('tokend')?.toString();
    tokend = (typeof tokend == 'string') ? JSON.parse(tokend) : tokend;
    
    if (!tokend)
        return callback("Delete user failed", null, "token-d not found");

    let myuserid = tokend.userinfo.id;
    let query = `DELETE FROM users WHERE id = ?`;
    let params = [myuserid];
    let result =  await mysql.query(query, params);
    if (result.affectedRows && result.affectedRows>0)
        return callback(null, result, "delete user success.");
    else
        return callback("Delete user failed", result, "Something went wrong.");
}

export const user = {
    getAllUsers,
    getUserName,
    addUser,
    deleteUser
};