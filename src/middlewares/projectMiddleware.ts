import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 使用 path.resolve 获取项目根目录的绝对路径
const baseDir = path.resolve(__dirname, '..', '..'); // 访问到项目根目录

// 定义 multer 存储选项
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        // 从请求中获取用户名
        const username = req.body.name;
        // 从请求中获取项目类型
        const project = req.body.project;

        // 检查 username 和 project 是否存在
        if (!username || !project) {
            // @ts-ignore
            return cb(new Error('用户名或项目类型未定义'));
        }

        // 设置路径为 uploads 目录，确保与 src 同级
        const dir = path.join(baseDir, 'projects', username, project);

        // 创建目录，如果不存在则创建
        fs.promises.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err, dir));
    },
    filename: (_req, file, cb) => {
        // 将文件原始名称从 'latin1' 编码转换为 'utf8'
        const originalNameBuffer = Buffer.from(file.originalname, 'latin1');
        const originalName = originalNameBuffer.toString('utf8');
        cb(null, originalName);
    }
});

// 导出 multer 上传实例，设置存储选项
export const projectUpload = multer({ storage });