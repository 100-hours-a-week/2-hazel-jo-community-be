import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.originalUrl.includes('/profile') ? 'uploads/profiles' : 'uploads/posts';
        cb(null, path.join(__dirname, folder));
    },
    filename: (req, file, cb) => {
        const filename = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, Date.now() + '-' + filename);
    },
});

export const upload = multer({ storage });

/* 
// 파일 크기 제한 
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
*/