# API Documentation

This document provides information about the available API endpoints for frontend integration.

## Base URL

```
http://localhost:3000/api
```

Replace with your production URL when deploying.

## Authentication

Currently, the API doesn't require authentication. If you implement authentication in the future, update this section.

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request` - The request was invalid
- `404 Not Found` - The resource was not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message"
}
```

## API Endpoints

### User Endpoints

#### Get All Users

```
GET /api/users
```

Response:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "is_active": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  ...
]
```

#### Get User by ID

```
GET /api/users/:id
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "is_active": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Get User by Email

```
GET /api/users/email/:email
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "is_active": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Create User

```
POST /api/users
```

Request body:
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "is_active": true
}
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "is_active": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Update User

```
PUT /api/users/:id
```

Request body:
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Updated Name",
  "is_active": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Delete User

```
DELETE /api/users/:id
```

Response:
```
204 No Content
```

### Product Endpoints

#### Get All Products

```
GET /api/products
```

#### Get Product by ID

```
GET /api/products/:id
```

#### Get Products by Category

```
GET /api/products/category/:categoryId
```

#### Get In-Stock Products

```
GET /api/products/in-stock
```

#### Create Product

```
POST /api/products
```

Request body:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 19.99,
  "inventory_count": 100,
  "category_id": "category-uuid"
}
```

#### Update Product

```
PUT /api/products/:id
```

#### Delete Product

```
DELETE /api/products/:id
```

### Category Endpoints

#### Get All Categories

```
GET /api/categories
```

#### Get Category by ID

```
GET /api/categories/:id
```

#### Search Categories by Name

```
GET /api/categories/search?name=category-name
```

#### Create Category

```
POST /api/categories
```

Request body:
```json
{
  "name": "Category Name",
  "description": "Category Description"
}
```

#### Update Category

```
PUT /api/categories/:id
```

#### Delete Category

```
DELETE /api/categories/:id
```

## Frontend Integration Examples

### JavaScript Fetch API

```javascript
// Get all users
fetch('http://your-api-url/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Create a new user
fetch('http://your-api-url/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'new@example.com',
    name: 'New User',
    is_active: true
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://your-api-url/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
```