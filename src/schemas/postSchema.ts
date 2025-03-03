import { z } from 'zod';
import dayjs from 'dayjs';

export const postSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, '标题不能为空'),
    content: z.string().min(1, '内容不能为空'),
    date: z.string().default(dayjs().toISOString()),
    author: z.string().default('匿名'),
    replies: z.array(z.object({
        id: z.number().optional(),
        author: z.string().default('匿名'),
        date: z.string().default(dayjs().toISOString()),
        content: z.string().default('')
    })).default([])
});

export const replySchema = z.object({
    id: z.number().optional(),
    author: z.string().default('匿名'),
    date: z.string().default(dayjs().toISOString()),
    content: z.string().default('')
});
