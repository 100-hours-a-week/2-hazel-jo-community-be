import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// S3 설정 
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

// pre-signed URL 생성
export const getPresignedUrl = async (filename, filetype) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${filename}`,
      Expires: 60, // URL 60초 후 만료
      ContentType: filetype
    };
  
    return await s3.getSignedUrlPromise('putObject', params);
  };