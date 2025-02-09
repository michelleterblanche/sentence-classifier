const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Create MySQL connection to Azure
const db = mysql.createPool({
  host: process.env.DB_HOST,         // Azure MySQL server name (e.g., sent-classify-db.mysql.database.azure.com)
  user: process.env.DB_USER,         // DB username
  password: process.env.DB_PASSWORD, // DB password
  database: process.env.DB_NAME,                            // The name of your database
  port: 3306, 
  waitForConnections: true,
  connectionLimit: 10,          // Max number of connections
  queueLimit: 0,                                         // Default MySQL port
  ssl: {
    rejectUnauthorized: true
    //ca: fs.readFileSync(path.join(__dirname, 'Azure-cert.pem')) // Optional: Provide SSL certificate if required by Azure
  }
});

// Connect to MySQL

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to Azure MySQL with SSL');
});

// Route to get sentences from the database
app.get('/api/sentences', (req, res) => {
  const query = 'SELECT id, text FROM sentences ORDER BY RAND()';

  db.getConnection((err, connection) => {
      if (err) {
          console.error('❌ Database connection error:', err);
          return res.status(500).json({
              success: false,
              message: 'Database connection failed',
              error: err.message
          });
      }

      connection.query(query, (queryErr, results) => {
          connection.release(); // Release the connection back to the pool

          if (queryErr) {
              console.error('❌ Query error:', queryErr);
              return res.status(500).json({
                  success: false,
                  message: 'Failed to fetch sentences',
                  error: queryErr.message
              });
          }

          console.log('✅ Sentences fetched:', results);
          res.json(results);
      });
  });
});

// Route to handle user responses and update the database
app.post('/api/submit-answer', (req, res) => {
  const { sentenceId, isCorrect } = req.body; // Expecting sentenceId and whether it's correct or not
  const columnToUpdate = isCorrect ? 'correct_count' : 'incorrect_count';
  
  // Update the correct/incorrect count for the specific sentence
  const query = `UPDATE test SET ${columnToUpdate} = ${columnToUpdate} + 1 WHERE id = ?`;
  
  db.query(query, [sentenceId], (err, results) => {
    if (err) {
      console.error('Error updating answer counts:', err);
      return res.status(500).json({ error: 'Failed to update answer counts' });
    }
    res.json({ message: 'Answer submitted successfully' });
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