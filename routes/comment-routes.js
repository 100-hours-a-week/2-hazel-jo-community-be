import express from 'express';
import { 
    makeComment, 
    getComments, 
    deleteComment, 
    editComment 
} from '../controllers/comment-controller.js';
import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router();

router.get('/:postId', isAuthenticated, getComments);
router.post('/:postId', isAuthenticated, makeComment);
router.delete('/:postId/comments/:commentId', isAuthenticated, deleteComment);
router.patch('/:commentId', isAuthenticated, editComment);



export default router; 