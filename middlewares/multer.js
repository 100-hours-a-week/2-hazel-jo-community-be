import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder;        
        if (req.originalUrl.includes('/signup') || req.originalUrl.includes('/profile')) {
            folder = path.join(rootDir, 'uploads/profiles');
        } else {
            folder = path.join(rootDir, 'uploads/posts');
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const filename = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, Date.now() + '-' + filename);
    },
});

// export const upload = multer({ storage });


// 파일 크기 제한 
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
