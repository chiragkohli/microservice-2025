const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

// Creating Database Connection
const createDbConnection = () => {
  return mysql.createConnection(dbConfig);
};

let dbConnection;

const generateHtmlTable = (results) => {
  if (!results || results.length === 0) {
    return '<p style="text-align: center; color: #666;">No records found</p>';
  }

  let html = `
    <style>
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 16px;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      .data-table thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .data-table th {
        padding: 15px 12px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
      }
      .data-table td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
        transition: background-color 0.3s ease;
      }
      .data-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      .data-table tbody tr:hover {
        background-color: #e3f2fd;
        transform: scale(1.01);
        transition: all 0.3s ease;
      }
      .data-table tbody tr:last-child td {
        border-bottom: none;
      }
      .record-count {
        text-align: center;
        margin: 10px 0;
        color: #666;
        font-style: italic;
      }
    </style>
    <div class="record-count">Total Records: ${results.length}</div>
    <table class="data-table">
      <thead>
        <tr>`;
  
  // Generate table headers
  for (let column in results[0]) {
    const formattedColumnName = column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    html += `<th>${formattedColumnName}</th>`;
  }
  html += '</tr></thead><tbody>';

  // Generate table rows
  results.forEach(row => {
    html += '<tr>';
    for (let column in row) {
      let cellValue = row[column];
      
      // Format different data types
      if (cellValue === null) {
        cellValue = '<span style="color: #999; font-style: italic;">N/A</span>';
      } else if (column.includes('email')) {
        cellValue = `<a href="mailto:${cellValue}" style="color: #1976d2; text-decoration: none;">${cellValue}</a>`;
      } else if (column.includes('phone')) {
        cellValue = `<a href="tel:${cellValue}" style="color: #1976d2; text-decoration: none;">${cellValue}</a>`;
      } else if (column.includes('date') || column.includes('time')) {
        cellValue = new Date(cellValue).toLocaleString();
      }
      
      html += `<td>${cellValue}</td>`;
    }
    html += '</tr>';
  });

  html += '</tbody></table>';
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

// Route to Get records
app.get('/records', (req, res) => {

  if (!dbConnection) {
    res.status(500).send('Something went wrong! Please try again later.');
    return;
  }

  const query = 'SELECT * FROM customer_accounts';
  dbConnection.query(query, (error, results) => {
    if (error) {
      res.status(500).send('Error fetching records');
      return;
    }
    res.json(results);
  });
});

// Route to Get Formatted Records
app.get('/formatted-records', (req, res) => {
  if (!dbConnection) {
    res.status(500).send('Something went wrong!');
    return;
  }

  const query = 'SELECT * FROM customer_accounts';

  dbConnection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Something went wrong!');
    } else {
      const htmlTable = generateHtmlTable(results);
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Customer Records</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5rem;
              font-weight: 300;
            }
            .content {
              padding: 30px;
            }
            .back-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
              transition: transform 0.3s ease;
              font-weight: 500;
            }
            .back-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Customer Records</h1>
            </div>
            <div class="content">
              ${htmlTable}
              <a href="/" class="back-button">← Back to Home</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  });
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

// Generic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something went wrong! Please try again later.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});