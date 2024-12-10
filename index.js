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
import connection from './config/mariadb.js'; 

// 환경 변수 로드 
dotenv.config();

const app = express(); 
const __dirname = path.resolve();

// 데이터베이스 연결 
connection.connect((err) => {
    if(err) {
        console.log(`데이터베이스 연결 실패 : ${err}`);
    } else {
        console.log(`데이터베이스 연결 성공`); 
    }
});

// JSON 형식의 요청을 파싱하기 위한 미들웨어
app.use(express.json());

// FormData 형식의 요청을 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000',
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
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

// 라우트 설정 
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);
app.use('/auth', authRoutes); 

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});