import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import { port } from "./app/config/appconfig.ts";

const app = new Application();
const router = new Router();

app.use(oakCors({origin:"*"}));
app.use(async (ctx, next) => {
    const {value} = await ctx.request.body();
    console.log(`${ctx.request.method} ${ctx.request.url} ${JSON.stringify(value)}`);
    await next();
});

await import('./app/login/loginRoutes.ts').then(a => { a.default(router) });
await import('./app/user/userRoutes.ts').then(a => { a.default(router) });

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({port});
console.log("Server listening on port:", port);