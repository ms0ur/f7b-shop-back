import { Elysia } from "elysia";
import { product } from "./modules/product/product.router";
import { user } from "./modules/user/user.router";
import { order } from "./modules/order/order.router";
import { openapi } from '@elysiajs/openapi'
import db from "./db";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
app.use(openapi())
app.use(product)
app.use(user)
app.use(order)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
