const express = require('express');
const postRoutes = require('./routes/postROutes');
const userRoutes = require('./routes/userRoutes');

const app = express(); 
// json 요청 파싱 
app.use(express.json());

// 라우트 설정 
app.use('/posts', postRoutes);
app.use('/users', userRoutes);


const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});