import { Elysia, t } from 'elysia'
import * as repo from './user.repo'

const userDTO = t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    password: t.String(),
    role: t.Union([
        t.Literal('admin'),
        t.Literal('user')
    ]),
    cart: t.Array(t.String()),
    orders: t.Array(t.String()),
})

export const user = new Elysia({ prefix: '/users' })
    .get('/', () => repo.getUsers())
    .get(':id', ({ params }) => repo.getUser(params.id))
    .post('/', ({ body }) => repo.createUser(
        body.name,
        body.email,
        body.password,
        body.role,
    ), { body: userDTO })
    .put(':id', ({ params, body }) => repo.editUser(params.id, body), { body: t.Partial(userDTO) })
    .delete(':id', ({ params }) => repo.deleteUser(params.id))
    .post('/login', ({ body }) => repo.loginUser(body.email, body.password), { body: t.Object({ email: t.String(), password: t.String() }) })

