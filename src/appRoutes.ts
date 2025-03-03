import postRoutes from "./routes/postRoutes";
import topicRoutes from "./routes/topicRoutes";
import chatRoutes from "./routes/chatRoutes";
import QRCodeRoutes from "./routes/QRCodeRoutes";
import newsRoutes from "./routes/newsRoutes";
import noticeRoutes from "./routes/noticeRoutes";
import assignmentsRoutes from "./routes/assignmentsRoutes";
import statusRoutes from "./routes/statusRoutes";
import adminRoutes from "./routes/adminRoutes";
import projectRoutes from "./routes/projectRoutes";
import submitRoutes from "./routes/submitRoutes";
import express from "express";
import authRoutes from "./routes/authRoutes";

const router = express();

//base on /api
router.use('/posts', postRoutes);
router.use('/topics', topicRoutes);
router.use('/chat', chatRoutes);
router.use('/qr', QRCodeRoutes);
router.use('/news', newsRoutes);
router.use('/notice', noticeRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/status', statusRoutes);
router.use('/adminRoutes', adminRoutes);
router.use('/project', projectRoutes);
router.use('/submit', submitRoutes);

router.use('/', authRoutes);

router.get('/greet', (_req, res) => {
    res.send({message: 'Hello from Node.js server! (By TypeScript)'});
});

export default router;