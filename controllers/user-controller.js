import { 
    updatePassword, 
    updateProfile, 
    withdrawUser, 
    getUserById 
} from '../models/user-model.js';

// 프로필 수정 editProfile
export const editProfile = async (req, res) => {
    const { userId } = req.params;
    const { email, nickname } = req.body;
    const profileImg = req.file && req.file.filename 
        ? `/uploads/profiles/${req.file.filename}` 
        : null;    
    try {        
        const result = await updateProfile({ userId, email, nickname, profileImg });
        if(result.affectedRows === 0) {
            return res.status(404).json({
                message: "사용자를 찾을 수 없습니다."
            });
        }
        const updatedUser = await getUserById(userId);
        req.session.user = {
            userId: updatedUser.userId,
            email: updatedUser.email,
            nickname: updatedUser.nickname,
            profileImg: updatedUser.profileImg,
        }
        return res.status(200).json({
            message: "프로필이 수정되었습니다."
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "프로필 수정에 실패했습니다."
        });
    }
}   


// 비밀번호 수정 editPassword
export const editPassword = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login.html'); 
    }
    const { userId } = req.params;
    const { password } = req.body;
    
    try {
        const result = await updatePassword({ userId, password });
        if(result.affectedRows === 0) {
            return res.status(404).json({
                message: "사용자를 찾을 수 없습니다."
            });
        }
        req.session.destroy((err) => {
            if(err) {
                return res.status(500).json({ 
                    message: "세션 삭제 중 오류가 발생했습니다."
                });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({
                message: "비밀번호가 수정되었습니다."
            });
        })
    } catch (error) {
        return res.status(500).json({
            message: "비밀번호 수정에 실패했습니다."
        });
    }
}



// 회원 탈퇴 deleteUser 
export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        await withdrawUser(userId);
        req.session.destroy((err) => {
            if(err) {
                return res.status(500).json({ 
                    message: "세션 삭제 중 오류가 발생했습니다."
                });
            }
            return res.status(200).json({
                message: "회원 탈퇴가 완료되었습니다."
            });
        })
    } catch (error) {
        return res.status(500).json({
            message: "회원 탈퇴에 실패했습니다."
        }); 
    }
}


// logout 함수 
export const logout = async (req, res) => {
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


// 사용자 프로필 조회 getCurrentUser
export const getCurrentUser = async (req, res) => {
    try {
        const user = await getUserById(req.session.user.userId);

        if (!user) {
            return res.status(404).json({ 
                message: "사용자를 찾을 수 없습니다." 
            });
        }
        res.status(200).json({
            user: {
                userId: user.user_id,
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImg ? user.profileImg : null,
            },
        });
    } catch (error) {
        res.status(500).json({ 
            message: "사용자 정보를 가져오는 데 실패했습니다." 
        });
    }
};

