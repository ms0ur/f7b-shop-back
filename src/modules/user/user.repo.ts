import { randomUUIDv7 } from "bun";
import db from "../../db";

interface IUser {
    id: string,
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'user',
    cart: string[],
    orders: string[],
}

db.run(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    cart TEXT NOT NULL,
    orders TEXT NOT NULL
)`)

export function getUser(id: string): IUser | null {
    return db.query("SELECT * FROM users WHERE id = ?").get(id) as IUser | null;
}

export function getUsers(): IUser[] {
    return db.query("SELECT * FROM users").all() as IUser[];
}

export async function createUser(name: string, email: string, password: string, role: 'admin' | 'user'): Promise<IUser> {
    const id = randomUUIDv7("hex")
    const hashedPassword = await Bun.password.hash(password)
    db.run(`
    INSERT INTO users (id, name, email, password, role, cart, orders)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name, email, hashedPassword, role, "[]", "[]"]);
    return getUser(id)!;
}

export function editUser(id: string, data: Partial<IUser>): IUser | null {
    const current = getUser(id)
    if (!current) return null

    const updated = { ...current, ...data }
    db.run(`
    UPDATE users
    SET name = ?, email = ?, password = ?, role = ?, cart = ?, orders = ?
    WHERE id = ?
    `, [updated.name, updated.email, updated.password, updated.role, JSON.stringify(updated.cart), JSON.stringify(updated.orders), id]);

    return updated
}

export function deleteUser(id: string): boolean {
    const res = db.run("DELETE FROM users WHERE id = ?", [id]);
    return res.changes > 0;
}

export async function loginUser(email: string, password: string): Promise<IUser | null> {
    const user = db.query("SELECT * FROM users WHERE email = ?").get(email) as IUser | null;
    if (!user) return null
    if (await Bun.password.verify(password, user.password)) return user
    return null
}