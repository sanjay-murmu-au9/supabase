export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
}

export interface Order {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    orderDate: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}