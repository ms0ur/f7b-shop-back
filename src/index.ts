import { Elysia } from "elysia";
import { product } from "./modules/product/product.router";
import { user } from "./modules/user/user.router";
import { order } from "./modules/order/order.router";
import { auth } from "./modules/auth/auth.router";
import { dev } from "./modules/dev/dev.router";
import { openapi } from '@elysiajs/openapi'

const isDev = process.env.NODE_ENV !== 'production'

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .use(openapi())
    .use(auth)
    .use(user)
    .use(product)
    .use(order)
    .use(isDev ? dev : new Elysia())
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
