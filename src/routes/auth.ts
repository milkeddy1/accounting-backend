import Router from "koa-router";
import axios from "axios";
const jwt = require("jsonwebtoken");
const router = new Router();

const path = "/auth/google/token";

type googleAuth = {
  credential: string;
};

router.post(path, async (ctx) => {
  // 前端 request 的 credential
  const { credential }: googleAuth = ctx.request.body;

  // 使用 credential 與 Google 取得 access token
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code: credential,
    grant_type: "authorization_code",
    // redirect_uri: 'YOUR_FRONTEND_REDIRECT_URL'
  });

  const { access_token: accessToken } = response.data;

  // 使用 google 取得的 access_token 取得使用者資訊
  const userResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
  );
  const user = userResponse.data;
  const token = jwt.sign(user, process.env.TOKEN_SECRET);
  ctx.body = { token };
});

export default router;
