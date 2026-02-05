-- PostgreSQL schema for Multifolks backend

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carts table (one row per user per product)
CREATE TABLE IF NOT EXISTS carts (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (user_id, product_id)
);

-- Optional: you can add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
