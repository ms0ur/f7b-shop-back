import { Elysia } from 'elysia'
import { verifyAccess, JwtPayload } from './jwt'

export const authPlugin = new Elysia({ name: 'auth-plugin' })
    .derive({ as: 'scoped' }, ({ headers }) => {
        const auth = headers['authorization']
        const user: JwtPayload | null = auth?.startsWith('Bearer ')
            ? verifyAccess(auth.slice(7))
            : null
        return { user }
    })
