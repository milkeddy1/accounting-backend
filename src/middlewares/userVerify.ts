const jwt = require("jsonwebtoken");
import { Context, Next } from "koa";

function userVerify(ctx: Context, next: Next) {
  const authHeader = ctx.headers["authorization"];

  // 如果沒有 authorization header
  if (!authHeader) {
    ctx.throw(401, "Authorization header missing");
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer TOKEN"

  try {
    // decode jwt
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    ctx.state.user = user;
    return next();
  } catch (err) {
    ctx.throw(401, "Invalid token");
  }
  console.log("verified...");
  return next();
}

export default userVerify;
