import connection from '../config/mariadb.js'; 

// 댓글 목록 loadCommentsData
export const loadCommentsData = (postId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.comment_id, c.post_id, c.user_id, c.content, c.created_at,
                   u.nickname AS user_nickname, u.profileImg AS profile_image
            FROM comment c
            LEFT JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC 
        `;
        connection.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    });
}; 

// 댓글
export const getCommentById = (commentId, userId) => {
    return new Promise((resolve, reject) => {
    const query = `
        SELECT user_id FROM comment WHERE comment_id = ? AND user_id = ?
    `;
    connection.query(query, [commentId, userId], (err, results) => {
        if (err) {
            return reject(err);
            }
            resolve(results); 
        });
    });
};


// 댓글 생성 createComment
export const createComment = ({ postId, userId, content }) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO comment (post_id, user_id, content)
            VALUES (?, ?, ?)
        `;
        connection.query(query, [postId, userId, content], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    });
};

// 댓글 삭제 deleteCommentById
export const deleteCommentById = ({ commentId, userId }) => {
    return new Promise((resolve, reject) => {
        const query = `
            DELETE FROM comment WHERE comment_id = ? AND user_id = ?
        `;
        connection.query(query, [commentId, userId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results.affectedRows); 
        });
    });
};

// 댓글 수정 updateComment
export const updateComment = ({ commentId, userId, content }) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE comment SET content = ? 
            WHERE comment_id = ? AND user_id = ?
        `;
        connection.query(query, [content, commentId, userId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results.affectedRows); 
        });
    });
};

// 댓글 수 업데이트 
export const updateCommentCount = (postId, action) => {
    return new Promise((resolve, reject) => {
        const incrementValue = action === 'add' ? 1 : action === 'delete' ? -1 : 0;
        // 유효하지 않은 액션 
        if(incrementValue === 0) {
            return reject(err); 
        }
        const query = `UPDATE post SET comment_count = comment_count + ? WHERE post_id = ?`
        connection.query(query, [incrementValue, postId], (err, results) => {
            if(err) {
                console.error("updateCommentCount - MySQL Error:", err);
                return reject(err);
            }
            resolve(results); 
        });
    });
};

