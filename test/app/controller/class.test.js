"use strict";

const { app } = require("egg-mock/bootstrap");

describe("GET /api/goods/getClassiFication", () => {
  it("should get classification list successfully", async () => {
    // 模拟请求参数
    const typeId = 1;
    const res = await app
      .httpRequest()
      .get("/api/goods/getClassiFication")
      .query({ typeId })
      .expect(200);
    console.log(res.body.data.leftList, "---res");
    console.log(res.body.data.rightList, "---res");
  });
});
