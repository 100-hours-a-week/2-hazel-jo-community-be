import express from 'express';
import { makePost, posts, postDetail, editPost, deletePost } from '../controllers/post-controller.js';
import multer from 'multer';
import { isAuthenticated } from '../middlewares/auth.js';
import { likeCount, likePost, viewCount } from '../controllers/post-controller.js';
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

// 게시글 생성, 수정, 삭제
// 인증이 필요한 라우트에 미들웨어 적용
router.post('/', isAuthenticated, upload.single('image'), makePost);
router.put('/:postId', isAuthenticated, upload.single('image'), editPost);
router.delete('/:postId', isAuthenticated, deletePost);


// 좋아요 수
router.get('/:postId/like', likeCount);
router.post('/:postId/like', likePost);

// 조회수
router.get('/:postId/view', viewCount);

// 댓글 
//router.get('/:postId/comments', comments);
//router.post('/:psotId/comment', makeComment);

export default router; 

