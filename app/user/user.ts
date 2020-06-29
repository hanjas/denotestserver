import { Context } from "https://deno.land/x/oak/mod.ts";

import utils from "../common/utils.ts";
import users from "../user/users.ts";

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

export const user = {
    getAllUsers,
    getUserName,
    addUser
};