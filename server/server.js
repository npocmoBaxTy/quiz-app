import express from "express"
import cors from "cors"
import router from "./src/routes/index.js";
import cookieParser from "cookie-parser";

const app = express()

app.use(cookieParser())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})
app.use("/api", router)

app.listen(5000, () => {
  console.log("server started")
})