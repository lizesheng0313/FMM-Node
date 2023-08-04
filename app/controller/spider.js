const { Controller } = require("egg");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { successMsg } = require("../../utils/utils");
// 动态生成滚动间隔时间，范围在 500 毫秒到 2000 毫秒之间
function generateScrollInterval() {
  return Math.random() * 1500 + 500;
}
class SpiderController extends Controller {
  async scrapeData() {
    const { ctx } = this;
    const targetUrl = ctx.query.targetUrl; // 接收传入的目标网址

    try {
      const userAgents = [
        // Chrome User-Agents
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",

        // Firefox User-Agents
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0",

        // Safari User-Agents
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",

        // Edge User-Agents
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.38",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.38",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 Edg/92.0.902.84",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 Edg/92.0.902.84",
      ];

      const userAgent =
        userAgents[Math.floor(Math.random() * userAgents.length)];

      const browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        args: ["--disable-web-security"],
      });

      const page = await browser.newPage();
      await page.setUserAgent(userAgent);
      // 设置随机延时
      // 设置额外的HTTP请求头，包括Origin和Referer
      await page.setExtraHTTPHeaders({
        Referer: "https://detail.1688.com",
      });
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 0,
      });
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
          return window.pageYOffset;
        });
        scrollTimes++;
      }

      await page.waitForSelector(".content-detail", { timeout: 100000 });
      const pageContent = await page.content();
      // console.log(pageContent, "---pageContent");
      const $ = cheerio.load(pageContent);
      // 使用 $ 选择器获取指定 class 下的所有 img 标签
      const imgElements = $(".content-detail img");
      console.log(imgElements, "---imgElements");
      const mainElements = $(".detail-gallery-turn-outter-wrapper img");
      // 使用 each 方法遍历 img 标签，并获取它们的 src 属性
      const imgSrcList = [];
      const manImageList = [];
      imgElements.each((index, element) => {
        console.log(element, "---element");
        const src = element.attribs["data-lazyload-src"];
        imgSrcList.push(src);
      });
      mainElements.each((index, element) => {
        const src = element.attribs["src"];
        manImageList.push(src);
      });
      console.log(imgSrcList, "----imgElements");
      console.log(manImageList, "---manImageList");
      const randomCloseWait = (min, max) => Math.random() * (max - min) + min;
      await page.waitForTimeout(randomCloseWait(2000, 4000));
      await browser.close();
      ctx.body = successMsg({
        mainList: manImageList,
        detailsList: imgSrcList,
      });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error };
    }
  }
}

module.exports = SpiderController;
