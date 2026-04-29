DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  dob DATE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'rescue',
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, dob, role, password)
VALUES
  ('Shubham', 'shubham@gmail.com', '2003-11-21', 'admin', '123456'),
  ('Shreyasi', 'shreyasi@gmail.com', '2004-02-02', 'ngo', '123456'),
  ('Aarav Nair', 'aarav.nair@rescuenexus.in', '1998-06-14', 'rescue', '123456')
ON CONFLICT (email) DO NOTHING;

SELECT * FROM users;
