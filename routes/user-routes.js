import express from 'express'; 
import { 
    logout, 
    editProfile, 
    editPassword, 
    deleteUser, 
    getCurrentUser 
} from '../controllers/user-controller.js';
import { upload } from '../middlewares/multer.js'
import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router(); 

// 라우터 
router.get('/profile/:userId', isAuthenticated, getCurrentUser); 
router.put('/profile/:userId', isAuthenticated, upload.single('profileImage'), editProfile);
router.patch('/password/:userId', isAuthenticated, editPassword);
router.post('/:userId', logout);
router.delete('/:userId', deleteUser);

export default router; 