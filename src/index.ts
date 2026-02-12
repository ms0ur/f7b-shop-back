import { Elysia } from "elysia";
import { product } from "./modules/product/product.router";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
app.use(product)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
