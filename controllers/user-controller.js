import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { loadPostData, savePostData } from './post-controller.js';
import { loadCommentsData, saveCommentsData } from './comment-controllers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '../data/users.json');

// JSON 파일에서 사용자 데이터 불러오는 함수 
const loadUserData = () => {
    if(!fs.existsSync(usersFilePath)) {
        return { user: [] };
    }
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
};

// JSON 파일에 사용자 데이터 저장하는 함수 
const saveUserData = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};


// 프로필 수정 editProfile
export const editProfile = (req, res) => {
    const { userId } = req.params;
    const { email, nickname } = req.body;
    const profileImg = req.file ? req.file.filename : undefined;
    
    const users = loadUserData();
    const userIndex = users.user.findIndex(user => user.id === parseInt(userId));

    if(userIndex === -1) {
        return res.status(404).json({
            message: "사용자를 찾을 수 없습니다."
        });
    }

    // 기존 정보 유지하면서 새로운 정보만 업데이트
    users.user[userIndex] = {
        ...users.user[userIndex],
        ...(email && { email }),
        ...(nickname && { nickname }),
        ...(profileImg && { profileImg })
    };    

    // json 파일에 수정된 프로필 정보 저장 
    try {
        saveUserData(users);

        // 게시글과 댓글 데이터 업데이트
        updatePostsAndComments(userId, nickname, profileImg);

        
        // 세션 정보 업데이트
        req.session.user = {
            userId: users.user[userIndex].id,
            email: users.user[userIndex].email,
            nickname: users.user[userIndex].nickname,
            profile_image: profileImg ? `/uploads/profiles/${profileImg}` : users.user[userIndex].profileImg
        };
        

        return res.status(200).json({
            message: "프로필이 수정되었습니다.",
            user: {
                email: users.user[userIndex].email,
                nickname: users.user[userIndex].nickname,
                profileImage: profileImg ? `/uploads/profiles/${profileImg}` : null
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "프로필 수정에 실패했습니다."
        });
    }
}


// 게시글, 댓글 데이터 업데이트 
const updatePostsAndComments = (userId, nickname, profileImg) => {
    // 게시글 데이터 업데이트
    const postsData = loadPostData();
    postsData.posts.forEach(post => {
        if (post.user_id === userId) {
            post.profileImg = profileImg ? `/uploads/profiles/${profileImg}` : post.profileImg;
        }
    });
    savePostData(postsData);

    // 댓글 데이터 업데이트
    const commentsData = loadCommentsData();
    commentsData.comments.forEach(comment => {
        if (Number(comment.user_id) === Number(userId)) {
            comment.user_nickname = nickname;
            comment.profile_image = profileImg ? `/uploads/profiles/${profileImg}` : comment.profile_image;
        }
    });
    saveCommentsData(commentsData);
}


// 비밀번호 수정 editPassword
export const editPassword = (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;
    const users = loadUserData();
    const userIndex = users.user.findIndex(user => user.id === parseInt(userId));

    if(userIndex === -1) {
        return res.status(404).json({
            message: "사용자를 찾을 수 없습니다."
        });
    }

    // 비밀번호 수정 
    try {
        users.user[userIndex].password = password;
        saveUserData(users);
        return res.status(200).json({
            message: "비밀번호가 수정되었습니다."
        });
    } catch (error) {
        return res.status(500).json({
            message: "비밀번호 수정에 실패했습니다."
        });
    }
}

// 회원 탈퇴 deleteUser 
export const deleteUser = (req, res) => {
    const { userId } = req.params;
    const users = loadUserData();
    const userIndex = users.user.findIndex(user => user.id === parseInt(userId));

    if(userIndex === -1) {
        return res.status(404).json({
            message: "사용자를 찾을 수 없습니다."
        });
    }

    try {
        // 사용자 게시글 삭제 
        const postsData = loadPostData();
        postsData.posts = postsData.posts.filter(post => post.user_id !== userId);
        savePostData(postsData);

        // 사용자 댓글 삭제
        const commentsData = loadCommentsData();
        commentsData.comments = commentsData.comments.filter(comment => Number(comment.user_id) !== Number(userId));
        saveCommentsData(commentsData);

        // 사용자 삭제 
        users.user.splice(userIndex, 1);
        saveUserData(users);

        return res.status(200).json({
            message: "회원 탈퇴가 완료되었습니다."
        });
    } catch (error) {
        console.error('회원 탈퇴 중 오류:', error);
        return res.status(500).json({
            message: "회원 탈퇴 처리 중 오류가 발생했습니다."
        });
    }
}

// logout 함수 
export const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    message: "로그아웃 처리 중 오류가 발생했습니다."
                });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({
                message: "로그아웃에 성공했습니다."
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: "로그아웃에 실패했습니다."
        });
    }
}


// 사용자 프로필 조회 getUserProfile
export const getUserProfile = (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        console.log('Requested userId:', userId); 

        const users = loadUserData();
        console.log('Loaded users:', users); 

        const user = users.user.find(user => user.id === parseInt(userId));
        console.log('Found user:', user); 

        if (!user) {
            return res.status(404).json({
                message: "사용자를 찾을 수 없습니다."
            });
        }

        return res.status(200).json({
            email: user.email,
            nickname: user.nickname,
            profileImage: user.profileImg ? `/uploads/profiles/${user.profileImg}` : null
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error); 
        return res.status(500).json({
            message: "서버 오류가 발생했습니다."
        });
    }
};

