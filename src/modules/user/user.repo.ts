import { randomUUIDv7 } from 'bun'
import argon2 from 'argon2'
import db from '../../db'

export type Role = 'user' | 'seller' | 'admin'

interface IUser {
    id: string
    name: string
    email: string
    password: string
    role: Role
    isBlocked: number
    cart: string
    orders: string
}

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        isBlocked INTEGER NOT NULL DEFAULT 0,
        cart TEXT NOT NULL DEFAULT '[]',
        orders TEXT NOT NULL DEFAULT '[]'
    )
`)

try { db.run("ALTER TABLE users ADD COLUMN isBlocked INTEGER NOT NULL DEFAULT 0") } catch { }

export function getUser(id: string) {
    return db.query('SELECT id, name, email, role, isBlocked FROM users WHERE id = ?').get(id) as Omit<IUser, 'password' | 'cart' | 'orders'> | null
}

export function getUsers() {
    return db.query('SELECT id, name, email, role, isBlocked FROM users').all() as Omit<IUser, 'password' | 'cart' | 'orders'>[]
}

export async function createUser(name: string, email: string, password: string, role: Role = 'user') {
    const id = randomUUIDv7('hex')
    const hashedPassword = await argon2.hash(password)
    db.run(
        'INSERT INTO users (id, name, email, password, role, isBlocked, cart, orders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, role, 0, '[]', '[]']
    )
    return getUser(id)
}

export function editUser(id: string, data: Partial<Pick<IUser, 'name' | 'email' | 'role'>>) {
    const current = db.query('SELECT * FROM users WHERE id = ?').get(id) as IUser | null
    if (!current) return null

    const updated = { ...current, ...data }
    db.run(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [updated.name, updated.email, updated.role, id]
    )
    return getUser(id)
}

export function blockUser(id: string): boolean {
    const res = db.run('UPDATE users SET isBlocked = 1 WHERE id = ?', [id])
    return res.changes > 0
}
