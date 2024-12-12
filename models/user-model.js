import connection from '../config/mariadb.js'; 


// 사용자 정보 불러오기 loadUserData
export const loadUserData = async () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM user';
        connection.query(query, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}; 

// 프로필 업데이트 updateUserProfile
export const updateUserProfile = ({ userId, email, nickname, profileImg }) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE user
            SET email = COALESCE(?, email),
                nickname = COALESCE(?, nickname),
                profileImg = COALESCE(?, profileImg)
            WHERE id = ? `;
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
export const updatePassword = ({ userId, password }) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE user SET password = ? WHERE id = ?';
        const params = [password, userId];
        
        connection.query(query, params, (err, results) => {
            if(err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}; 

// 사용자 탈퇴 정보 업데이트 deleteUpdateUser
export const deleteUpdateUser = (userId) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(async (err) => {
            if(err) {
                return reject(err);
            }
            try {
                connection.query('DELETE FROM comment WHERE user_id = ?', [userId]);
                connection.query('DELETE FROM post WHERE user_id = ?', [userId]);
                connection.query('DELETE FROM user WHERE id = ?', [userId]);

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


// 사용자 정보 조회 getUserById
export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT email, nickname, profileImg FROM user WHERE id = ?';
        connection.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]); 
        });
    });
};

    