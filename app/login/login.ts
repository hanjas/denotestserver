import { Context } from "https://deno.land/x/oak/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import { makeJwt, setExpiration, Jose, Payload, JsonValue } from "https://deno.land/x/djwt/create.ts";

import {jwt_key} from "../config/jwtconfig.ts";
import utils from "../common/utils.ts";
import users from "../user/users.ts";

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
}

export const login = {
    getToken,
    verifyToken
};