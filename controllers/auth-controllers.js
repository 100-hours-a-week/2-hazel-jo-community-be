import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '../data/users.json');

// JSON 파일에서 사용자 데이터 불러오는 함수 
const loadUserData = () => {
    if(!fs.existsSync(usersFilePath)) {
        // 유저 아이디 초기값 
        return { user: [], lastId: 0 }; 
    }
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data); 
}; 

// JSON 파일에 사용자 데이터 저장하는 함수 
const saveUserData = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
}; 

// 회원가입 signup 
export const signup = (req, res) => {
    console.log('Signup request received');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { email, password, nickname } = req.body;
    const users = loadUserData(); 
    
    //* 새로운 유저 ID 생성 (1부터 시작) -> 추후 수정해야 함 
    const newId = (users.lastId || 0) + 1;
    users.lastId = newId;

    // json 파일에서 이메일 중복 여부 확인 
    if(users.user.some(user => user.email === email)) {
        return res.status(400).json({
            message: "이미 존재하는 이메일입니다."
        });
    }
    // json 파일에서 닉네임 중복 여부 확인 
    if(users.user.some(user => user.nickname === nickname)) {
       return res.status(400).json({
            message: "이미 존재하는 닉네임입니다."
        });
    }

    // 프로필 이미지 유무 확인 및 디렉토리 생성
    const uploadsDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // json 파일에 회원 정보 저장 
    const profileImg = req.file ? req.file.filename : null; 
    const newUser = { 
        id: newId,
        email, 
        password, 
        nickname, 
        profileImg 
    };
    users.user.push(newUser); 
    saveUserData(users); 
    
    const responseData = {
        message: "회원가입이 완료되었습니다.",
        user: {
            userId: newId,
            email: email,
            nickname: nickname,
            profileImage: profileImg ? `/uploads/profiles/${profileImg}` : null
        }
    };    
    res.status(201).json(responseData);
}

// 로그인 login 
export const login = (req, res) => {
    console.log('=== 로그인 요청 시작 ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Raw Body:', req.rawBody);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        console.log('이메일 또는 비밀번호가 없습니다.');
        return res.status(400).json({
            message: "이메일과 비밀번호를 모두 입력해주세요."
        });
    }

    const users = loadUserData();

    // 입력한 이메일 사용자 찾기
    const user = users.user.find(user => user.email === email);

    // 이메일이 존재하지 않는 경우
    if(!user) {
        return res.status(400).json({
            message: `${email} 존재하지 않는 이메일 주소입니다.`
        });
    }

    // 비밀번호 확인
    if(user.password !== password) {
        return res.status(400).json({
            message: "비밀번호가 일치하지 않습니다."
        });
    }

    // 로그인 성공 시 세션에 사용자 정보 저장
    req.session.user = {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profileImg ? `/uploads/profiles/${user.profileImg}` : null
    };

    res.status(200).json({
        message: "로그인에 성공하였습니다.",
        user: {
            userId: user.id,
            email: user.email,
            nickname: user.nickname,
            profileImage: user.profileImg ? `/uploads/profiles/${user.profileImg}` : null
        }
    });
}

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = (req, res) => {
    // 세션에 사용자 정보가 없으면 인증되지 않은 상태
    if (!req.session.user) {
        return res.status(401).json({
            message: "로그인이 필요합니다."
        });
    }

    // json에서 최신 사용자 정보 조회
    const users = loadUserData();
    const currentUser = users.user.find(user => user.id === req.session.user.userId);

    if (!currentUser) {
        return res.status(404).json({
            message: "사용자를 찾을 수 없습니다."
        });
    }

    // 클라이언트에 전송할 사용자 정보
    const userInfo = {
        userId: currentUser.id,
        email: currentUser.email,
        nickname: currentUser.nickname,
        profileImage: currentUser.profileImg ? `/uploads/profiles/${currentUser.profileImg}` : null
    };

    res.status(200).json({
        user: userInfo
    });
};