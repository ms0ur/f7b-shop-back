import { randomUUIDv7 } from "bun";
import db from "../../db";

interface IOrder {
    id: string,
    userId: string,
    products: string[],
    totalPrice: number,
    status: 'pending' | 'completed' | 'cancelled',
}

db.run(`
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    products TEXT NOT NULL,
    totalPrice REAL NOT NULL,
    status TEXT NOT NULL
)`)

export function getOrder(id: string): IOrder | null {
    return db.query("SELECT * FROM orders WHERE id = ?").get(id) as IOrder | null;
}

export function getOrders(): IOrder[] {
    return db.query("SELECT * FROM orders").all() as IOrder[];
}

export function createOrder(userId: string, products: string[], totalPrice: number, status: 'pending' | 'completed' | 'cancelled'): IOrder {
    const id = randomUUIDv7("hex")
    db.run(`
    INSERT INTO orders (id, userId, products, totalPrice, status)
    VALUES (?, ?, ?, ?, ?)
    `, [id, userId, JSON.stringify(products), totalPrice, status]);
    return getOrder(id)!;
}

export function editOrder(id: string, data: Partial<IOrder>): IOrder | null {
    const current = getOrder(id)
    if (!current) return null

    const updated = { ...current, ...data }
    db.run(`
    UPDATE orders
    SET userId = ?, products = ?, totalPrice = ?, status = ?
    WHERE id = ?
    `, [updated.userId, JSON.stringify(updated.products), updated.totalPrice, updated.status, id]);

    return updated
}

export function deleteOrder(id: string): boolean {
    const res = db.run("DELETE FROM orders WHERE id = ?", [id]);
    return res.changes > 0;
}
