import { addPost, addReply, getAllPosts, getPostById } from "../services/postService";
import express, { NextFunction, Request, Response } from "express";
import { dbPromise } from "../db";
import { z } from "zod";
import { postSchema, replySchema } from "../schemas/postSchema";

const router = express.Router();

const postIdSchema = z.number().int().positive();

// 基于 /api/posts/*

// 获取所有帖子
/**
 * @api {get} /api/posts/all 获取所有帖子
 * @apiName GetAllPosts
 * @apiGroup Posts
 *
 * @apiSuccess {Object[]} posts 帖子列表
 * @apiSuccess {Number} posts.id 帖子ID
 * @apiSuccess {String} posts.title 帖子标题
 * @apiSuccess {String} posts.content 帖子内容
 * @apiSuccess {String} posts.author 帖子作者
 * @apiSuccess {String} posts.date 帖子发布日期 (ISO 8601 格式)
 *
 * @apiError {String} error 失败信息
 * @apiError (500) {String} error "获取帖子失败"
 */
router.get('/all', async (_, res, next) => {
    try {
        const posts = await getAllPosts();
        res.send(posts);
    } catch (error) {
        next(error);
    }
});

// 获取单个帖子及其回复
/**
 * @api {get} /api/posts/ 获取单个帖子
 * @apiName GetPostById
 * @apiGroup Posts
 *
 * @apiParam {Number} id 帖子ID
 *
 * @apiSuccess {Object} post 帖子详情
 * @apiSuccess {Number} post.id 帖子ID
 * @apiSuccess {String} post.title 帖子标题
 * @apiSuccess {String} post.content 帖子内容
 * @apiSuccess {String} post.author 帖子作者
 * @apiSuccess {String} post.date 帖子发布日期 (ISO 8601 格式)
 * @apiSuccess {Object[]} post.replies 回复列表
 * @apiSuccess {Number} post.replies.id 回复ID
 * @apiSuccess {String} post.replies.content 回复内容
 * @apiSuccess {String} post.replies.author 回复作者
 * @apiSuccess {String} post.replies.date 回复发布日期 (ISO 8601 格式)
 *
 * @apiError {String} error 失败信息
 * @apiError (404) {String} error "帖子未找到"
 * @apiError (400) {String} error "无效的帖子 ID"
 * @apiError (500) {String} error "获取帖子时出错"
 */
router.get('/', async (req: Request, res) => {
    const postId = parseInt(req.query.id as string, 10);

    try {
        // 验证 postId
        postIdSchema.parse(postId);
        // 查询帖子
        const post = await getPostById(postId);
        // 如果帖子未找到，返回 404
        if (!post) {
            return res.status(404).json({ error: '帖子未找到' });
        }
        // 查询该帖子的回复
        post.replies = await dbPromise.then(db => db.all('SELECT * FROM replies WHERE post_id = ?', postId));
        // 返回帖子及其回复
        res.json(post);
    } catch (error) {
        console.error('获取帖子时出错:', error);
        res.status(error instanceof z.ZodError ? 400 : 500).json({ error: '无效的帖子 ID' });
    }
});

// 发布一条帖子
/**
 * @api {post} /api/posts/add 发布一条帖子
 * @apiName AddPost
 * @apiGroup Posts
 *
 * @apiParam {String} title 帖子标题
 * @apiParam {String} content 帖子内容
 * @apiParam {String} author 帖子作者
 *
 * @apiParamExample {json} 请求示例:
 * {
 *   "title": "我的第一篇帖子",
 *   "content": "欢迎来到我的帖子！",
 *   "author": "JohnDoe"
 * }
 *
 * @apiSuccess {String} message 成功信息
 * @apiSuccess (201) {String} message "帖子发布成功"
 * @apiSuccess {Object} post 新发布的帖子详情
 * @apiSuccess {Number} post.id 帖子ID
 * @apiSuccess {String} post.title 帖子标题
 * @apiSuccess {String} post.content 帖子内容
 * @apiSuccess {String} post.author 帖子作者
 * @apiSuccess {String} post.date 帖子发布日期 (ISO 8601 格式)
 *
 * @apiError {String} error 失败信息
 * @apiError (400) {String} error "请求参数无效"
 * @apiError (500) {String} error "发布帖子失败"
 */
router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    const { title, content, author } = req.body;

    try {
        const validatedPost = postSchema.parse({
            title,
            content,
            author,
            date: new Date().toISOString()
        });

        const newPost = await addPost(validatedPost);
        res.send({ message: '帖子发布成功', post: newPost });
    } catch (error) {
        next(error);
    }
});

// 回复帖子
/**
 * @api {post} /api/posts/reply 回复帖子
 * @apiName AddReply
 * @apiGroup Posts
 *
 * @apiParam {Number} postId 帖子ID
 * @apiParam {String} reply 回复内容
 *
 * @apiParamExample {json} 请求示例:
 * {
 *   "postId": 1,
 *   "reply": "这是一条回复"
 * }
 *
 * @apiSuccess {String} message 成功信息
 * @apiSuccess (201) {String} message "回复已保存"
 * @apiSuccess {Object} reply 回复详情
 * @apiSuccess {String} reply.content 回复内容
 * @apiSuccess {String} reply.author 回复作者
 * @apiSuccess {String} reply.date 回复发布日期 (ISO 8601 格式)
 *
 * @apiError {String} error 失败信息
 * @apiError (400) {String} error "回复数据无效"
 * @apiError (500) {String} error "回复失败"
 */
router.post('/reply', async (req: Request, res) => {
    const { postId, reply } = req.body;

    try {
        postIdSchema.parse(postId);
        const validatedReply = replySchema.parse(reply);

        await addReply(postId, validatedReply);
        res.send({ message: '回复已保存', reply: validatedReply });
    } catch (error) {
        res.status(error instanceof z.ZodError ? 400 : 500).send({ error: '回复数据无效' });
    }
});

export default router;
