CREATE DATABASE IF NOT EXISTS shubham_shreyasi_project;
USE shubham_shreyasi_project;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  dob DATE,
  role VARCHAR(50) NOT NULL DEFAULT 'rescue',
  password VARCHAR(100)
);

INSERT INTO users (username, email, dob, role, password)
VALUES
  ('Shubham', 'shubham@gmail.com', '2003-11-21', 'admin', '123456'),
  ('Shreyasi', 'shreyasi@gmail.com', '2004-02-02', 'ngo', '123456');

SELECT * FROM users;
