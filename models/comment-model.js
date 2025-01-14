import pool from '../config/mariadb.js'; 

// 댓글 목록 loadCommentsData
export const loadCommentsData = async (postId) => {
    const query = `
        SELECT c.comment_id, c.post_id, c.user_id, c.content, c.created_at,
                u.nickname AS user_nickname, u.profileImg AS profile_image
        FROM comment c
        LEFT JOIN users u ON c.user_id = u.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC 
    `;
    const [results] = await pool.query(query, [postId]);
    return results; 
}; 


// 댓글 조회 getCommentById
export const getCommentById = async (commentId, userId) => {
    try {
        const query = `SELECT user_id FROM comment WHERE comment_id = ? AND user_id = ?`;
        const [results] = await pool.query(query, [commentId, userId]);
        return results[0]; 
    } catch (error) {
        console.error('getCommentById 에러: ', error);
        throw error; 
    }
};


// 댓글 생성 createComment
export const createComment = async ({ postId, userId, content }) => {
    const query = `
            INSERT INTO comment (post_id, user_id, content)
            VALUES (?, ?, ?)
        `;
    const [results] = await pool.query(query, [postId, userId, content]);
    return results; 
};


// 댓글 삭제 deleteCommentById
export const deleteCommentById = async ({ commentId, userId }) => {
    const query = `
            DELETE FROM comment WHERE comment_id = ? AND user_id = ?
        `;
    const [results] = await pool.query(query, [commentId, userId]);
    return results.affectedRows;
};


// 댓글 수정 updateComment
export const updateComment = async ({ commentId, userId, content }) => {
    const query = `
        UPDATE comment SET content = ? 
        WHERE comment_id = ? AND user_id = ?
    `;
    const [results] = await pool.query(query, [content, commentId, userId]);
    return results.affectedRows;
};


// 댓글 수 업데이트 
export const updateCommentCount = async (postId, action) => {
    const incrementValue = action === 'add' ? 1 : action === 'delete' ? -1 : 0;
        
        // 유효하지 않은 액션 
        if(incrementValue === 0) {
            throw new Error('updateCommentCount: 유효하지 않은 액션');
        }

        try {
            const query = `UPDATE post SET comment_count = comment_count + ? WHERE post_id = ?`;
            const [results] = await pool.query(query, [incrementValue, postId]);
            return results;
        } catch (error) {
            console.error('updateCommentCount Error:', error);
            throw error;
        }
};

