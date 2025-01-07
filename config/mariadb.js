import maria from 'mysql'; 
import dotenv from 'dotenv'; 

dotenv.config();

const connection = maria.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.on('error', (err) => {
    console.log(`데이터베이스 연결 실패 : ${err}`);
    console.error('데이터베이스 에러: ', err);
    console.error('에러 코드: ', err.code);
    console.error('에러 번호: ', err.errno);
    console.error('SQL 상태: ', err.sqlState);
});

export default connection; 
