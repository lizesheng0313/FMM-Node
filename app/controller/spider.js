const { Controller } = require("egg");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");
const { successMsg } = require("../../utils/utils");

// 动态生成滚动间隔时间，范围在 500 毫秒到 2000 毫秒之间
function generateScrollInterval() {
  return Math.random() * 1500 + 500;
}
class SpiderController extends Controller {
  async scrapeData() {
    const { ctx } = this;
    try {
      const targetUrl = ctx.query.targetUrl; // 接收传入的目标网
      const proxyServer = `https://tps.kdlapi.com/api/gettps/?secret_id=oa7bk3t07an2r8x8zzyx&num=1&signature=ee82dl0gr9k7jby154hktetp5hnmil67&pt=1&sep=1`;
      const response = await axios.get(proxyServer);
      const ip = await response.data;
      const browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${ip}`],
        defaultViewport: null,
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000);
      await page.authenticate({
        username: "t19391239520320",
        password: "n8yp8t9k",
      });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      );
      const expirationDate1 = new Date("2025-01-11T13:45:19.631Z");
      const expires1 = Math.floor(expirationDate1.getTime() / 1000);
      const expirationDate2 = new Date("2025-01-11T13:45:19.523Z");
      const expires2 = Math.floor(expirationDate2.getTime() / 1000);
      const cookies = [
        {
          name: "cna",
          value: "rQX6HaXJ1kwCAW/F/od3dqby",
          domain: ".mmstat.com",
          path: "/",
          expires: expires1, // 过期时间
          httpOnly: true, // 可以通过非HTTP访问cookie
          secure: false, // 仅通过HTTPS传输cookie
        },
        {
          name: "cna",
          value: "rQX6HaXJ1kwCAW/F/od3dqby",
          domain: ".1688.com",
          path: "/",
          expires: expires2, // 过期时间
          httpOnly: true, // 可以通过非HTTP访问cookie
          secure: false, // 仅通过HTTPS传输cookie
        },
      ];

      await page.setCookie(...cookies);
      await page.goto(targetUrl);
      // await page.waitForTimeout(2000);
      // await page.reload();
      // await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(".detail-gallery-wrapper", {
        timeout: 10000,
      });
      console.log("等待时间到了");
      // 设置滚动的次数和间隔时间
      const maxScrollTimes = 20; // 最大滚动次数
      const maxScrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
      let currentScrollHeight = 0;
      let scrollTimes = 0;

      while (
        currentScrollHeight < maxScrollHeight &&
        scrollTimes < maxScrollTimes
      ) {
        // 使用 page.evaluate 方法在页面上下文中执行滚动操作
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight); // 向下滚动一页的高度
        });

        // 等待动态生成的滚动间隔时间
        const scrollInterval = generateScrollInterval();
        await page.waitForTimeout(scrollInterval);

        currentScrollHeight = await page.evaluate(() => {
          return window.scrollY;
        });
        scrollTimes++;
      }
      await page.waitForSelector(".content-detail img");
      const pageContent = await page.content();
      const $ = cheerio.load(pageContent);
      // 使用 $ 选择器获取指定 class 下的所有 img 标签
      const mainElements = $(".detail-gallery-wrapper img");
      // 使用 each 方法遍历 img 标签，并获取它们的 src 属性
      const imgSrcList = [];
      const manImageList = [];
      mainElements.each((_, element) => {
        const src = element.attribs["src"];
        manImageList.push(src);
      });
      const imgElements = $(".content-detail img");
      imgElements.each((_, element) => {
        const src = element.attribs["data-lazyload-src"];
        imgSrcList.push(src);
      });
      const columnList = [];
      const tagList = $(".sku-prop-module-name");

      // 没有规格时获取产品名称
      const attrItems = $(".offer-attr-item");
      let productNames = "";
      attrItems.each((index, element) => {
        const itemNameElement = $(element).find(".offer-attr-item-name");
        if (
          itemNameElement.length &&
          itemNameElement.text().trim() === "产品名称"
        ) {
          const itemValueElement = $(element).find(".offer-attr-item-value");
          productNames = itemValueElement.text().trim();
        }
      });

      tagList.each((index, element) => {
        const text = $(element).text();
        columnList.push({
          prop: "name" + index,
          label: text === "采购量" ? "规格" : text,
        });
      });
      // 获取规格图片
      const specTable = [];
      const tableList = $(".sku-item-wrapper");
      tableList.each((index, element) => {
        const countWidgetWrapper = $(element);
        const skuItemName = countWidgetWrapper.find(".sku-item-name").text();
        const skuImage = countWidgetWrapper.find(".sku-item-image");
        const styleAttributeValue = skuImage.attr("style");
        let backgroundURLMatch;
        if (styleAttributeValue) {
          console.log(styleAttributeValue, "---styleAttributeValue");
          backgroundURLMatch = styleAttributeValue.match(
            /url\(["']?([^"']+)["']?\)/
          );
        }
        let price = countWidgetWrapper.find(".discountPrice-price").text();
        price = price.replace("元", ""); // 去掉 "元" 字符
        const roundedPrice = Math.ceil(parseFloat(price) * 2);
        const min = 400;
        const max = 900;
        const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
        specTable.push({
          name0: skuItemName,
          goods_picture:
            backgroundURLMatch?.length > 0
              ? backgroundURLMatch[1]
              : manImageList[4],
          skuPrice: roundedPrice,
          skuOriginPrice: roundedPrice + 20,
          cost_price: price,
          skuStock: randomInteger,
        });
      });
      const randomCloseWait = (min, max) => Math.random() * (max - min) + min;
      await page.waitForTimeout(randomCloseWait(2000, 4000));
      await browser.close();
      ctx.body = successMsg({
        mainList: manImageList,
        detailsList: imgSrcList,
        columnList,
        specTable,
      });
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error };
    }
  }
}

module.exports = SpiderController;
