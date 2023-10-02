import Koa from "koa";
import Router from "koa-router";
import sqlite3 from "sqlite3";
import * as dotenv from "dotenv";
import session from "koa-session";
import body from "koa-body";
import { userVerify } from "./middlewares";
import { authRouter } from "./routes";
dotenv.config();

const PORT = 3001;
const app = new Koa();
const router = new Router();

const sql = sqlite3.verbose();

// ===== 創建資料庫連線 =====
const db = new sql.Database(":memory:");

// ===== 初始化資料庫 =====
db.serialize(() => {
  db.run("CREATE TABLE user (id INT, name TEXT)");

  const stmt = db.prepare("INSERT INTO user VALUES (?, ?)");
  stmt.run(1, "John Doe");
  stmt.finalize();
});

// Session 配置
app.keys = ["some secret key"];
app.use(session({}, app));

// parsing body
app.use(body());

router.get("/", userVerify, async (ctx) => {
  ctx.body = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM user", [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
});

// ===== routes =====
app.use(authRouter.routes()).use(authRouter.allowedMethods());

// start server
app.listen(PORT, () => {
  console.log(`port is running in ${PORT}...\n localhost:3001`);
});
