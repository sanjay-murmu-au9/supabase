# Node.js TypeScript API with Supabase ORM

A scalable and maintainable Node.js API built with TypeScript and Supabase PostgreSQL integration, following clean architecture principles.

## Features

- TypeScript for type safety
- Express.js for API routes
- Supabase PostgreSQL integration
- Repository pattern for data access abstraction
- Service layer for business logic
- Dependency injection pattern
- Error handling middleware
- Request logging
- Environment configuration

## Project Structure

```
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Data models
│   ├── repositories/       # Data access layer
│   ├── routes/             # API routes
│   ├── services/           # Business logic layer
│   ├── types/              # TypeScript types and interfaces
│   ├── utils/              # Utility functions
│   └── app.ts              # Express app entry point
├── test/                   # Test files
├── .env                    # Environment variables (don't commit this)
├── .env.example            # Example environment variables
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Database Design

The project uses Supabase PostgreSQL with the following tables:

1. `users` - User information
2. `categories` - Product categories
3. `products` - Product information

## Getting Started

### Prerequisites

- Node.js 14+
- Supabase account and project

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Supabase URL and anon key:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   NODE_ENV=development
   ```

4. Create the necessary tables in your Supabase project (see schema below)

### Database Schema Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update_timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### Running the Application

Development mode:
```
npm run dev
```

Build and run in production:
```
npm run build
npm start
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/search?name=xyz` - Search categories by name
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/in-stock` - Get in-stock products
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Switching Database Providers

The repository pattern implemented in this project makes it easy to switch database providers:

1. Create a new implementation of the `BaseRepository` interface
2. Update the service classes to use the new implementation
3. Update the database configuration 

No changes needed at the controller or route level!