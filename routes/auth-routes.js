import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { signup, login, getCurrentUser } from '../controllers/auth-controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router(); 

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        // 파일명에서 특수문자와 공백 제거
        const filename = file.originalname
            .replace(/\s+/g, '_')               // 공백을 언더스코어로
            .replace(/[()]/g, '')               // 괄호 제거
            .replace(/[^a-zA-Z0-9._-]/g, '')    // 알파벳, 숫자, 점, 언더스코어, 하이픈만 허용
        cb(null, Date.now() + '-' + filename);
    }
});
const upload = multer({ storage: storage });

// 회원가입, 로그인
router.post('/signup', upload.single('profileImage'), signup);
router.post('/login', login); 

// 현재 로그인한 사용자 정보 조회 라우트 추가
router.get('/current', getCurrentUser);

export default router; 
