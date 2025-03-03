import express from "express";
import { dbPromise } from "../db";

const router = express.Router();

// 基于 /api/news

// 获取所有新闻
/**
 * @api {get} /api/news 获取所有新闻
 * @apiName GetAllNews
 * @apiGroup News
 *
 * @apiSuccess {Object[]} news 新闻数组
 * @apiSuccess {Number} news.id 新闻唯一标识
 * @apiSuccess {String} news.title 新闻标题
 * @apiSuccess {String} news.content 新闻内容
 * @apiSuccess {String} news.date 新闻发布日期
 *
 * @apiSuccessExample {json} 成功响应示例:
 * [
 *   {
 *     "id": 1,
 *     "title": "新闻标题 1",
 *     "content": "新闻内容 1",
 *     "date": "2024-10-04T10:00:00Z"
 *   },
 *   {
 *     "id": 2,
 *     "title": "新闻标题 2",
 *     "content": "新闻内容 2",
 *     "date": "2024-10-03T10:00:00Z"
 *   }
 * ]
 *
 * @apiError {String} error 失败信息
 * @apiError (500) {String} error "获取新闻数据失败"
 */
router.get('/', async (_req, res) => {
    try {
        const db = await dbPromise;
        const news = await db.all('SELECT * FROM news ORDER BY date DESC');
        res.json(news);
    } catch (error) {
        console.error('获取新闻数据失败', error);
        res.status(500).json({ error: '获取新闻数据失败' });
    }
});

// 获取特定新闻
/**
 * @api {get} /api/news/:id 获取特定新闻
 * @apiName GetNewsById
 * @apiGroup News
 *
 * @apiParam {Number} id 新闻的唯一标识
 *
 * @apiSuccess {Object} news 新闻对象
 * @apiSuccess {Number} news.id 新闻唯一标识
 * @apiSuccess {String} news.title 新闻标题
 * @apiSuccess {String} news.content 新闻内容
 * @apiSuccess {String} news.date 新闻发布日期
 *
 * @apiSuccessExample {json} 成功响应示例:
 * {
 *   "id": 1,
 *   "title": "新闻标题 1",
 *   "content": "新闻内容 1",
 *   "date": "2024-10-04T10:00:00Z"
 * }
 *
 * @apiError {String} error 失败信息
 * @apiError (404) {String} error "新闻未找到"
 * @apiError (500) {String} error "获取特定新闻数据失败"
 */
router.get('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const newsId = req.params.id;
        const newsItem = await db.get('SELECT * FROM news WHERE id = ?', newsId);

        if (newsItem) {
            res.json(newsItem);
        } else {
            res.status(404).json({ error: '新闻未找到' });
        }
    } catch (error) {
        console.error('获取特定新闻数据失败', error);
        res.status(500).json({ error: '获取特定新闻数据失败' });
    }
});

export default router;
