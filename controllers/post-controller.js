import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');

// JSON 파일에서 게시글 데이터 불러오는 함수 
export const loadPostData = () => {
    try {
        const data = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('게시글 데이터 로드 중 오류:', error.message);
        return {
            posts: []
        };
    }
};

// JSON 파일에 게시글 데이터 저장하는 함수 
export const savePostData = (posts) => {
    try {
        fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
    } catch (error) {
        console.error('게시글 저장 중 오류:', error.message);
    }
};

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

// 게시글 작성 makePost
export const makePost = (req, res) => {
    try {
        const { user_id, title, content, date, profileImg } = req.body;
        let imagePath = '';

        if(req.file) {  
            imagePath = '/uploads/posts/' + req.file.filename;
        }

        if(!title || !content) {
            return res.status(400).json({
                message: '게시글 제목과 내용을 입력해주세요.'
            });
        }

        const postsData = loadPostData();
        const newPost = {
            // 게시글이 있는 경우 마지막 게시글의 post_id + 1 / 게시글이 없는 경우 1
            post_id: postsData.posts.length > 0 
                ? postsData.posts[postsData.posts.length - 1].post_id + 1 
                : 1,
            user_id,
            profileImg,
            title,
            content,
            date: date || new Date().toLocaleString(),
            image: imagePath,
            like: 0,
            likes: [],
            view: 0,
            comment: 0
        }; 
            
        postsData.posts.push(newPost);
        savePostData(postsData); 
        
        return res.status(201).json({
            message: '게시글이 성공적으로 작성되었습니다.',
            post: newPost
        });
    } catch (error) {
        return res.status(500).json({
            message: '게시글 작성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}

// 게시글 수정 editPost
export const editPost = (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.user.userId;
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                message: "제목과 내용을 입력해주세요."
            });
        }

        const posts = loadPostData();
        const postIndex = posts.posts.findIndex(post => post.post_id === Number(postId));

        if(postIndex === -1) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다." 
            });
        }

        // 게시글 작성자와 수정 요청자가 다른 경우 
        if(Number(posts.posts[postIndex].user_id) !== userId) {
            return res.status(401).json({
                message: "해당 게시글 수정 권한이 없습니다."
            });
        }

        // multer 파일 업로드
        let updatedImagePath = posts.posts[postIndex].image;  
        if(req.file) {
            updatedImagePath = '/uploads/posts/' + req.file.filename;
        }

        posts.posts[postIndex] = {
            ...posts.posts[postIndex],
            title,
            content,
            image: updatedImagePath 
        };

        // json 파일에 수정된 게시글 저장 
        try {
            savePostData(posts);
            return res.status(200).json({
                message: "게시글이 수정됐습니다."
            });
        } catch (error) {
            return res.status(500).json({
                message: "게시글 수정에 실패했습니다."
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "게시글 수정에 실패했습니다.",
            error: error.message
        });
    }
}

// 게시글 삭제 deletePost 
export const deletePost = (req, res) => {
    const { postId } = req.params;
    const userId = req.session.user.userId; 
    
    const posts = loadPostData();
    const postIndex = posts.posts.findIndex(post => post.post_id === Number(postId));
    
    if (postIndex === -1) {
        return res.status(404).json({
            message: "게시글을 찾을 수 없습니다."
        });
    }

    // 게시글 작성자와 삭제 요청자가 다른 경우 : user_id를 숫자로 변환하여 비교
    if (Number(posts.posts[postIndex].user_id) !== userId) {
        return res.status(401).json({
            message: "해당 게시글 삭제 권한이 없습니다."
        });
    }

    // 게시글 삭제 
    posts.posts.splice(postIndex, 1);

    try {
        savePostData(posts);
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
export const posts = (req, res) => {
    const posts = loadPostData();

    return res.status(200).json({
        posts: posts.posts,
        message: "게시글 목록이 조회됐습니다."
    });
    
}

// 게시글 상세 조회 postDetail 
export const postDetail = (req, res) => {
    const { postId } = req.params;
    const posts = loadPostData();
    const post = posts.posts.find(post => post.post_id === Number(postId));

    if(!post) {
        return res.status(404).json({
            message: "게시글을 찾을 수 없습니다."
        });
    }

    return res.status(200).json({
        post,
        message: "게시글이 상세 조회됐습니다."
    });
}


// 게시글 좋아요 수 조회 likeCount
export const likeCount = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.user.userId;
        console.log("likeCount userId", userId);

        const posts = await loadPostData();
        const post = posts.posts.find(post => post.post_id === Number(postId));

        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }

        const isLiked = post.likes.includes(userId);
        
        return res.status(200).json({
            like: post.like,
            isLiked,
            message: "게시글 좋아요 수가 조회됐습니다."
        });
    } catch (error) {
        return res.status(500).json({
            message: "게시글 좋아요 수 조회에 실패했습니다.",
            error: error.message
        });
    }

}

// 게시글 좋아요 추가 likePost
export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // 로그인 한 유저의 userId 
        const userId = req.session.user.userId;
    
        const posts = await loadPostData();
        const post = posts.posts.find(post => post.post_id === Number(postId));

        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }

        // 게시글 좋아요 누른 유저의 likes 배열이 없으면 초기화
        if (!post.likes) {
            post.likes = [];
        }

        // 유저가 좋아요를 눌렀는지 확인
        const isLiked = post.likes.includes(userId);

        // 이미 좋아요를 눌렀으면 좋아요 취소 / 안눌렀으면 좋아요 추가 
        if(isLiked) {
            post.likes = post.likes.filter(id => id !== userId);
            post.like = Math.max(post.like - 1, 0);
        } else {
            post.likes.push(userId);
            post.like += 1;
        }
        savePostData(posts);

        return res.status(200).json({
            message: "게시글 좋아요가 저장됐습니다.",
            likeCount: post.like,
            isLiked: !isLiked
        });
    } catch (error) {
        return res.status(500).json({
            message: "게시글 좋아요 저장에 실패했습니다.",
            error: error.message
        });
    }
}

// 게시글 조회수 viewCount
export const viewCount = (req, res) => {
    try {
        const { postId } = req.params;
        const posts = loadPostData();
        const post = posts.posts.find(post => post.post_id === Number(postId));

        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }

        post.view += 1;
        savePostData(posts);

        return res.status(200).json({
            viewCount: post.view,
            message: "게시글 조회수가 조회됐습니다."
        });
    } catch (error) {
        return res.status(500).json({
            message: "게시글 조회수 조회에 실패했습니다.",
            error: error.message
        });
    }
}

// 게시글 댓글 수 updateCommentCount
export const updateCommentCount = (req, res) => {
    try {
        const { postId } = req.params;
        const { action } = req.body;
        const posts = loadPostData();
        const post = posts.posts.find(post => post.post_id === Number(postId));

        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }

        // 댓글 수 증가/감소 
        if (action === "add") {
            post.comment += 1; 
        } else if (action === "delete") {
            post.comment = Math.max(post.comment - 1, 0); 
        } else {
            return res.status(400).json({
                message: "유효하지 않은 액션입니다. 'add' 또는 'delete'를 사용하세요."
            });
        }
        savePostData(posts);

        return res.status(200).json({
            commentCount: post.comment,
            message: "게시글 댓글 수가 조회됐습니다."
        });
    } catch (error) {
        return res.status(500).json({
            message: "게시글 댓글 수 조회에 실패했습니다.",
            error: error.message
        });
    }
}

// 게시글 댓글 수 commentCount
export const commentCount = (req, res) => {
    try {
        const { postId } = req.params;
        const posts = loadPostData();
        const post = posts.posts.find(post => post.post_id === Number(postId));

        if(!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다."
            });
        }
        return res.status(200).json({
            commentCount: post.comment,
            message: "게시글 댓글 수가 조회됐습니다."
        });

    } catch (error) {
        return res.status(500).json({
            message: "게시글 댓글 수 조회에 실패했습니다.",
            error: error.message
        });
    }
}   

