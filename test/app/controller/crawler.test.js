"use strict";

const { app } = require("egg-mock/bootstrap");

describe("GET /api/get/targetInfo", () => {
  it("should get classification list successfully", async () => {
    // 模拟请求参数
    const targetUrl =
      "https://detail.1688.com/offer/725415830579.html?spm=a2638t.27033214.reofferlist.3.7695436cOIAizh&cosite=-&ilike_session=7e0d45db72ef4bc39425bc83b511ec91&tracelog=p4p&_p_isad=1&clickid=7e0d45db72ef4bc39425bc83b511ec91&sessionid=fc6255edb753a97bbdf5070745e47d73";
    // 使用axios发送HTTP请求获取网页内容
    const response = await app
      .httpRequest()
      .get("/api/get/targetInfo")
      .query({ targetUrl })
      .expect(200);
  });
});
