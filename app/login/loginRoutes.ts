import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { login } from "./login.ts";
import utils from "../common/utils.ts";

export default (router: Router) => {

    router.post("/api/gettoken", login.getToken);
    
    router.post("/api/verifytoken", login.verifyToken, (ctx: Context) => {
        utils.generalCallback(ctx)(null, {}, "verifytoken success");
    });

    router.post("/api/getgoogletoken", async (ctx, next) => {
        await utils.verifyapiargs(ctx, next, ['token', 'usertype']);
    }, async (ctx: any)=>{
        login.getGoogleToken(ctx, utils.generalCallback(ctx));
    });

    router.post('/api/getalluser', async (ctx: Context) => {
        ctx.response.body = await login.getUsers();
        // login.getUsers2(utils.generalCallback(ctx));
    })

};