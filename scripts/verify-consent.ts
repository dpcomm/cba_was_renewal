import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.214',
      user: 'root',
      password: '1234',
      database: 'cbaapp',
    });

    console.log('Connected to MySQL database!');

    const [rows] = await connection.execute('SELECT * FROM user_consents LIMIT 10');
    console.log('Data from user_consents:', rows);

    const [schema] = await connection.execute('DESCRIBE user_consents');
    console.log('Schema of user_consents:', schema);

    await connection.end();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

main();
