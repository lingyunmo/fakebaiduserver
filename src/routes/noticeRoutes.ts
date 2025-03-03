import express from "express";
import { dbPromise } from "../db";

const router = express.Router();

// 基于 /api/notice
/**
 * @api {get} /api/notice 获取公告
 * @apiName GetNotice
 * @apiGroup Notice
 *
 * @apiSuccess {String} part1 公告的第一部分内容
 * @apiSuccess {String} part2 公告的第二部分内容
 * @apiSuccess {String} time 公告的时间
 *
 * @apiError (404) {String} message 公告未找到
 * @apiError (500) {String} message 服务器错误
 */
router.get('/', async (_req, res) => {
    try {
        const db = await dbPromise;
        const notice = await db.all('SELECT part1, part2, time FROM notice WHERE id = 1'); // 假设只取id为1的公告
        if (notice.length > 0) {
            res.json(notice[0]);
        } else {
            res.status(404).json({ message: '公告未找到' });
        }
    } catch (error) {
        console.error('获取公告失败', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

/**
 * @api {post} /api/notice/update 更新公告
 * @apiName UpdateNotice
 * @apiGroup Notice
 *
 * @apiParam {Number} id 公告的ID
 * @apiParam {String} part1 公告的第一部分内容
 * @apiParam {String} part2 公告的第二部分内容
 * @apiParam {String} time 公告的时间
 *
 * @apiSuccess {String} message 公告更新成功
 *
 * @apiError (400) {String} error 所有字段都是必需的
 * @apiError (500) {String} error 服务器错误
 */
router.post('/update', async (req, res) => {
    const { id, part1, part2, time } = req.body;

    if (!id || !part1 || !part2 || !time) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    const db = await dbPromise;
    try {
        await db.run('UPDATE notice SET part1 = ?, part2 = ?, time = ? WHERE id = ?', [part1, part2, time, id]);
        res.json({ message: '公告更新成功' });
    } catch (error) {
        console.error('更新公告失败', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

export default router;