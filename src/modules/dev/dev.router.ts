import { Elysia, t } from 'elysia'
import db from '../../db'
import { signAccess, signRefresh } from '../../plugins/jwt'

const ROLES = ['user', 'seller', 'admin'] as const
type Role = typeof ROLES[number]

export const dev = new Elysia({ prefix: '/api/dev' })
    .post('/set-role', ({ body, set }) => {
        const user = db.query('SELECT id, name, email, role FROM users WHERE id = ?').get(body.userId) as any
        if (!user) {
            set.status = 404
            return { error: 'User not found' }
        }

        db.run('UPDATE users SET role = ? WHERE id = ?', [body.role, user.id])

        const accessToken = signAccess({ userId: user.id, role: body.role })
        const refreshToken = signRefresh({ userId: user.id, role: body.role })
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
        db.run(
            'INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ?)',
            [refreshToken, user.id, expiresAt]
        )

        return { accessToken, refreshToken }
    }, {
        body: t.Object({
            userId: t.String(),
            role: t.Union(ROLES.map(r => t.Literal(r))),
        })
    })
