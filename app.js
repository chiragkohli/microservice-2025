const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

console.log('Process environments variables', process.env);

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

// Create a new database connection
const createDbConnection = () => {
    return mysql.createConnection(dbConfig);
};

let dbConnection;

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

app.use((req, res, next) => {
    if (!dbConnection) {
        dbConnection = createDbConnection();

        dbConnection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err);
                dbConnection = null;
                next();
            } else {
                console.log('Connected to the MySQL database.');
                next();
            }
        });
    } else {
        next();
    }
});

// Route to fetch records
app.get('/records', (req, res) => {

    if (!dbConnection) {
        res.status(500).send('Something went wrong! Please try again later.');
        return;
    }

    const query = 'SELECT * FROM customer_details';
    dbConnection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching records:', error);
            res.status(500).send('Error fetching records');
            return;
        }
        res.json(results);
    });
});

// Show records in pagination format , loading 5 incrementally
app.get('/formatted-records', (req, res) => {
    if (!dbConnection) {
        res.status(500).send('Something went wrong! Please try again later.');
        return;
    }

    let offset = parseInt(req.query.offset) || 0;

    dbConnection.query('SELECT * FROM customer_details LIMIT 5 OFFSET ?', [offset], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Something went wrong! Please try again later.');
        } else {
            const htmlTable = generateHtmlTable(results);
            res.send(`
        <h1>Top Records</h1>
        ${htmlTable}
        <a href="/formatted-records?offset=${offset + 5}">More</a>
        <br>
        <a href="/">Back</a>
      `);
        }
    });
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