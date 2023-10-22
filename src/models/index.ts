import { Sequelize, Model, DataTypes } from "sequelize"

// init db

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "path_to_your_database_file.sqlite",
})

// 定義 days 模型
export class Day extends Model {}
Day.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    date: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900, // 你可以設定一個最小值，這裡只是作為示範
        max: 2100, // 同樣地，你也可以設定一個最大值
      },
    },
  },
  {
    sequelize,
    tableName: "days",
  }
)

// 定義 items 模型
export class Item extends Model {}
Item.init(
  {
    day_id: {
      type: DataTypes.STRING,
      references: {
        model: Day,
        key: "id",
      },
    },
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tag_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.NUMBER,
    },
    remark: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "items",
  }
)

export class Tags extends Model {}

Tags.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
      validate: {
        // 檢查顏色為6位 hex 格式
        isHexColor(value: string) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            throw new Error("Color must be in HEX format (e.g. #FFFFFF).")
          }
        },
      },
    },
    remark: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "tags",
  }
)

// 建立 Models 關聯
Day.hasMany(Item, { foreignKey: "day_id", sourceKey: "id" })
Item.belongsTo(Day, { foreignKey: "day_id", targetKey: "id" })

sequelize.sync({ force: true }).then(() => {
  console.log("Database & tables created!")
})
