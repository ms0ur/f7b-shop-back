import { Elysia, t } from 'elysia'
import * as repo from './user.repo'
import { authPlugin } from '../../plugins/auth.plugin'

export const user = new Elysia({ prefix: '/api/users' })
    .use(authPlugin)

    .get('/', ({ user: authUser, set }) => {
        if (!authUser) { set.status = 401; return { error: 'Unauthorized' } }
        if (authUser.role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
        return repo.getUsers()
    })

    .get('/:id', ({ user: authUser, set, params: { id } }) => {
        if (!authUser) { set.status = 401; return { error: 'Unauthorized' } }
        if (authUser.role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
        const result = repo.getUser(id)
        if (!result) { set.status = 404; return { error: 'Not found' } }
        return result
    })

    .put('/:id', ({ user: authUser, set, params: { id }, body }) => {
        if (!authUser) { set.status = 401; return { error: 'Unauthorized' } }
        if (authUser.role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
        const result = repo.editUser(id, body)
        if (!result) { set.status = 404; return { error: 'Not found' } }
        return result
    }, {
        body: t.Partial(t.Object({
            name: t.String(),
            email: t.String(),
            role: t.Union([t.Literal('user'), t.Literal('seller'), t.Literal('admin')]),
        }))
    })

    .delete('/:id', ({ user: authUser, set, params: { id } }) => {
        if (!authUser) { set.status = 401; return { error: 'Unauthorized' } }
        if (authUser.role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
        const success = repo.blockUser(id)
        if (!success) { set.status = 404; return { error: 'Not found' } }
        return { success: true }
    })
