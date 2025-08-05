const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

console.log('Process environments variables', process.env);

const dbConfig = {
    host: process.env.DB_HOST || 'sqldb-service',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'demo_db',
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,          // Connection pooling
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create a new database connection pool
const pool = mysql.createPool(dbConfig);


const generateStyledHtmlTable = (results) => {
    if (!results || results.length === 0) {
        return '<p style="text-align: center; color: #666;">No records found.</p>';
    }

    let html = `
    <style>
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            font-size: 14px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
        }
        .data-table th { 
            background-color: #007bff; 
            color: white; 
            padding: 12px 8px; 
            text-align: left; 
            font-weight: bold; 
            border-bottom: 2px solid #0056b3; 
        }
        .data-table td { 
            padding: 10px 8px; 
            border-bottom: 1px solid #ddd; 
        }
        .data-table tr:nth-child(even) { 
            background-color: #f8f9fa; 
        }
        .data-table tr:hover { 
            background-color: #e3f2fd; 
        }
        .data-table td:first-child { 
            font-weight: bold; 
            color: #007bff; 
        }
        @media (max-width: 768px) {
            .data-table { 
                font-size: 12px; 
            }
            .data-table th, .data-table td { 
                padding: 8px 4px; 
            }
        }
    </style>
    <table class="data-table">
        <thead>
            <tr>`;

    // Add table headers
    for (let column in results[0]) {
        html += `<th>${column.replace(/_/g, ' ').toUpperCase()}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Add table rows
    results.forEach(row => {
        html += '<tr>';
        for (let column in row) {
            let value = row[column];
            // Format dates nicely
            if (column === 'created_at' && value instanceof Date) {
                value = value.toLocaleDateString() + ' ' + value.toLocaleTimeString();
            }
            html += `<td>${value || 'N/A'}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
};

// Route to fetch records in JSON format
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

// Show Formatted records in HTML table format
app.get('/formatted-records', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query('SELECT * FROM customer_details');
        const htmlTable = generateStyledHtmlTable(results);
        res.send(`
        <h1>Records</h1>
        ${htmlTable}
        <br>
        <a href="/">Back</a>
      `);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Something went wrong!!');
    } finally {
        connection.release();
    }
});

// Welcome page route
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Microservice API</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 300;
        }
        .content {
          padding: 40px;
        }
        .api-list {
          list-style: none;
          padding: 0;
        }
        .api-item {
          margin: 15px 0;
        }
        .api-link {
          display: block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          text-decoration: none;
          border-radius: 8px;
          transition: transform 0.3s ease;
          font-weight: 500;
        }
        .api-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .api-description {
          margin-top: 5px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to Microservice API</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #666; text-align: center; margin-bottom: 30px;">
            Choose an API endpoint to explore customer data
          </p>
          <ul class="api-list">
            <li class="api-item">
              <a href="/records" class="api-link">📊 /records - JSON Data</a>
              <p class="api-description">Get all customer records in JSON format</p>
            </li>
            <li class="api-item">
              <a href="/formatted-records" class="api-link">📋 /formatted-records - Formatted Table</a>
              <p class="api-description">View customer records in a beautifully formatted HTML table</p>
            </li>
          </ul>
        </div>
      </div>
    </body>
    </html>
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

