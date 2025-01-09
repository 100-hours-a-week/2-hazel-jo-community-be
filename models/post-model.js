import pool from '../config/mariadb.js';

// 게시글 생성 createPost 
export const createPost = async ({ userId, title, content, image }) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO post (user_id, title, content, image, created_at)
        VALUES (?, ?, ?, ?, NOW())
        `;
        const params = [userId, title, content, image];
        pool.query(query, params, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// 게시글 수정 updatePost
export const updatePost = async ({ postId, title, content, image, userId }) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE post SET title = ?, content = ?, image = ?
        WHERE post_id = ? AND user_id = ?
        `;
        const params = [title, content, image, postId, userId || null];
        pool.query(query, params, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    });
}; 

// 게시글 삭제 deletePostById
export const deletePostById = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM post WHERE post_id =?`;
        pool.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    });
};

// 게시글 관련 댓글 삭제 deleteCommentByPostId
export const deleteCommentByPostId = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM comment WHERE post_id = ?`;
        pool.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        })
    })
}

// 게시글 목록 조회 getPosts
export const getPosts = async () => {
    return new Promise((resolve, reject) => {
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
        pool.query(query, (err, results) => {
            if(err) {
                return reject(err);
            }
            const posts = results.map(post => {  
                return {
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
                };
            });
            resolve(posts); 
        });
    });
};

// 게시글 상세 조회 getPostById
export const getPostById = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*,
                u.nickname AS author_nickname,
                u.profileImg AS author_profileImg
            FROM post p 
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.post_id = ?
            `; 
        pool.query(query, [postId], (err, results)=> {
            if(err) {
                return reject(err);
            }
            resolve(results[0]); 
        });
    });
};

// 좋아요 수 manageLike
export const manageLike = async (postId, userId) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return reject(err);
                }

                // 좋아요 상태 확인 
                const userCheckQuery = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
                const params = [postId, userId];
                
                connection.query(userCheckQuery, params, (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            reject(err);
                        });
                    }

                    // LIKES 좋아요 삭제 
                    if (results.length > 0) {
                        const deleteQuery = `DELETE FROM likes WHERE post_id = ? AND user_id = ?`;
                        connection.query(deleteQuery, params, (err, deleteResults) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            // POST 좋아요 수 감소 
                            const decrementQuery = `UPDATE post SET \`like\` = \`like\` - 1 WHERE post_id = ?`;
                            connection.query(decrementQuery, [postId], (err, decrementResults) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                }

                                // 커밋
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }
                                    connection.release();
                                    resolve({ action: 'removed', deleteResults, decrementResults });
                                });
                            });
                        });
                    } else {
                        // LIKES 좋아요 추가 
                        const insertQuery = `INSERT INTO likes (post_id, user_id) VALUES (?, ?)`;
                        connection.query(insertQuery, params, (err, insertResults) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            // POST 좋아요 수 증가 
                            const incrementQuery = `UPDATE post SET \`like\` = \`like\` + 1 WHERE post_id = ?`;
                            connection.query(incrementQuery, [postId], (err, incrementResults) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                }

                                // 커밋
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }
                                    connection.release();
                                    resolve({ action: 'added', insertResults, incrementResults });
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};

// 좋아요 수 
export const likePostById = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT \`like\` FROM post WHERE post_id = ?`;
        pool.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    }); 
};

// 조회 수 updateView
export const updateView = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE post SET view = view + 1 WHERE post_id = ?`;
        pool.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results); 
        });
    }); 
};

// 댓글 수 getCommentCount
export const getCommentCount = async (postId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT comment_count FROM post WHERE post_id = ?`;
        pool.query(query, [postId], (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};