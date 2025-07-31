const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

console.log('Process environments variables', process.env);

const dbConfig = {
    host: process.env.DB_HOST || 'sqldb-service',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'yourpassword',
    database: process.env.DB_NAME || 'demo_db',
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,          // Connection pooling
    acquireTimeout: 60000,
    queueLimit: 0
};

// Create a new database connection pool
const pool = mysql.createPool(dbConfig);

const generateHtmlTable = (results) => {
    let html = '<table border="1"><tr>';

    for (let column in results[0]) {
        html += `<th>${column}</th>`;
    }
    html += '</tr>';

    results.forEach(row => {
        html += '<tr>';
        for (let column in row) {
            html += `<td>${row[column]}</td>`;
        }
        html += '</tr>';
    });

    html += '</table>';
    return html;
};

// Route to fetch records
app.get('/records', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query('SELECT * FROM customer_details');
        res.json(results);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).send('Error fetching records');
    } finally {
        connection.release();
    }
});

// Show records in pagination format , loading 5 incrementally
app.get('/formatted-records', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        let offset = parseInt(req.query.offset) || 0;
        const [results] = await connection.query('SELECT * FROM customer_details LIMIT 5 OFFSET ?', [offset]);
        const htmlTable = generateHtmlTable(results);
        res.send(`
        <h1>Top Records</h1>
        ${htmlTable}
        <a href="/formatted-records?offset=${offset + 5}">More</a>
        <br>
        <a href="/">Back</a>
      `);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Something went wrong! Please try again later.');
    } finally {
        connection.release();
    }
});

// Landing welcome page route
app.get('/', (req, res) => {
    res.send(`
    <h1>Hello, Welcome !!</h1>
    <p>Available APIs:</p>
    <ul>
      <li><a href="/records">Records</a> - Get all records</li>
      <li><a href="/formatted-records">Incremental records</a> - Show incremental records</li>
    </ul>
  `);
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Something went wrong! Please try again later.');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

