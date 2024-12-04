import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commentsFilePath = path.join(__dirname, '../data/comments.json');

// JSON 파일에서 댓글 데이터 불러오는 함수 
export const loadCommentsData = () => {
    if(!fs.existsSync(commentsFilePath)) {
        return { comments: [] };
    }
    const data = fs.readFileSync(commentsFilePath);
    return JSON.parse(data);
}

// 댓글 목록 불러오기 
export const getComments = (req, res) => {
    try {
        const { postId } = req.params;
        const commentsData = loadCommentsData();
        const filteredComments = commentsData.comments.filter(
            comment => comment.post_id === postId
        );
        
        return res.status(200).json({
            comments: filteredComments
        });
    } catch (error) {
        return res.status(500).json({
            message: '댓글을 불러오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}

// JSON 파일에 댓글 데이터 저장하는 함수 
export const saveCommentsData = (comments) => {
    fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2));
}


// 댓글 작성 makeComment
export const makeComment = (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        // 로그인 체크 
        if(!req.session.user) {
            return res.status(401).json({
                message: '로그인이 필요합니다.'
            });
        }

        if(!content) {
            return res.status(400).json({
                message: '댓글 내용을 입력해주세요.'
            });
        }

        // 세션에서 사용자 정보 가져오기
        const { userId, nickname, profile_image } = req.session.user;

        const commentsData = loadCommentsData();
        const newComment = {
            // 댓글 id 생성 
            comment_id: commentsData.comments.length > 0 
                ? commentsData.comments[commentsData.comments.length - 1].comment_id + 1 
                : 1,
            post_id: postId,
            user_nickname: nickname,
            profile_image: profile_image,  
            user_id: userId,
            content,
            date: new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\. /g, '-').replace('.', '')
        };

        commentsData.comments.push(newComment);
        saveCommentsData(commentsData);

        return res.status(201).json({
            message: '댓글이 성공적으로 작성되었습니다.',
            comment: newComment
        });
    } catch (error) {
        return res.status(500).json({
            message: '댓글 작성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}

// 댓글 삭제 deleteComment
export const deleteComment = (req, res) => {    
        const { commentId } = req.params;
        const userId = req.session.user.userId;

        const commentsData = loadCommentsData();
        const commentIndex = commentsData.comments.findIndex(comment => comment.comment_id === Number(commentId));

        if(commentIndex === -1) {
            return res.status(404).json({
                message: '댓글을 찾을 수 없습니다.'
            });
        }

        // 댓글 작성자와 삭제 요청자가 다른 경우 : user_id를 숫자로 변환하여 비교
        if(Number(commentsData.comments[commentIndex].user_id) !== userId) {
            return res.status(401).json({
                message: '해당 댓글 삭제 권한이 없습니다.'
            });
        }

        // 댓글 삭제 
        commentsData.comments.splice(commentIndex, 1);
        try {
            saveCommentsData(commentsData);
            return res.status(200).json({
                message: '댓글이 삭제되었습니다.'
            });
        } catch (error) {
            return res.status(500).json({
            message: '댓글 삭제에 실패했습니다.'
        });
    }
}

// 댓글 수정 editComment
export const editComment = (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.session.user.userId;

    const commentsData = loadCommentsData();
    const commentIndex = commentsData.comments.findIndex(comment => comment.comment_id === Number(commentId));

    if(commentIndex === -1) {
        return res.status(404).json({
            message: '댓글을 찾을 수 없습니다.'
        });
    }

    // 댓글 작성자와 수정 요청자가 다를 경우 
    if(Number(commentsData.comments[commentIndex].user_id) !== userId) {
        return res.status(401).json({
            message: '해당 댓글 수정 권한이 없습니다.'
        });
    }

    commentsData.comments[commentIndex].content = content;
    try {
        saveCommentsData(commentsData);
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


