import {dbPromise} from "../db";

// 读取所有论坛帖子
export const getAllPosts = async () => {
    const db = await dbPromise;
    return db.all('SELECT * FROM posts');
};

// 根据 ID 读取单个帖子
export const getPostById = async (postId: number) => {
    const db = await dbPromise;
    return db.get('SELECT * FROM posts WHERE id = ?', postId);
};

// 添加新帖子
export const addPost = async (post: any) => {
    const db = await dbPromise;
    const {title, content, author, date} = post;
    const {lastID} = await db.run('INSERT INTO posts (title, content, date, author) VALUES (?, ?, ?, ?)', title, content, date, author);
    return {id: lastID, ...post};
};

// 添加回复
export const addReply = async (postId: number, reply: any) => {
    const db = await dbPromise;
    const {author, date, content} = reply;
    await db.run('INSERT INTO replies (post_id, author, date, content) VALUES (?, ?, ?, ?)', postId, author, date, content);
};