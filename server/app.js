import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

// 引入路由模組
import statsRouter from './routes/statsRoute.js'
import announcementsRouter from './routes/announcementRoute.js'
import guidesRouter from './routes/guideRoute.js'
import aboutRouter from './routes/aboutRoute.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173', // 明確指定前端應用的來源
  credentials: true, // 允許憑證
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())

app.get('/', (req, res) => {
  res.send('伺服器運行中 🚀');
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from GDG Backend! We\'ll go from here now.' })
})

app.use('/api/stats', statsRouter)
app.use('/api/announcements', announcementsRouter)
app.use('/api/guides', guidesRouter)
app.use('/api/about', aboutRouter)

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(`❌ Server error: ${err.message}`);
    }
  });
};

startServer(PORT);
