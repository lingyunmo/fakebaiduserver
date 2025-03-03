import express from "express";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 存储有效的 token，包括唯一 ID 和状态
let validTokens: { [key: string]: { status: '有效' | '认证'; expiration: NodeJS.Timeout } } = {};

// 基于 /api/qr/*

// 生成唯一 ID 并将其标记为有效
/**
 * @api {post} /api/qr/generate 生成唯一 ID
 * @apiName GenerateUniqueId
 * @apiGroup QR
 *
 * @apiSuccess {String} uniqueId 生成的唯一 ID
 *
 * @apiSuccessExample {json} 成功响应示例:
 * {
 *   "uniqueId": "c9f0f895fb98ab9159f51fd0297e236d"
 * }
 *
 * @apiError {String} error 失败信息
 * @apiError (500) {String} error "生成唯一 ID 失败"
 */
router.get('/generate', (_req, res) => {
    try {
        const uniqueId = uuidv4();
        validTokens[uniqueId] = {
            status: '有效',
            expiration: setTimeout(() => {
                // 超时后直接删除 token
                delete validTokens[uniqueId];
            }, 5 * 60 * 1000) // 5分钟后删除
        };
        res.json({ uniqueId });
    } catch (error) {
        res.status(500).json({ error: '生成唯一 ID 失败' });
    }
});

// 认证路由
/**
 * @api {get} /api/qr/auth/:uniqueId 认证二维码
 * @apiName AuthenticateQr
 * @apiGroup QR
 *
 * @apiParam {String} uniqueId 唯一 ID
 *
 * @apiSuccess {String} message 认证结果信息
 * @apiSuccessExample {json} 成功响应示例:
 * "认证成功！"
 *
 * @apiError {String} error 失败信息
 * @apiError (400) {String} error "认证失败，二维码无效或已使用。"
 */
router.get('/auth/:uniqueId', (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        if (validTokens[uniqueId]) {
            if (validTokens[uniqueId].status === '有效') {
                validTokens[uniqueId].status = '认证'; // 标记为已认证
                clearTimeout(validTokens[uniqueId].expiration); // 清除过期定时器
                res.send('认证成功！');
            } else if (validTokens[uniqueId].status === '认证') {
                res.status(400).json({ error: '认证失败，二维码已被认证。' });
            }
        } else {
            res.status(400).json({ error: '认证失败，二维码无效。' });
        }
    } catch (error) {
        res.status(500).json({ error: '认证过程中发生错误' });
    }
});

// 检查二维码是否有效
/**
 * @api {get} /api/qr/check/:uniqueId 检查二维码有效性
 * @apiName CheckQrValidity
 * @apiGroup QR
 *
 * @apiParam {String} uniqueId 唯一 ID
 *
 * @apiSuccess {String} status 二维码的状态 ("有效", "认证")
 * @apiSuccessExample {json} 成功响应示例:
 * {
 *   "status": "有效"
 * }
 *
 * @apiError {String} error 失败信息
 * @apiError (404) {String} error "二维码不存在"
 */
router.get('/check/:uniqueId', (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        if (validTokens[uniqueId]) {
            res.json({ status: validTokens[uniqueId].status });
        } else {
            res.status(404).json({ error: '二维码不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '检查二维码有效性时发生错误' });
    }
});

export default router;