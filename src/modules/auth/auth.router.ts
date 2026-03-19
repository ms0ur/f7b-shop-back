import { Elysia, t } from 'elysia'
import * as repo from './auth.repo'
import { authPlugin } from '../../plugins/auth.plugin'

export const auth = new Elysia({ prefix: '/api/auth' })
    .post('/register', async ({ body, set }) => {
        const result = await repo.register(body.name, body.email, body.password)
        if (!result) {
            set.status = 409
            return { error: 'Email already in use' }
        }
        return result
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String(),
        })
    })

    .post('/login', async ({ body, set }) => {
        const result = await repo.login(body.email, body.password)
        if (!result) {
            set.status = 401
            return { error: 'Invalid credentials' }
        }
        return result
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
        })
    })

    .post('/refresh', ({ headers, set }) => {
        const token = headers['authorization']?.replace('Bearer ', '')
        if (!token) {
            set.status = 400
            return { error: 'Refresh token required' }
        }
        const result = repo.refresh(token)
        if (!result) {
            set.status = 401
            return { error: 'Invalid or expired refresh token' }
        }
        return result
    })

    .use(authPlugin)
    .get('/me', ({ user, set }) => {
        if (!user) {
            set.status = 401
            return { error: 'Unauthorized' }
        }
        const result = repo.getMe(user.userId)
        if (!result) {
            set.status = 404
            return { error: 'User not found' }
        }
        return result
    })
