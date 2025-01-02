import express from 'express';
import { 
    makePost, 
    posts, 
    postDetail, 
    editPost, 
    deletePost, 
    likePost, 
    likeCount,
    commentCount 
} from '../controllers/post-controller.js';
import { upload } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// 게시글 
router.get('/', isAuthenticated, posts);
router.get('/:postId', isAuthenticated, postDetail);

// 게시글 생성, 수정, 삭제
router.post('/', isAuthenticated, upload.single('image'), makePost);
router.put('/:postId', isAuthenticated, upload.single('image'), editPost);
router.delete('/:postId', isAuthenticated, deletePost);

// 좋아요 수
router.get('/:postId/like', isAuthenticated, likeCount);
router.post('/:postId/like', isAuthenticated, likePost);

// 댓글 수 
router.get('/:postId/comment', isAuthenticated, commentCount);

export default router; 

