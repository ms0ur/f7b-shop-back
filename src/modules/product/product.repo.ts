import db from "../../db";
import { randomUUIDv7 } from "bun";

interface IProduct {
    id: string,
    name: string,
    img: string,
    description: string,
    actualPrice: number,
    previousPrice?: number | null,
}

db.run(`
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    img TEXT NOT NULL,
    description TEXT NOT NULL,
    actualPrice REAL NOT NULL,
    previousPrice REAL
)
`);

const seedIfNeeded = () => {
    const count = db.query("SELECT COUNT(*) as count FROM products").get() as { count: number };
    if (count.count === 0) {
        db.run(`
        INSERT INTO products (id, name, img, description, actualPrice, previousPrice)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [
            '1',
            'Чайник',
            'https://upload.wikimedia.org/wikipedia/ru/thumb/8/8b/%D0%A7%D0%B0%D0%B9%D0%BD%D0%B8%D0%BA_%D1%8D%D0%BC%D0%B0%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0_%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%BB%D0%B8%D1%82%D0%B5.JPG/250px-%D0%A7%D0%B0%D0%B9%D0%BD%D0%B8%D0%BA_%D1%8D%D0%BC%D0%B0%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0_%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%BB%D0%B8%D1%82%D0%B5.JPG',
            'крутой чайник',
            1800,
            2700
        ]);
    }
};

seedIfNeeded();

export function getProduct(id: string): IProduct | null {
    return db.query("SELECT * FROM products WHERE id = ?").get(id) as IProduct | null;
}

export function getProducts(): IProduct[] {
    return db.query("SELECT * FROM products").all() as IProduct[];
}

export function createProduct(name: string, description: string, actualPrice: number, previousPrice?: number, img?: string): IProduct {
    const id = randomUUIDv7("hex")
    const finalImg = img ? img : "https://placehold.co/600x400.png"
    db.run(`
    INSERT INTO products (id, name, img, description, actualPrice, previousPrice)
    VALUES (?, ?, ?, ?, ?, ?)
    `, [id, name, finalImg, description, actualPrice, previousPrice ?? null]);
    return getProduct(id)!
}

export function editProduct(id: string, data: Partial<IProduct>): IProduct | null {
    const current = getProduct(id)
    if (!current) return null

    const updated = { ...current, ...data }
    db.run(`
    UPDATE products
    SET name = ?, img = ?, description = ?, actualPrice = ?, previousPrice = ?
    WHERE id = ?
    `, [updated.name, updated.img, updated.description, updated.actualPrice, updated.previousPrice ?? null, id]);

    return updated
}

export function deleteProduct(id: string): boolean {
    const res = db.run("DELETE FROM products WHERE id = ?", [id]);
    return res.changes > 0;
}

export function searchProduct(query: string): IProduct[] {
    return db.query("SELECT * FROM products WHERE name LIKE ?").all(`%${query}%`) as IProduct[];
}

export function generateProductsFromFakerJs(count: number) {
    const { faker } = require('@faker-js/faker');
    for (let i = 0; i < count; i++) {
        createProduct(
            faker.commerce.productName(),
            faker.commerce.productDescription(),
            Number(faker.commerce.price()),
            Number(faker.commerce.price()),
            faker.image.url()
        );
    }
}