import connection from '../config/mariadb.js'; 
import bcrypt from 'bcrypt'; 

// 프로필 업데이트 updateProfile
export const updateProfile = ({ userId, email, nickname, profileImg }) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE users
            SET email = COALESCE(?, email),
                nickname = COALESCE(?, nickname),
                profileImg = COALESCE(?, profileImg)
            WHERE user_id = ? `;
        const params = [email, nickname, profileImg, userId];

        connection.query(query, params, (err, results) => {
            if(err) {
                return reject(err); 
            }
            resolve(results); 
        });

    });
};

// 비밀번호 업데이트 updatePassword 
export const updatePassword = async ({ userId, password }) => {
    const salt = await bcrypt.genSalt(10);
    const forcedPassword = await bcrypt.hash(password, salt); 
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET password = ? WHERE user_id = ?';
        const params = [forcedPassword, userId];
        
        connection.query(query, params, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}; 

// 사용자 탈퇴 정보 업데이트 withdrawUser
export const withdrawUser = (userId) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(async (err) => {
            if(err) {
                return reject(err);
            }
            try {
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM comment WHERE user_id = ?', [userId], (err) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(); 
                    });
                });
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM post WHERE user_id = ?', [userId], (err) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(); 
                    });
                });
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM users WHERE user_id = ?', [userId], (err) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(); 
                    });
                });
                connection.commit((err) => {
                    if(err) {
                        return connection.rollback(() => reject(err));
                    }
                    resolve();
                })
            } catch (error) {
                connection.rollback(() => reject(error)); 
            }
        });
    });
};


// 현재 로그인 한 사용자 정보 조회 getUserById
export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE user_id = ?`;
        connection.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]); 
        });
    });
};


    