import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { login } from "./login.ts";
import utils from "../common/utils.ts";

export default (router: Router) => {

    router.post("/api/gettoken", login.getToken);
    
    router.post("/api/verifytoken", login.verifyToken, (ctx: Context) => {
        utils.generalCallback(ctx)(null, {}, "verifytoken success");
    });

    router.post("/api/getgoogletoken", async (ctx: Context, next: any) => {
        await utils.verifyapiargs(ctx, next, ['token']);
    }, async (ctx: Context)=>{
        await login.getGoogleToken(ctx, utils.generalCallback(ctx));
    });

    router.post("/api/creategoogleuser", async (ctx: Context, next: any) => {
        await utils.verifyapiargs(ctx, next, ['token', 'usertype']);
    }, async (ctx: Context)=>{
        await login.createGoogleUser(ctx, utils.generalCallback(ctx));
    });

};