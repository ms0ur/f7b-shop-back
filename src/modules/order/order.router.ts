import { Elysia, t } from 'elysia'
import * as repo from './order.repo'

const orderDTO = t.Object({
    id: t.String(),
    userId: t.String(),
    products: t.Array(t.String()),
    totalPrice: t.Number(),
    status: t.Union([
        t.Literal('pending'),
        t.Literal('completed'),
        t.Literal('cancelled')
    ]),
})

export const order = new Elysia({ prefix: '/orders' })
    .get('/', () => repo.getOrders())
    .get(':id', ({ params }) => repo.getOrder(params.id))
    .post('/', ({ body }) => repo.createOrder(
        body.userId,
        body.products,
        body.totalPrice,
        body.status
    ), { body: orderDTO })
    .put(':id', ({ params, body }) => repo.editOrder(params.id, body), { body: t.Partial(orderDTO) })
    .delete(':id', ({ params }) => repo.deleteOrder(params.id))