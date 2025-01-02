import { 
    loadCommentsData, 
    createComment, 
    deleteCommentById, 
    updateComment,
    updateCommentCount, 
    getCommentById,
} from '../models/comment-model.js';

// 댓글 목록 불러오기 
export const getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await loadCommentsData(postId);
        return res.status(200).json({ comments });
    } catch (error) {
        return res.status(500).json({
            message: '댓글을 불러오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}


// 댓글 작성 makeComment
export const makeComment = async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    // 내용 입력 여부 체크 
    if(!content) {
        return res.status(400).json({
            message: '댓글 내용을 입력해주세요.'
        });
    }
    
    try {
        // 세션에서 사용자 정보 가져오기
        const { userId } = req.session.user;
        const commentId = await createComment({ postId, userId, content });
        
        await updateCommentCount(postId, 'add');        
        return res.status(201).json({
            message: '댓글이 성공적으로 작성되었습니다.',
            comment: {
                comment_id: commentId,
                post_id: postId,
                user_id: userId,
                content,
                created_at: new Date().toISOString(), 
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: '댓글 작성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}

// 댓글 삭제 deleteComment
export const deleteComment = async (req, res) => {    
    const { postId, commentId } = req.params;
    const { userId } = req.session.user;

    try {
        await vertifyCommentWriter(commentId, postId, userId);
        const affectedRows = await deleteCommentById({ commentId, userId });
        
        if(affectedRows === 0) {
            return res.status(404).json({
                message: '작성자가 아니면 댓글을 삭제 할 권한이 없습니다.'
            });
        }
        await updateCommentCount(postId, 'delete');
        return res.status(200).json({
            message: '댓글이 삭제되었습니다.'
        });
    } catch (error) {
        return res.status(500).json({
            message: '댓글 삭제에 실패했습니다.',
            error: error.message
        });
    }
}

// 댓글 수정 editComment
export const editComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const { userId } = req.session.user;

    if(!content) {
        return res.status(404).json({
            message: '댓글을 찾을 수 없습니다.'
        });
    }

    try { 
        await getCommentById(commentId, userId);
        const affectedRows = await updateComment({ commentId, userId, content });
        if(affectedRows === 0) {
            return res.status(403).json({
            message: '작성자가 아니면 댓글을 수정할 권한이 없습니다.'
            });
        }
        return res.status(200).json({
            message: '댓글이 수정되었습니다.'
        });
    } catch (error) {
        return res.status(500).json({
            message: '댓글 수정에 실패했습니다.',
            error: error.message
        });
    }
}

// 댓글 작성자 검증 vertifyCommentWriter
export const vertifyCommentWriter = async(commentId, postId, userId) => {
    if(!postId) {
        throw new Error('게시글을 찾을 수 없습니다');
    }
    const comments = await loadCommentsData(postId); 
    const comment = comments.find((comment) => comment.comment_id === parseInt(commentId, 10));
    if(!comment) {
        throw new Error('댓글을 찾을 수 없습니다.');
    }
    if(comment.user_id !== userId) {
        throw new Error('해당 댓글에 대한 권한이 없습니다.');
    }
    return comment; 
}


