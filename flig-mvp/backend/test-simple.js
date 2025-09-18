const connection = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const sql = 'SELECT id, nome_empresa FROM estabelecimentos WHERE id = ?';
    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [8], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Query results:', results);
    
    if (results.length === 0) {
      console.log('❌ No establishment found with ID 8');
    } else {
      console.log('✅ Establishment found:', results[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();