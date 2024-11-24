import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');

// JSON 파일에서 게시글 데이터 불러오는 함수 
const loadPostData = () => {
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
const savePostData = (posts) => {
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
                message: "게시글이 수정되었습니다."
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
        message: "게시글 목록이 조회되었습니다."
    });
    
}

// 게시글 상세 조회 postDetail 
export const postDetail = (req, res) => {
    const { postId } = req.params;
    const posts = loadPostData();
    const postIndex = posts.posts.findIndex(post => post.post_id === Number(postId));

    if(postIndex === -1) {
        return res.status(404).json({
            message: "게시글을 찾을 수 없습니다."
        });
    }

    return res.status(200).json({
        post: posts.posts[postIndex],
        message: "게시글이 상세 조회되었습니다."
    });
}



