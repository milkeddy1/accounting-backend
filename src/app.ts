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
// const db = new sql.Database("main.db");
const db = new sql.Database(":memory:");

// res =>  {
//  [ {month:1, data: [...每一天的資料 ]}, {month:2, data: [...每一天的資料 ]}, {month:3, data: [...每一天的資料 ]} ]
// }

// data = [
//   {    // single day
//     date, items[], total
//   }
//   ...30 or 31 items
// ]

// items = [
//   {
//     id, name, price, description, tag
//   }
// ]

//  每到新的一個月，會新增空的整個月的資料
// {month: 10, data: [{id, date, items: []}]}

// 新增資料的方式
// 2023 -> month:10 -> data -> date -> items.push({
//     id, name, price, description, tag
//   })

// ===== 初始化資料庫 =====
db.serialize(() => {
  db.run("CREATE TABLE months (id TEXT PRIMARY KEY, month INTEGER NOT NULL)");
  db.run(
    "CREATE TABLE days (id TEXT PRIMARY KEY, month_id INTEGER, date TEXT NOT NULL, FOREIGN KEY(month_id) REFERENCES months(id))"
  );
  db.run(
    "CREATE TABLE items (day_id TEXT, item_data TEXT, FOREIGN KEY(day_id) REFERENCES days(id))"
  );
});

// Session 配置
app.keys = ["some secret key"];
app.use(session({}, app));

// parsing body
app.use(body());

// db initialize
router.get("/initialize", async (ctx) => {
  const stmtMonth = db.prepare("INSERT INTO months (month) VALUES (?)");

  for (let m = 1; m <= 12; m++) {
    stmtMonth.run(m);
  }

  stmtMonth.finalize();

  ctx.body = "Months initialized!";
});
router.get("/checkdata", async (ctx) => {
  // ... [Your previous initialization code]

  // After the initialization, query the months table and log its contents
  db.all("SELECT * FROM months", [], (err, rows) => {
    if (err) {
      throw err; // Handle the error as appropriate for your application
    }
    console.log(rows);
  });

  ctx.body = "Months initialized!";
});

router.get("/", async (ctx) => {
  ctx.body = "21";
});

// ===== routes =====
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());

// start server
app.listen(PORT, () => {
  console.log(`port is running in ${PORT}...\n localhost:3001`);
});
