import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbPromise } from '../db';

const router = express.Router();
const secretKey = 'lingyunmo666'; // 请替换为你自己的密钥

/**
 * @api {post} /api/login 用户登录
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 *
 * @apiSuccess {Boolean} success 登录是否成功
 * @apiSuccess {String} message 提示信息
 * @apiSuccess {String} user 用户名
 * @apiSuccess {String} token 生成的JWT Token
 *
 * @apiError (400) {Boolean} success 登录失败
 * @apiError (401) {Boolean} success 登录失败，用户名或密码错误
 * @apiError (500) {Boolean} success 登录失败，服务器内部错误
 */
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    try {
        const db = await dbPromise;
        const user = await db.get(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (user) {
            // 生成 Token
            const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });

            // 返回用户名和 Token
            return res.json({ success: true, message: '登录成功', user: user.username, token });
        } else {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * @api {post} /api/update-user-status 更新用户作业状态
 * @apiName UpdateUserStatus
 * @apiGroup Auth
 *
 * @apiParam {String} name 用户名称
 * @apiParam {Boolean} assignment1 作业1状态
 * @apiParam {Boolean} assignment2 作业2状态
 * @apiParam {Boolean} assignment3 作业3状态
 * @apiParam {Boolean} assignment4 作业4状态
 * @apiParam {Boolean} assignment5 作业5状态
 *
 * @apiSuccess {String} message 更新成功
 *
 * @apiError (403) {String} error 未授权的访问
 * @apiError (401) {String} error 无效的 Token
 * @apiError (400) {String} error 缺少必要的参数
 * @apiError (500) {String} error 内部服务器错误
 */
router.post('/update-user-status', async (req: Request, res: Response) => {
    try {
        // 从请求头中获取 Authorization 字段
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(403).json({ error: '未授权的访问' });
        }

        // 获取 token 并验证
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (error) {
            return res.status(401).json({ error: '无效的 Token' });
        }

        // 检查用户权限
        const authorizedUser = 'lingyunmo';
        // @ts-ignore
        if (decoded.username !== authorizedUser) {
            return res.status(403).json({ error: '权限不足' });
        }

        // 验证请求体中的数据
        const { name, assignment1, assignment2, assignment3, assignment4, assignment5 } = req.body;
        if (!name) {
            return res.status(400).json({ error: '缺少必要的参数: name' });
        }

        // 更新数据库中的用户作业状态
        const db = await dbPromise;

        await db.run(
            `UPDATE student SET 
                assignment1_status = ?, 
                assignment2_status = ?, 
                assignment3_status = ?, 
                assignment4_status = ?, 
                assignment5_status = ? 
             WHERE name = ?`,
            [
                assignment1 ? 1 : 0,
                assignment2 ? 1 : 0,
                assignment3 ? 1 : 0,
                assignment4 ? 1 : 0,
                assignment5 ? 1 : 0,
                name,
            ]
        );

        res.status(200).json({ message: '更新成功' });
    } catch (error) {
        console.error('更新用户状态失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

export default router;