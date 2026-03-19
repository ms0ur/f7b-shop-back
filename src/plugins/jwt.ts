import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key'

export interface JwtPayload {
    userId: string
    role: string
}

export function signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

export function signRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccess(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JwtPayload
    } catch {
        return null
    }
}

export function verifyRefresh(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as JwtPayload
    } catch {
        return null
    }
}
