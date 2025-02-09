const fs = require('fs');
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Create MySQL connection to Azure
const db = mysql.createConnection({
  host: 'your-database-name.mysql.database.azure.com', // Azure MySQL host
  user: 'your-username@your-database-name',             // Azure MySQL username (typically your username + database name)
  password: 'your-password',                           // Your MySQL password
  database: 'sentences_db',                            // The name of your database
  port: 3306,                                          // Default MySQL port
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'Azure-cert.pem')) // Optional: Provide SSL certificate if required by Azure
  }
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to Azure MySQL');
});

// Route to get sentences from the database
app.get('/api/sentences', (req, res) => {
  const query = 'SELECT text FROM sentences'; // Adjust table and column names if necessary
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sentences:', err);
      return res.status(500).json({ error: 'Failed to fetch sentences' });
    }
    const sentences = results.map(row => row.text);
    res.json(sentences);
  });
});

// Serve static files from the 'app' directory
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
