import connection from '../config/mariadb.js'; 
import bcrypt from 'bcrypt'; 


// 회원가입 signupUser
export const signupUser = async ({ userId, email, nickname, password, profileImg }) => {
    const salt = await bcrypt.genSalt(10);
    const forcedPassword = await bcrypt.hash(password, salt);
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO users (user_id, email, nickname, password, profileImg)
            VALUES (?, ?, ?, ?, ?) `; 
        const params = [userId || null, email, nickname, forcedPassword, profileImg || null];
        connection.query(query, params, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// 로그인 loginUser
export const loginUser = ({ email }) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        const params = [email]; 
        connection.query(query, params, (err, results) => {
            if(err) {
                return reject(err); 
            }
            resolve(results[0]); 
        });
    });
}; 

// 이메일 중복 검사 
export const checkEmailExist = (email) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT 1 FROM users WHERE email = ?`;
        connection.query(query, [email], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0); 
        });
    });
};

// 닉네임 중복 검사 
export const checkNicknameExist = (nickname) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT 1 FROM users WHERE nickname = ?`;
        connection.query(query, [nickname], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0); 
        });
    });
};


