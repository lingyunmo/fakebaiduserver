import express, { Request } from "express";
import { dbPromise } from "../db";

const router = express.Router();

/**
 * @api {get} /api/chat 获取所有聊天消息
 * @apiName GetChatMessages
 * @apiGroup Chat
 *
 * @apiSuccess {Object[]} messages 聊天消息列表
 * @apiSuccess {Number} messages.id 消息ID
 * @apiSuccess {String} messages.nickname 用户昵称
 * @apiSuccess {String} messages.context 消息内容
 * @apiSuccess {String} messages.time 消息发送时间 (ISO 8601 格式)
 *
 * @apiError {String} error 失败信息
 * @apiError (500) {String} error "Failed to fetch chat messages."
 */
router.get('/', async (_, res) => {
    try {
        const db = await dbPromise;
        const result = await db.all('SELECT * FROM chat ORDER BY time ASC');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat messages.' });
    }
});

/**
 * @api {post} /api/chat 发布一条聊天消息
 * @apiName PostChatMessage
 * @apiGroup Chat
 *
 * @apiParam {String} nickname 用户昵称
 * @apiParam {String} context 消息内容
 * @apiParam {String} time 消息发送时间 (ISO 8601 格式)
 *
 * @apiParamExample {json} 请求示例:
 * {
 *   "nickname": "JohnDoe",
 *   "context": "Hello, world!",
 *   "time": "2024-10-04T12:34:56Z"
 * }
 *
 * @apiSuccess {String} message 成功信息
 * @apiSuccess (201) {String} message "Chat message posted successfully."
 *
 * @apiError {String} error 失败信息
 * @apiError (400) {String} error "Nickname, context, and time are required."
 * @apiError (500) {String} error "Failed to post chat message."
 */
router.post('/', async (req: Request, res) => {
    try {
        const db = await dbPromise;
        const { nickname, context, time } = req.body;

        if (!nickname || !context || !time) {
            return res.status(400).json({ error: 'Nickname, context, and time are required.' });
        }

        await db.run(
            'INSERT INTO chat (nickname, context, time) VALUES (?, ?, ?)',
            [nickname, context, time]
        );

        res.status(201).json({ message: 'Chat message posted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to post chat message.' });
    }
});

export default router;
