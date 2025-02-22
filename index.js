import express from 'express';
import path from 'path';
import cors from 'cors'; 
import session from 'express-session';
import dotenv from 'dotenv'; 

// 라우트 
import authRoutes from './routes/auth-routes.js';
import postRoutes from './routes/post-routes.js';
import userRoutes from './routes/user-routes.js';
import commentRoutes from './routes/comment-routes.js';

// 데이터베이스 
import pool from './config/mariadb.js'; 

// 환경 변수 로드 
dotenv.config();

const app = express(); 
const __dirname = path.resolve();

// 데이터베이스 연결 체크 
pool.getConnection((err, connection) => {
    if (err) {
        console.error(`데이터베이스 연결 실패 : ${err}`);
    } else {
        console.log('데이터베이스 연결 성공');
        connection.release(); 
    }
});

// JSON 형식의 요청을 파싱하기 위한 미들웨어
app.use(express.json());

// FormData 형식의 요청을 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// trust proxy 설정
app.set('trust proxy', 1);

// CORS 설정
app.use(cors({
    origin: ['http://localhost:3000', 'http://hazel-grove.kro.kr:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));


// 세션 미들웨어 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

// 라우트 설정 
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);
app.use('/auth', authRoutes); 

// const PORT = process.env.PORT || 5001; 
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on port ${PORT}`);
// });
const PORT = 5001; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
    console.error('에러 발생 시간: ', new Date().toISOString());
    console.error('에러 메시지: ', err.message);
    console.error('에러 스택: ',err.stack);
    console.error('요청 URL', req.originalUrl);
    console.error('요청 메서드: ', req.method);
    console.error('요청 헤더: ', req.headers);
    console.error('요청 바디: ', req.body);

    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : '서버 에러 발생',
    });
});