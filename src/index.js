import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
const app = express();
dotenv.config();
app.use(express.json());
app.use('/', authRoutes);
app.use('/wallet', walletRoutes);
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});