import express from 'express';
import { makePost, posts, postDetail, editPost, deletePost } from '../controllers/post-controller.js';
import multer from 'multer';
import { isAuthenticated } from '../middlewares/auth.js';
//* 게시글 반응, 댓글 등등.. 추가 해야함  

const router = express.Router();

// multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts/');  // 업로드 디렉토리 설정
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 게시글 
router.get('/', posts);
router.get('/:postId', postDetail);

// 인증이 필요한 라우트에 미들웨어 적용
router.post('/', isAuthenticated, upload.single('image'), makePost);
router.put('/:postId', isAuthenticated, upload.single('image'), editPost);
router.delete('/:postId', isAuthenticated, deletePost);


// 반응
//router.get('/:postId/likes', postLikes);

// 댓글 
//router.get('/:postId/comments', comments);
//router.post('/:psotId/comment', makeComment);

export default router; 

