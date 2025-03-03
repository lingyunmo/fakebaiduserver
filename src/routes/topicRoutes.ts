import express from "express";
import { dbPromise } from "../db";

const router = express.Router();

// 基于 /api/topics 路由，用于获取热门搜索话题

/**
 * @api {get} /api/topics 获取热门搜索话题
 * @apiName GetTopics
 * @apiGroup Topics
 *
 * @apiSuccess {Object[]} topics 热门搜索话题列表
 * @apiSuccess {String} topics.title 热门搜索话题标题
 *
 * @apiError (500) {String} error 内部服务器错误
 */
router.get('/', async (req, res) => {
    try {
        const db = await dbPromise; // 连接数据库
        const topics = await db.all('SELECT title FROM topics'); // 查询所有热门搜索标题
        res.json(topics); // 返回热门搜索话题列表
    } catch (error) {
        console.error('获取热门搜索数据失败', error); // 打印错误日志
        res.status(500).json({error: '获取热门搜索数据失败'}); // 返回500错误
    }
});

export default router;