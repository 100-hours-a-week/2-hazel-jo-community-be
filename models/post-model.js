import pool from '../config/mariadb.js';

// 게시글 생성 createPost 
export const createPost = async ({ userId, title, content, image }) => {
    const query = `
        INSERT INTO post (user_id, title, content, image, created_at)
        VALUES (?, ?, ?, ?, NOW())
        `; 
    const params = [userId, title, content, image];
    const [results] = await pool.query(query, params); 
    return results; 
};


// 게시글 수정 updatePost
export const updatePost = async ({ postId, title, content, image, userId }) => {
    const query = `
        UPDATE post SET title = ?, content = ?, image = ?
        WHERE post_id = ? AND user_id = ?
        `;
    const params = [title, content, image, postId, userId || null];
    const [results] = await pool.query(query, params); 
    return results; 
}; 


// 게시글 삭제 deletePostById
export const deletePostById = async (postId) => {
    const query = `DELETE FROM post WHERE post_id =?`;
    const [results] = await pool.query(query, [postId]);
    return results; 
};


// 게시글 관련 댓글 삭제 deleteCommentByPostId
export const deleteCommentByPostId = async (postId) => {
    const query = `DELETE FROM comment WHERE post_id = ?`;
    const [results] = await pool.query(query, [postId]);
    return results; 
};


// 게시글 목록 조회 getPosts
export const getPosts = async () => {
    const query = `
        SELECT 
            p.*,
            u.nickname,
            u.profileImg,
            DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM post p
        LEFT JOIN users u ON p.user_id = u.user_id
        ORDER BY p.created_at ASC
    `; 
    const [results] = await pool.query(query);
    return results.map(post => ({
        post_id: post.post_id,
        user_id: post.user_id,
        title: post.title || '',
        content: post.content || '',
        image: post.image || null,
        view: post.view || 0,
        like: post.like || 0,
        created_at: post.created_at,
        nickname: post.nickname || '작성자 없음',
        profileImage: post.profileImg || null,
        comment: post.comment_count || 0
    }));
}


// 게시글 상세 조회 getPostById
export const getPostById = async (postId) => {
    const query = `
        SELECT p.*,
            u.nickname AS author_nickname,
            u.profileImg AS author_profileImg
        FROM post p 
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = ?
    `;
    const [results] = await pool.query(query, [postId]); 
    return results[0]; 
};


// 좋아요 수 manageLike
export const manageLike = async (postId, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 좋아요 상태 확인
        const userCheckQuery = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
        const [results] = await connection.query(userCheckQuery, [postId, userId]);

        if (results.length > 0) {
            // 좋아요 삭제
            const deleteQuery = `DELETE FROM likes WHERE post_id = ? AND user_id = ?`;
            await connection.query(deleteQuery, [postId, userId]);

            // 좋아요 수 감소
            const decrementQuery = `UPDATE post SET \`like\` = \`like\` - 1 WHERE post_id = ?`;
            await connection.query(decrementQuery, [postId]);

            await connection.commit();
            return { action: 'removed' };
        } else {
            // 좋아요 추가
            const insertQuery = `INSERT INTO likes (post_id, user_id) VALUES (?, ?)`;
            await connection.query(insertQuery, [postId, userId]);

            // 좋아요 수 증가
            const incrementQuery = `UPDATE post SET \`like\` = \`like\` + 1 WHERE post_id = ?`;
            await connection.query(incrementQuery, [postId]);

            await connection.commit();
            return { action: 'added' };
        }
    } catch (error) {
        console.error('manageLike Error:', error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


// 좋아요 수 
export const likePostById = async (postId) => {
    const query = `SELECT \`like\` FROM post WHERE post_id = ?`;
    const [results] = await pool.query(query, [postId]);
    if (results.length === 0) {
        console.error(`likePostById: 포스트를 찾을 수 없음. postId: ${postId}`);
        return null;
    }
    return results[0]; 
};


// 조회 수 updateView
export const updateView = async (postId) => {
    const query = `UPDATE post SET view = view + 1 WHERE post_id = ?`;
    const [results] = await pool.query(query, [postId]);
    return results; 
};


// 댓글 수 getCommentCount
export const getCommentCount = async (postId) => {
    const query = `SELECT comment_count FROM post WHERE post_id = ?`;
    const [results] = await pool.query(query, [postId]); 
    return results[0];
};