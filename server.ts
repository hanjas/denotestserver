import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { port } from "./app/config/appconfig.ts";

const app = new Application();
const router = new Router();

await import('./app/login/loginRoutes.ts').then(a => { a.default(router) });
await import('./app/user/userRoutes.ts').then(a => { a.default(router) });

app.use(router.routes());
app.use(router.allowedMethods());
app.use(function(ctx: any, next: any) {
    ctx.request.header("Access-Control-Allow-Origin", ctx.request.headers.origin);
    ctx.request.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen({port});
console.log("Server listening on port:", port);