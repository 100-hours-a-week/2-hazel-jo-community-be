import session from 'express-session';
import { 
    signupUser, 
    loginUser, 
    checkEmailExist, 
    checkNicknameExist 
} from '../models/auth-model.js';
import bcrypt from 'bcrypt'; 

// 회원가입 signup 
export const signup = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profileImg = req.file ? `/uploads/profiles/${req.file.filename}` : null;     
    try {
        // 이메일 중복 검사 
        const isExistEmail = await checkEmailExist(email);
        if(isExistEmail) {
            return res.status(400).json({ 
                message: "이미 존재하는 이메일입니다."
            });
        }
        // 닉네임 중복 검사 
        const isExistNickname = await checkNicknameExist(nickname);
        if(isExistNickname) {
            return res.status(400).json({ 
                message: "이미 존재하는 닉네임입니다."
            });
        }
        
        const result = await signupUser({ email, password, nickname, profileImg });
        const userId = result.insertId; 
        res.status(201).json({
            message: "회원가입이 완료되었습니다.",
            user: {
                userId, 
                email,
                nickname,
                profileImg: profileImg ? `/uploads/profiles/${profileImg}` : null,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "회원가입에 실패했습니다." });
    }
}

// 로그인 login 
export const login = async(req, res) => {
    console.log('로그인 시도 요청 데이터 : ', {
        email: req.body.email,
        hearder: req.headers,
        session: req.session
    }); 
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            message: "이메일과 비밀번호를 모두 입력해주세요."
        });
    }
    try {
        const user = await loginUser({ email });
        if (!user) {
            return res.status(401).json({ 
                message: "존재하지 않는 이메일입니다." 
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "비밀번호가 일치하지 않습니다." 
            });
        }
        req.session.user = {
            userId: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profileImage: user.profileImg || null,
        };
        res.status(200).json({
            message: "로그인에 성공하였습니다.",
            user: req.session.user,
        });
    } catch (error) {
        console.error('로그인 처리 에러 : ', error);
        console.error('에러 stack : ', error.stack);
        res.status(500).json({ 
            message: "로그인에 실패했습니다.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined, 
        });
    }
}

