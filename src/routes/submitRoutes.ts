import express from "express";
import {dbPromise} from "../db";
import {upload} from "../middlewares/uploadMiddleware";

const router = express.Router();

// base on /api/submit

/**
 * @api {get} /api/submit/validateName 验证学生姓名是否存在
 * @apiName ValidateName
 * @apiGroup Submit
 *
 * @apiParam {String} name 学生姓名
 *
 * @apiSuccess {Boolean} exists 学生是否存在
 * @apiError (500) {String} error 内部服务器错误
 */
router.get('/validateName', async (req, res) => {
    const {name} = req.query;

    try {
        const db = await dbPromise;
        const result = await db.get('SELECT name FROM student WHERE name = ?', name);

        res.json({exists: !!result});
    } catch (error) {
        console.error('姓名验证失败:', error);
        res.status(500).json({error: '内部服务器错误'});
    }
});

/**
 * @api {post} /api/submit/upload 上传作业文件并更新状态
 * @apiName UploadAssignment
 * @apiGroup Submit
 *
 * @apiParam {String} name 学生姓名
 * @apiParam {String} assignment 作业类型 (中文名称)
 * @apiParam {Number} timeOutStatus 作业超时状态
 *
 * @apiSuccess {String} message 文件上传成功
 * @apiError (400) {String} error 无效的作业类型
 * @apiError (500) {String} error 文件上传失败
 */
router.post('/upload', upload.array('files'), async (req, res) => {
    const {name, assignment, timeOutStatus} = req.body;
    const files = req.files;

    console.log('名字:', name);
    console.log('作业类型:', assignment);
    console.log('上传的文件:', files);

    const assignmentMapping = {
        '第一次作业': 'assignment1_status',
        '第二次作业': 'assignment2_status',
        '第三次作业': 'assignment3_status',
        '第四次作业': 'assignment4_status',
        '第五次作业': 'assignment5_status',
    } as const;

    const assignmentColumn = assignmentMapping[assignment as keyof typeof assignmentMapping];

    if (!assignmentColumn) {
        return res.status(400).send('无效的作业类型');
    }

    try {
        const db = await dbPromise;
        await db.run(`UPDATE student SET ${assignmentColumn} = ? WHERE name = ?`, timeOutStatus, name);

        res.send('文件上传成功');
    } catch (error) {
        console.error('更新作业状态失败:', error);
        res.status(500).send('文件上传失败');
    }
});

/**
 * @api {post} /api/submit/check-submissions 检查学生的作业提交状态
 * @apiName CheckSubmissions
 * @apiGroup Submit
 *
 * @apiParam {String} username 学生用户名
 *
 * @apiSuccess {Boolean[]} submissions 每个作业的提交状态
 * @apiError (400) {String} error 用户名不能为空
 * @apiError (404) {String} error 用户不存在
 * @apiError (500) {String} error 内部服务器错误
 */
router.post('/check-submissions', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: '用户名不能为空' });
    }

    try {
        const db = await dbPromise;
        const result = await db.get('SELECT assignment1_status, assignment2_status, assignment3_status, assignment4_status, assignment5_status FROM student WHERE name = ?', username);

        if (!result) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 确保所有状态都是数字并进行检查
        const submissions = Object.values(result).map(status => {
            // 进行类型断言，确保 status 是数字
            const numericStatus = Number(status);
            return [1, 2].includes(numericStatus);
        });

        res.json({ submissions });
    } catch (error) {
        console.error('检查作业提交失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

export default router;