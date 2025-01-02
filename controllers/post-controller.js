import { 
    createPost,
    updatePost, 
    deletePostById, 
    deleteCommentByPostId,
    getPosts, 
    getPostById, 
    manageLike, 
    likePostById,
    updateView,
    getCommentCount, 
} from '../models/post-model.js'; 

// 게시글 작성 makePost
export const makePost = async(req, res) => {
    const userId = req.session?.user?.userId; 
    const { title, content } = req.body;
    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;     
    if(!title || !content) {
        return res.status(400).json({
            message: '게시글 제목과 내용을 입력해주세요.'
        });
    }
    try {
        const result = await createPost({ userId, title, content, image }); 
        return res.status(201).json({
            message: '게시글이 성공적으로 작성되었습니다.',
            postId: result.insertId, 
        });
    } catch (error) {
        return res.status(500).json({
            message: '게시글 작성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}

// 게시글 수정 editPost
export const editPost = async (req, res) => {
    const { postId } =req.params; 
    const { title, content } = req.body;
    const userId = req.session.user.userId;
    const image = req.file ? `/uploads/posts/${req.file.filename}` : null; 
    
    if (!title || !content) {
        return res.status(400).json({
            message: "제목과 내용을 입력해주세요."
        });
    }
    try {
        await vertifyWriter(postId, userId); 
        const result = await updatePost({ postId, title, content, image, userId }); 
        if(result.affectedRows === 0) {
            return res.status(403).json({
                message: "게시글을 수정할 권한이 없습니다."
            });
        }
        return res.status(200).json({
            message: "게시글이 수정됐습니다."
        });        
    } catch (error) {
        return res.status(500).json({
            message: "게시글 수정에 실패했습니다.",
            error: error.message
        });
    }
}

// 게시글 삭제 deletePost 
export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.session.user.userId; 

    try {
        await vertifyWriter(postId, userId); 
        await deleteCommentByPostId(postId);

        const result = await deletePostById(postId); 
        if(result.affectedRows === 0) {
            return res.status(403).json({
                message: "게시글을 삭제할 권한이 없습니다."
            });
        }        
        return res.status(200).json({
            message: "게시글이 삭제되었습니다."
        });
    } catch (error) {
        return res.status(500).json({
            message: "게시글 삭제에 실패했습니다."
        });
    }  
}

// 게시글 목록 조회 posts
export const posts = async (req, res) => {
    try {
        const posts = await getPosts();
        return res.status(200).json({
            posts, 
            message: "게시글 목록이 조회됐습니다."
        });
    } catch (error) {
        res.status(500).json({
            message: "게시글 목록 조회에 실패했습니다.",
            error: error.message,
        });
    };  
};

// 게시글 상세 조회 postDetail 
export const postDetail = async (req, res) => {
    const { postId } = req.params;
    try {
        // 조회수 증가 
        await updateView(postId); 
        
        const post = await getPostById(postId); 
        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }
        
        return res.status(200).json({
            post: {
                post_id: post.post_id,
                title: post.title,
                content: post.content,
                image: post.image,
                like: post.like,
                view: post.view,
                created_at: post.created_at,
                commentCount: post.comment_count,
                author: {
                    user_id: post.user_id,
                    nickname: post.author_nickname,
                    profileImg: post.author_profileImg
                }
            },
            message: "게시글이 상세 조회됐습니다."
        });
    } catch (error) {
        res.status(500).json({
            message: "게시글 상세 조회에 실패했습니다."
        });
   };    
};


// 게시글 좋아요 관리 likeCount
export const likePost = async (req, res) => {
    const { postId } = req.params; 
    const userId = req.session.user.userId;
    try {
        const result = await manageLike(postId, userId);

        if (result.action === 'added') {
            return res.status(200).json({
                message: "게시글에 좋아요를 추가했습니다.",
                details: result,
            });
        } else if (result.action === 'removed') {
            return res.status(200).json({
                message: "게시글에 좋아요를 취소했습니다.",
                details: result,
            });
        } else {
            return res.status(400).json({
                message: "게시글 좋아요 작업이 수행되지 않았습니다.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "게시글 좋아요 수 처리에 실패했습니다.",
        });
    };
};

// 게시글 좋아요 수 조회 likeCount
export const likeCount = async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await likePostById(postId); 
            if (!result) {
                return res.status(500).json({
                    message: "게시글 좋아요 수를 조회하는 중 문제가 발생했습니다.",
                });
            }
            if (result.length === 0) {
                return res.status(404).json({
                    message: "게시글을 찾을 수 없습니다.",
                });
            }
            return res.status(200).json({
                message: "게시글 좋아요 수가 조회되었습니다.",
                like: result[0].like,
            });
        } catch (error) {
        return res.status(500).json({
            message: "게시글 좋아요 수 조회 중 문제가 발생했습니다.",
            error: error.message,
        });
    }
}


// 댓글 수 commentCount
export const commentCount = async (req, res) => {
    const { postId } = req.params; 
    try {
        const comments = await getCommentCount(postId);
        if(!comments) {
            return res.status(404).json({
                message: "댓글을 찾을 수 없습니다."
            }); 
        }
        res.status(200).json({
            commentCount: comments[0].comment_count,
            message: "댓글 수 조회에 성공했습니다."
        });
    } catch (error) {
        res.status(500).json({
            message: "댓글 수 조회에 실패했습니다."
        }); 
    }
}


// 게시글 작성자 검증 
export const vertifyWriter = async (postId, userId) => {
    const post = await getPostById(postId);
    if(!post) {
        throw new Error('게시글을 찾을 수 없습니다');
    }
    if(post.user_id !== userId) {
        throw new Error('해당 게시글에 대한 권한이 없습니다.');
    }
    return post; 
}




