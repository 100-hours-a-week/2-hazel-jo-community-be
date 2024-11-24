import express from 'express';
import { makeComment, getComments, deleteComment, editComment } from '../controllers/comment-controller.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', makeComment);
router.delete('/:commentId', deleteComment);
router.patch('/:commentId', editComment);



export default router; 