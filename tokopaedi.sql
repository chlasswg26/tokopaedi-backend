CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	email VARCHAR(30) NOT NULL,
	password VARCHAR NOT NULL,
	picture VARCHAR(100),
	role TEXT NOT NULL DEFAULT 'buyer',
	store TEXT DEFAULT NULL,
	phone VARCHAR(15) DEFAULT NULL,
	refresh_token TEXT DEFAULT '',
	verification_code TEXT DEFAULT '',
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CHECK(role IN ('buyer', 'seller', 'admin')),
	UNIQUE(email, password)
);

CREATE TABLE categories (
	id SERIAL PRIMARY KEY,
	name VARCHAR(20) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
	id SERIAL PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	description VARCHAR NOT NULL,
	thumbnail VARCHAR(100) NOT NULL,
	price BIGINT DEFAULT 0,
	seller_id INT,
	category_id INT,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT seller FOREIGN KEY(seller_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT category FOREIGN KEY(category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE transactions (
	id SERIAL PRIMARY KEY,
	buyer_id INT,
	product_id INT,
	quantity INT NOT NULL,
	price BIGINT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CHECK(status IN ('pending', 'success', 'failed')),
	CONSTRAINT buyer FOREIGN KEY(buyer_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT product FOREIGN KEY(product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS
'
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
'
LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
