import { randomUUIDv5, randomUUIDv7 } from "bun";

interface IProduct {
    id: string,
    name: string,
    img: string,
    description: string,
    actualPrice: number,
    previousPrice?: number,
}

const Products: IProduct[] = [
    {
        id:'1',
        name:'Чайник',
        img: 'https://upload.wikimedia.org/wikipedia/ru/thumb/8/8b/%D0%A7%D0%B0%D0%B9%D0%BD%D0%B8%D0%BA_%D1%8D%D0%BC%D0%B0%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0_%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%BB%D0%B8%D1%82%D0%B5.JPG/250px-%D0%A7%D0%B0%D0%B9%D0%BD%D0%B8%D0%BA_%D1%8D%D0%BC%D0%B0%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BD%D0%B0_%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%BB%D0%B8%D1%82%D0%B5.JPG',
        description: 'крутой чайник',
        actualPrice: 1800,
        previousPrice: 2700
    }
];

export function getProduct(id: string):IProduct | null {
    const res = Products.find((p: IProduct) => p.id == id )
    if (res === undefined) return null
    return res
}

export function getProducts():IProduct[] {
    return Products
}

export function createProduct(name: string, description: string, actualPrice: number, previousPrice?: number, img?: string): IProduct {
    const id = randomUUIDv7("hex")
    Products.push({
        id,
        name,
        img: img ? img : "https://placehold.co/600x400.png",
        description,
        actualPrice,
        previousPrice
    })
    return getProduct(id)!
}

export function editProduct(id: string, data: Partial<Omit<IProduct, 'id'>>): IProduct | null {
    const index = Products.findIndex((p) => p.id === id)
    if (index === -1) return null
    
    Products[index] = {
        ...Products[index],
        ...data
    }
    return Products[index]
}

export function deleteProduct(id: string): boolean {
    const index = Products.findIndex((p) => p.id === id)
    if (index === -1) return false

    Products.splice(index, 1)
    return true
}

