import pool from '../config/mariadb.js'; 
import bcrypt from 'bcrypt'; 


// 회원가입 signupUser
export const signupUser = async ({ userId, email, nickname, password, profileImg }) => {
    const salt = await bcrypt.genSalt(10);
    const forcedPassword = await bcrypt.hash(password, salt);
    const query = `
            INSERT INTO users (user_id, email, nickname, password, profileImg)
            VALUES (?, ?, ?, ?, ?) `; 
    const params = [userId || null, email, nickname, forcedPassword, profileImg || null];
    const [results] = await pool.query(query, params);
    return results; 
};


// 로그인 loginUser
export const loginUser = async ({ email }) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const [results] = await pool.query(query, [email]);
    return results[0];
}; 


// 이메일 중복 검사 checkEmailExist
export const checkEmailExist = async (email) => {
    const query = `SELECT 1 FROM users WHERE email = ?`;
    const [results] = await pool.query(query, [email]); 
    return results.length > 0; 
};


// 닉네임 중복 검사 checkNicknameExist
export const checkNicknameExist = async (nickname) => {
    const query = `SELECT 1 FROM users WHERE nickname = ?`;
    const [results] = await pool.query(query, [nickname]);
    return results.length > 0; 
};


