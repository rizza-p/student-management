const express = require('express');
const mysql = require('mysql2');

const app = express();

// Connect to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_management'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Express settings
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Check the student data before saving
function validateStudent(data) {
  const errors = [];
  const { student_id, first_name, last_name, course, year_level, email } = data;

  if (!student_id || !student_id.trim()) errors.push('Student ID is required.');
  if (!first_name || !first_name.trim()) errors.push('First name is required.');
  if (!last_name || !last_name.trim()) errors.push('Last name is required.');
  if (!course || !course.trim()) errors.push('Course is required.');

  const year = Number(year_level);
  if (!Number.isInteger(year) || year < 1 || year > 5) {
    errors.push('Year level must be a whole number from 1 to 5.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  return errors;
}

// Student list page
app.get('/', (req, res) => {
  db.query('SELECT * FROM students ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('index', {
      students: results
    });
  });
});

// Delete a student
app.post('/students/delete/:id', (req, res) => {
  db.query('DELETE FROM students WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to delete student');
    }
    res.redirect('/');
  });
});

// Start the server (keep this at the bottom)

// Show the Edit form with the student's current data
app.get('/students/edit/:id', (req, res) => {
  db.query('SELECT * FROM students WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }
    res.render('edit', { student: results[0], errors: [] });
  });
});

// Save the changes
app.post('/students/edit/:id', (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length > 0) {
    return res.render('edit', {
      errors,
      student: { ...req.body, id: req.params.id }
    });
  }

  const { student_id, first_name, last_name, course, year_level, email } = req.body;

  const sql = `
    UPDATE students
    SET student_id = ?, first_name = ?, last_name = ?,
        course = ?, year_level = ?, email = ?
    WHERE id = ?
  `;
  const values = [student_id.trim(), first_name.trim(), last_name.trim(),
                  course.trim(), year_level, email.trim(), req.params.id];

  db.query(sql, values, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.render('edit', {
          errors: ['That Student ID already exists.'],
          student: { ...req.body, id: req.params.id }
        });
      }
      console.error(err);
      return res.status(500).send('Unable to update student');
    }
    res.redirect('/');
  });
});

// Search students
app.get('/students/search', (req, res) => {
  const keyword = req.query.keyword || '';

  const sql = `
    SELECT * FROM students
    WHERE student_id LIKE ?
    OR first_name LIKE ?
    OR last_name LIKE ?
    OR course LIKE ?
  `;

  const searchValue = `%${keyword}%`;

  db.query(
    sql,
    [searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Search error');
      }
      res.render('index', {
        students: results
      });
    }
  );
});

// Show the Add Student form
app.get('/students/add', (req, res) => {
  res.render('add', { errors: [], student: {} });
});

// Save the new student
app.post('/students/add', (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length > 0) {
    return res.render('add', { errors, student: req.body });
  }

  const { student_id, first_name, last_name, course, year_level, email } = req.body;

  const sql = `
    INSERT INTO students
    (student_id, first_name, last_name, course, year_level, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [student_id.trim(), first_name.trim(), last_name.trim(),
                  course.trim(), year_level, email.trim()];

  db.query(sql, values, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.render('add', {
          errors: ['That Student ID already exists.'],
          student: req.body
        });
      }
      console.error(err);
      return res.status(500).send('Unable to save student');
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});