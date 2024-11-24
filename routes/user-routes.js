import express from 'express'; 
import multer from 'multer'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { logout, editProfile, editPassword, deleteUser, getUserProfile } from '../controllers/user-controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router(); 

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const filename = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, Date.now() + '-' + filename);
    }
});
const upload = multer({ storage: storage });

// 라우터 
router.get('/profile/:userId', getUserProfile); 
router.put('/profile/:userId', upload.single('profileImage'), editProfile);
router.patch('/password/:userId', editPassword);
router.post('/:userId', logout);
router.delete('/:userId', deleteUser);

export default router; 