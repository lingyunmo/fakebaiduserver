import express from "express";
import { dbPromise } from "../db";

const router = express.Router();

// 基于 /api/assignments
/**
 * @api {get} /api/assignments 获取可提交的作业类型
 * @apiName GetAssignments
 * @apiGroup Assignments
 *
 * @apiSuccess {Object[]} assignments 可提交的作业类型数组
 * @apiSuccess {String} assignments.assignment_name 作业名称
 * @apiSuccess {Number} assignments.submit_status 提交状态（0: 不可提交, 1: 可提交）
 *
 * @apiError (500) {String} error 内部服务器错误
 */
router.get('/', async (_req, res) => {
    try {
        const db = await dbPromise; // 假设你有一个数据库连接
        const assignments = await db.all('SELECT assignment_name, submit_status FROM assignments');

        const assignmentOptions = assignments.map(assignment => ({
            assignment_name: assignment.assignment_name,
            submit_status: assignment.submit_status
        }));

        res.json({ assignments: assignmentOptions });
    } catch (error) {
        console.error('获取作业类型失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

/**
 * @api {post} /api/assignments/toggle 更新作业可提交状态
 * @apiName ToggleAssignmentStatus
 * @apiGroup Assignments
 *
 * @apiParam {String} assignmentName 作业名称
 * @apiParam {Number} submitStatus 提交状态（0: 不可提交, 1: 可提交）
 *
 * @apiSuccess {String} message 状态更新成功
 *
 * @apiError (400) {String} error 参数不正确
 * @apiError (500) {String} error 内部服务器错误
 */
router.post('/toggle', async (req, res) => {
    const { assignmentName, submitStatus } = req.body; // 传入作业名称和状态

    if (!assignmentName || (submitStatus !== 0 && submitStatus !== 1)) {
        return res.status(400).json({ error: '参数不正确' });
    }

    try {
        const db = await dbPromise; // 获取数据库连接
        await db.run('UPDATE assignments SET submit_status = ? WHERE assignment_name = ?', [submitStatus, assignmentName]);
        res.json({ message: '状态更新成功' });
    } catch (error) {
        console.error('更新作业状态失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

/**
 * @api {get} /api/assignments/status 获取用户状态
 * @apiName GetUserStatus
 * @apiGroup Assignments
 *
 * @apiSuccess {Object[]} users 用户状态数组
 * @apiSuccess {String} users.name 用户姓名
 * @apiSuccess {Boolean} users.assignment1 作业1 提交状态（true: 已提交, false: 未提交）
 * @apiSuccess {Boolean} users.assignment2 作业2 提交状态（true: 已提交, false: 未提交）
 * @apiSuccess {Boolean} users.assignment3 作业3 提交状态（true: 已提交, false: 未提交）
 * @apiSuccess {Boolean} users.assignment4 作业4 提交状态（true: 已提交, false: 未提交）
 * @apiSuccess {Boolean} users.assignment5 作业5 提交状态（true: 已提交, false: 未提交）
 *
 * @apiError (500) {String} error 内部服务器错误
 */
router.get('/status', async (_req, res) => {
    try {
        const db = await dbPromise;
        const users = await db.all('SELECT name, assignment1_status, assignment2_status, assignment3_status, assignment4_status, assignment5_status FROM student');

        const userStatus = users.map(user => ({
            name: user.name,
            assignment1: [1, 2].includes(user.assignment1_status), // 作业1 状态判断
            assignment2: [1, 2].includes(user.assignment2_status), // 作业2 状态判断
            assignment3: [1, 2].includes(user.assignment3_status), // 作业3 状态判断
            assignment4: [1, 2].includes(user.assignment4_status), // 作业4 状态判断
            assignment5: [1, 2].includes(user.assignment5_status), // 作业5 状态判断
        }));

        res.json(userStatus);
    } catch (error) {
        console.error('获取用户状态失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
    }
});

export default router;