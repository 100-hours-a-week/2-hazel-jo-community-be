import express from 'express';
import path from 'path';
import cors from 'cors'; 
import authRoutes from './routes/auth-routes.js';
import postRoutes from './routes/post-routes.js';
import userRoutes from './routes/user-routes.js';
import commentRoutes from './routes/comment-routes.js';
import session from 'express-session';

const __dirname = path.resolve();
const app = express(); 

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
    secret: 'your-secret-key',  // * 추후 환경변수로 관리
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