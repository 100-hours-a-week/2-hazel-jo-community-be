import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
    const profileImage = req.file ? req.file.filename : undefined;
    
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
        ...(profileImage && { profileImage })
    };    

    // json 파일에 수정된 프로필 정보 저장 
    try {
        saveUserData(users);
        return res.status(200).json({
            message: "프로필이 수정되었습니다.",
            user: {
                email: users.user[userIndex].email,
                nickname: users.user[userIndex].nickname,
                profileImage: profileImage ? `/uploads/profiles/${profileImage}` : null
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "프로필 수정에 실패했습니다."
        });
    }
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

    // 사용자 삭제 
    users.user.splice(userIndex, 1);
    saveUserData(users);

    return res.status(200).json({
        message: "회원 탈퇴가 완료되었습니다."
    });
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

