import express from "express";
import {dbPromise} from "../db";
import {projectUpload} from "../middlewares/projectMiddleware";

const router = express.Router();

// 基于 /api/project 路径
// 项目相关API

/**
 * @api {post} /api/project/upload 上传项目文件
 * @apiName UploadProject
 * @apiGroup Project
 *
 * @apiParam {String} name 用户名称
 * @apiParam {String} project 项目类型（项目1或项目2）
 * @apiParam {File[]} files 上传的文件数组
 *
 * @apiSuccess {String} message 文件上传成功
 *
 * @apiError (400) {String} error 无效的项目类型
 * @apiError (500) {String} error 文件上传失败
 */
router.post('/upload', projectUpload.array('files'), async (req, res) => {
    const name = req.body.name;
    const project = req.body.project as '项目1' | '项目2';
    const files = req.files;

    console.log('名字:', name);
    console.log('项目类型:', project);
    console.log('上传的文件:', files);

    // 将中文项目类型转换为数据库列名
    const projectMapping = {
        '项目1': 'project1',
        '项目2': 'project2',
    } as const;

    const projectColumn = projectMapping[project];

    if (!projectColumn) {
        return res.status(400).send('无效的作业类型');
    }

    try {
        const db = await dbPromise;
        await db.run(`UPDATE project SET ${projectColumn} = 1 WHERE name = ?`, name);
        res.send('文件上传成功');
    } catch (error) {
        console.error('更新作业状态失败:', error);
        res.status(500).send('文件上传失败');
    }
});

/**
 * @api {get} /api/project/all 获取所有项目状态
 * @apiName GetProjectStatus
 * @apiGroup Project
 *
 * @apiSuccess {Object[]} projects 项目状态数组
 * @apiSuccess {String} projects.name 用户名称
 * @apiSuccess {Boolean} projects.project1 项目1状态（true: 已提交, false: 未提交）
 * @apiSuccess {Boolean} projects.project2 项目2状态（true: 已提交, false: 未提交）
 *
 * @apiError (500) {String} error 内部服务器错误
 */
router.get('/all', async (_req, res) => {
    try {
        const db = await dbPromise;
        const users = await db.all('SELECT name, project1, project2 FROM project');

        const userStatus = users.map(user => ({
            name: user.name,
            project1: user.project1 === 1,
            project2: user.project2 === 1,
        }));

        res.json(userStatus);
    } catch (error) {
        console.error('获取用户状态失败:', error);
        res.status(500).json({error: '内部服务器错误'});
    }
});

/**
 * @api {post} /api/project/check-project 检查项目提交状态
 * @apiName CheckProject
 * @apiGroup Project
 *
 * @apiParam {String} username 学生用户名
 *
 * @apiSuccess {Boolean[]} projectStatus 每个项目的提交状态
 * @apiError (400) {String} error 用户名不能为空
 * @apiError (404) {String} error 用户不存在
 * @apiError (500) {String} error 内部服务器错误
 */
router.post('/check-project', async (req, res) => {
    const { username } = req.body;

    // 检查用户名是否为空
    if (!username) {
        return res.status(400).json({ error: '用户名不能为空' });
    }

    try {
        const db = await dbPromise;
        const result = await db.get('SELECT project1, project2 FROM project WHERE name = ?', username);

        // 检查用户是否存在
        if (!result) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 将提交状态转换为布尔值
        const projectStatus = [
            result.project1, // 项目1的状态
            result.project2  // 项目2的状态
        ];

        res.json({ projectStatus });
    } catch (error) {
        console.error('检查项目提交失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

export default router;