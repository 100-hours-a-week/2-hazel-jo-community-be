import pool from '../config/mariadb.js'; 
import bcrypt from 'bcrypt'; 

// 프로필 업데이트 updateProfile
export const updateProfile = async ({ userId, email, nickname, profileImg }) => {
    const connection = await pool.getConnection(); 
    try {
        const query = `
                UPDATE users
                SET email = COALESCE(?, email),
                    nickname = COALESCE(?, nickname),
                    profileImg = COALESCE(?, profileImg)
                WHERE user_id = ?`;
        const params = [email, nickname, profileImg, userId];
        const [results] = await connection.query(query, params); 
        return results; 
    } catch (error) {
        throw error; 
    } finally {
        connection.release(); 
    }
};


// 비밀번호 업데이트 updatePassword 
export const updatePassword = async ({ userId, password }) => {
    const salt = await bcrypt.genSalt(10);
    const forcedPassword = await bcrypt.hash(password, salt); 
    
    const query = 'UPDATE users SET password = ? WHERE user_id = ?';
    const params = [forcedPassword, userId];
    try {
        const [results] = await pool.query(query, params); 
        return results; 
    } catch (error) {
        throw error;
    } 
};
    

// 사용자 탈퇴 정보 업데이트 withdrawUser
export const withdrawUser = async (userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 댓글 삭제
        const deleteComments = await connection.query(`
            DELETE FROM comment WHERE user_id = ?
        `, [userId]);

        // 게시글 삭제
        const deletePosts = await connection.query(`
            DELETE FROM post WHERE user_id = ?
        `, [userId]);

        // 사용자 삭제
        const deleteUser = await connection.query(`
            DELETE FROM users WHERE user_id = ?
        `, [userId]);

        await connection.commit();
    } catch (error) {
        console.error('withdrawUser Error:', error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


// 현재 로그인 한 사용자 정보 조회 getUserById
export const getUserById = async (userId) => {
    const connection = await pool.getConnection(); 
    try {
        const query = `SELECT * FROM users WHERE user_id = ?`;
        const [results] = await connection.query(query, [userId]);
        return results[0]; 
    } catch (error) {
        throw error; 
    } finally {
        connection.release();
    }
};
 


    