import express from "express";
import { dbPromise } from "../db";

const router = express.Router();

// base on /api/status
/**
 * @api {get} /api/status 读取状态
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiSuccess {Object} status 当前状态对象
 *
 * @apiError (500) {String} error 获取状态失败
 */
router.get('/', async (_req, res) => {
    try {
        const db = await dbPromise;
        const status = await db.get('SELECT * FROM status'); // 获取当前状态
        res.json(status);
    } catch (error) {
        console.error('获取状态失败', error);
        res.status(500).json({ error: '获取状态失败' });
    }
});

/**
 * @api {post} /api/status/toggle 切换状态
 * @apiName ToggleStatus
 * @apiGroup Status
 *
 * @apiParam {String} type 状态类型 (maintenance 或 submission 或 qrcode)
 * @apiParam {Boolean} value 状态值
 *
 * @apiSuccess {Boolean} success 操作成功
 *
 * @apiError (400) {String} error 参数不正确
 * @apiError (500) {String} error 更新状态失败
 */
router.post('/toggle', async (req, res) => {
    const { type, value } = req.body;
    try {
        const db = await dbPromise;
        if (type === 'maintenance') {
            await db.run('UPDATE status SET submitMaintenanceFlag = ? WHERE id = 1', [value]);
        } else if (type === 'submission') {
            await db.run('UPDATE status SET submitSubmissionClosed = ? WHERE id = 1', [value]);
        }else if (type === 'qrcode') {
            await db.run('UPDATE status SET QRCodeCheck = ? WHERE id = 1', [value]);
        }else if (type === 'project') {
            await db.run('UPDATE status SET projectSubmissionClosed = ? WHERE id = 1', [value]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('更新状态失败', error);
        res.status(500).json({ error: '更新状态失败' });
    }
});

/**
 * @api {post} /api/status/updateAssignmentId 更新作业编号
 * @apiName UpdateAssignmentId
 * @apiGroup Status
 *
 * @apiParam {Number} submitNowCheck 当前作业编号
 *
 * @apiSuccess {Boolean} success 操作成功
 *
 * @apiError (400) {String} error 参数不正确
 * @apiError (500) {String} error 内部服务器错误
 */
router.post('/updateAssignmentId', async (req, res) => {
    const { submitNowCheck } = req.body;

    console.log('接收到的参数:', submitNowCheck); // 输出接收到的参数

    if (typeof submitNowCheck !== 'number') {
        return res.status(400).json({ error: '参数不正确' });
    }

    try {
        const db = await dbPromise;
        await db.run('UPDATE status SET submitNowCheck = ? WHERE id = 1', [submitNowCheck]);
        res.json({ success: true });
    } catch (error) {
        console.error('更新作业编号失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

/**
 * @api {get} /api/status/submitNowCheck 获取上传数量
 * @apiName GetUploadCount
 * @apiGroup Status
 *
 * @apiSuccess {Number} uploadCount 已提交作业的学生数量
 *
 * @apiError (404) {String} error 状态信息未找到
 * @apiError (500) {String} error 服务器错误
 */
router.get('/submitNowCheck', async (_req, res) => {
    try {
        const db = await dbPromise; // 获取数据库连接
        // 查询 status 表，获取 submitNowCheck 列的值
        const statusResult = await db.get('SELECT submitNowCheck FROM status WHERE id = 1');

        if (!statusResult) {
            return res.status(404).json({error: '状态信息未找到'});
        }

        const submitNowCheck = statusResult.submitNowCheck; // 获取当前作业编号
        const assignmentColumn = `assignment${submitNowCheck}_status`; // 根据编号构造列名

        // 查询 student 表，统计该作业的提交状态为 1 的数量
        const studentsResult = await db.all(`SELECT ${assignmentColumn} FROM student`);
        const uploadCount = studentsResult.filter(student => student[assignmentColumn] === 1 || student[assignmentColumn] === 2).length; // 统计已提交数量

        // 返回已提交数量
        res.json({uploadCount});
    } catch (error) {
        console.error("获取上传数量时发生错误:", error);
        res.status(500).json({error: '服务器错误'});
    }
});

/**
 * @api {get} /api/status/projectNowCheck 获取项目上传数量
 * @apiName GetProjectUploadCount
 * @apiGroup Status
 *
 * @apiSuccess {Number} uploadCount 已提交项目的学生数量
 *
 * @apiError (404) {String} error 状态信息未找到
 * @apiError (500) {String} error 服务器错误
 */
router.get('/projectNowCheck', async (_req, res) => {
    try {
        const db = await dbPromise; // 获取数据库连接

        // 查询 project 表，统计 project1 列的提交状态为 1 的数量
        const studentsResult = await db.all(`SELECT project1 FROM project`);
        const uploadCount = studentsResult.filter(project => project.project1 === 1).length; // 统计已提交数量

        // 返回已提交数量
        res.json({ uploadCount });
    } catch (error) {
        console.error("获取项目上传数量时发生错误:", error);
        res.status(500).json({ error: '服务器错误' });
    }
});

export default router;
