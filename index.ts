import express from 'express';
import cors from 'cors';
import appRoutes from "./src/appRoutes";

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/api', appRoutes);

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，访问地址：http://localhost:${PORT}`);
});