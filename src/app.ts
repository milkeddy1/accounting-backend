import Koa from "koa"
import Router from "koa-router"
import sqlite3 from "sqlite3"
import * as dotenv from "dotenv"
import session from "koa-session"
import body from "koa-body"
import { userVerify } from "./middlewares"
import { authRouter } from "./routes"
import { Day, Item } from "./models"
import { v4 as uuid } from "uuid"
dotenv.config()

const PORT = 3001
const app = new Koa()
const router = new Router()

const sql = sqlite3.verbose()

// ===== 創建資料庫連線 =====
// const db = new sql.Database("main.db");
const db = new sql.Database(":memory:")

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
// Session 配置
app.keys = ["some secret key"]
app.use(session({}, app))

// parsing body
app.use(body())

// db initialize
router.get("/month-initialize", async (ctx) => {
  // 找到當前年份
  const currentYear = new Date().getFullYear()
  // 找到當前月份
  const currentMonth = new Date().getMonth() + 1 // month returns 0 - 11
  // 找到當月天數
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

  // 創建
  for (let i = 1; i <= daysInMonth; i++) {
    await Day.findOrCreate({
      where: { date: i, month: currentMonth, year: currentYear },
      defaults: {
        id: uuid(),
        date: i,
        month: currentMonth,
        year: currentYear,
      },
    })
  }
  ctx.body = `Days of month ${currentMonth} in year ${currentYear} added successfully!`
})
router.get("/get-month", async (ctx) => {
  const inputDate = ctx.query.date
  if (!inputDate) {
    throw Error("Invalid date!")
  }
  const [year, month] = (inputDate as string)
    .split("-")
    .map((num) => parseInt(num))
  // 使用Sequelize查詢該月的所有days以及與之相關的items
  const days = await Day.findAll({
    where: {
      month: month,
      year: year,
    },
    include: [
      {
        model: Item,
        foreignKey: "day_id",
        attributes: ["id", "tag_id", "name", "price", "remark"], // 這裡選擇你想返回的items的欄位
      },
    ],
    order: [["date", "ASC"]],
  })

  // 格式化數據以匹配您提供的格式
  // const formattedData = days.map((day) => ({
  //   id: day.id,
  //   date: day.date,
  //   items: day.items,
  // }))
  console.log(days, "daysdaysdaysdays")

  ctx.body = days
})

router.get("/", userVerify, async (ctx) => {
  ctx.body = "21"
})

// ===== routes =====
app.use(authRouter.routes()).use(authRouter.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

// start server
app.listen(PORT, () => {
  console.log(`port is running in ${PORT}...\n localhost:3001`)
})
