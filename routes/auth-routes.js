import express from 'express';
import { upload } from '../middlewares/multer.js'
import { signup, login } from '../controllers/auth-controller.js';
import { getCurrentUser } from '../controllers/user-controller.js';

const router = express.Router(); 


// 회원가입, 로그인
router.post('/signup', upload.single('profileImage'), signup);
router.post('/login', login); 

// 현재 로그인한 사용자 정보 조회
router.get('/current', getCurrentUser);

export default router; 
