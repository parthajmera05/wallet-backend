import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import fraudRoutes from "./routes/fraudRoutes.js";
import { startFraudScanJob } from "./jobs/fraudScanner.js";


const app = express();
dotenv.config();

app.use(express.json());

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/wallet', walletRoutes);
app.use('/fraud', fraudRoutes);

startFraudScanJob();

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});