import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { login } from "./login.ts";
import utils from "../common/utils.ts";

export default (router: Router) => {

    router.post("/api/gettoken", login.getToken);
    
    router.post("/api/verifytoken", login.verifyToken, (ctx: Context) => {
        utils.generalCallback(ctx)(null, {}, "verifytoken success");
    });

};