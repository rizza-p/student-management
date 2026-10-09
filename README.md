# Student Management System

A simple web-based Student Management System developed using:

- Node.js
- Express.js
- EJS
- MySQL
- Git
- GitHub

## Features

- View students
- Add students
- Edit students
- Delete students
- Search students
- Form validation (required fields, valid email, year level 1-5, unique Student ID)

## Installation

1. Clone the repository:

```
git clone https://github.com/rizza-p/student-management.git
```

2. Go into the folder and install the dependencies:

```
cd student-management
npm install
```

3. Start XAMPP and turn on MySQL. Open phpMyAdmin and run:

```sql
CREATE DATABASE student_management;
USE student_management;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  year_level INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. If your MySQL root account has a password, update the connection in `app.js`.

5. Run the app:

```
node app.js
```

6. Open http://localhost:3000 in your browser.

## Author

Rizza
