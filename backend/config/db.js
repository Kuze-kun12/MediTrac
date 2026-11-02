const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: '',
  port: 3306,
  waitForConnections: true,
});
 