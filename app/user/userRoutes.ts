import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { user } from "./user.ts";
import { login } from "../login/login.ts";
import utils from "../common/utils.ts";

export default (router: Router) => {

    router.post("/api/user/getall", login.verifyToken, (ctx: Context) => {
        user.getAllUsers(ctx, utils.generalCallback(ctx))
    });

    router.post("/api/user/getusername", login.verifyToken, async (ctx: Context, next: any) => {
        await utils.verifyapiargs(ctx, next, ['userid']);
    }, (ctx: Context) => {
        user.getUserName(ctx, utils.generalCallback(ctx))
    });

    router.post("/api/user/adduser", login.verifyToken, async (ctx: Context, next: any) => {
        await utils.verifyapiargs(ctx, next, ['userid', 'username', 'password']);
    }, (ctx: Context) => {
        user.addUser(ctx, utils.generalCallback(ctx))
    });

};