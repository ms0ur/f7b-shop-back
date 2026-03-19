import { randomUUIDv7 } from 'bun'
import argon2 from 'argon2'
import db from '../../db'
import { signAccess, signRefresh, verifyRefresh } from '../../plugins/jwt'

db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        token TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt INTEGER NOT NULL
    )
`)

export async function register(name: string, email: string, password: string) {
    const existing = db.query('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) return null

    const id = randomUUIDv7('hex')
    const hash = await argon2.hash(password)
    db.run(
        'INSERT INTO users (id, name, email, password, role, isBlocked, cart, orders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, email, hash, 'user', 0, '[]', '[]']
    )
    return db.query('SELECT id, name, email, role FROM users WHERE id = ?').get(id)
}

export async function login(email: string, password: string) {
    const user = db.query('SELECT * FROM users WHERE email = ?').get(email) as any
    if (!user) return null
    if (user.isBlocked) return null

    try {
        if (!(await argon2.verify(user.password, password))) return null
    } catch {
        return null
    }

    const accessToken = signAccess({ userId: user.id, role: user.role })
    const refreshToken = signRefresh({ userId: user.id, role: user.role })
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
    db.run(
        'INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ?)',
        [refreshToken, user.id, expiresAt]
    )

    return { accessToken, refreshToken }
}

export function refresh(refreshToken: string) {
    const stored = db.query('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken) as any
    if (!stored || stored.expiresAt < Date.now()) {
        if (stored) db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken])
        return null
    }

    const payload = verifyRefresh(refreshToken)
    if (!payload) return null

    const user = db.query('SELECT * FROM users WHERE id = ?').get(payload.userId) as any
    if (!user || user.isBlocked) return null

    db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken])

    const accessToken = signAccess({ userId: user.id, role: user.role })
    const newRefreshToken = signRefresh({ userId: user.id, role: user.role })
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
    db.run(
        'INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ?)',
        [newRefreshToken, user.id, expiresAt]
    )

    return { accessToken, refreshToken: newRefreshToken }
}

export function getMe(userId: string) {
    return db.query('SELECT id, name, email, role FROM users WHERE id = ?').get(userId)
}
