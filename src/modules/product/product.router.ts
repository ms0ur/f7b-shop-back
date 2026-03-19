import { Elysia, t } from 'elysia'
import * as repo from './product.repo'
import { authPlugin } from '../../plugins/auth.plugin'

const ProductDTO = t.Object({
    id: t.Optional(t.String()),
    name: t.String(),
    img: t.Optional(t.String()),
    description: t.String(),
    actualPrice: t.Number(),
    previousPrice: t.Optional(t.Number()),
})

export const product = new Elysia({ prefix: '/api/products' })
    .use(authPlugin)

    // Пользователь, Продавец, Администратор
    .get('/', ({ user, set }) => {
        if (!user) { set.status = 401; return { error: 'Unauthorized' } }
        return repo.getProducts()
    })

    .get('/:id', ({ user, set, params: { id } }) => {
        if (!user) { set.status = 401; return { error: 'Unauthorized' } }
        const res = repo.getProduct(id)
        if (!res) { set.status = 404; return { error: 'Not found' } }
        return res
    })

    // Продавец, Администратор
    .post('/', ({ user, set, body }) => {
        if (!user) { set.status = 401; return { error: 'Unauthorized' } }
        if (!['seller', 'admin'].includes(user.role)) { set.status = 403; return { error: 'Forbidden' } }
        return repo.createProduct(body.name, body.description, body.actualPrice, body.previousPrice, body.img)
    }, { body: ProductDTO })

    .put('/:id', ({ user, set, params: { id }, body }) => {
        if (!user) { set.status = 401; return { error: 'Unauthorized' } }
        if (!['seller', 'admin'].includes(user.role)) { set.status = 403; return { error: 'Forbidden' } }
        const res = repo.editProduct(id, body)
        if (!res) { set.status = 404; return { error: 'Not found' } }
        return res
    }, { body: t.Partial(ProductDTO) })

    // Только Администратор
    .delete('/:id', ({ user, set, params: { id } }) => {
        if (!user) { set.status = 401; return { error: 'Unauthorized' } }
        if (user.role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
        repo.deleteProduct(id)
        return { success: true }
    })

    .get('/generate/:count', ({ params: { count } }) => {
        repo.generateProductsFromFakerJs(Number(count))
        return { success: true }
    })
