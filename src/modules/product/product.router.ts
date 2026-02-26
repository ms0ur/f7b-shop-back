import { Elysia, t } from 'elysia'
import * as repo from "./product.repo"

const ProductDTO = t.Object({
    id: t.Optional(t.String()),
    name: t.String(),
    img: t.Optional(t.String()),
    description: t.String(),
    actualPrice: t.Number(),
    previousPrice: t.Optional(t.Number()),
})

export const product = new Elysia({ prefix: '/product' })
    .get('/', () => repo.getProducts())

    .get(':id', ({ params: { id } }) => {
        const res = repo.getProduct(id)
        return res
    })

    .post('/', ({ body }) => {
        return repo.createProduct(
            body.name,
            body.description,
            body.actualPrice,
            body.previousPrice,
            body.img
        )
    }, {
        body: ProductDTO
    })

    .patch(':id', ({ params: { id }, body }) => {
        const res = repo.editProduct(id, body)
        return res
    }, {
        body: t.Partial(ProductDTO)
    })

    .delete(':id', ({ params: { id } }) => {
        const res = repo.deleteProduct(id)
        return { success: true }
    })

    .get('/generate/:count', ({ params: { count } }) => {
        repo.generateProductsFromFakerJs(Number(count))
        return { success: true }
    })