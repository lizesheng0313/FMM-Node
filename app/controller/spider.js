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
      // const proxyServer = `https://tps.kdlapi.com/api/gettps/?secret_id=oq09yz2dto4zwtb618af&num=1&signature=w1ta8d0klnddbcwecvu5qrci9yy60elq&pt=1&format=json&sep=1`;
      // const response = await axios.get(proxyServer);
      // const ip = await response.data?.data?.proxy_list;
      // const browser = await puppeteer.launch({
      //   headless: false,
      //   args: [`--proxy-server=http://${ip}`],
      // });
      const browser = await puppeteer.launch({
        headless: false,
        // args: [`--proxy-server=http://proxy.stormip.cn`],
      });
      const page = await browser.newPage();
      // await page.authenticate({
      //   username: "t19215058077636",
      //   password: "jwi96jst",
      // });
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      );
      // 设置额外的HTTP请求头，包括Origin和Referer
      await page.setExtraHTTPHeaders({
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      });
      await page.goto(targetUrl, {
        timeout: 0,
        waitUntil: "domcontentloaded", // 等待 DOMContentLoaded 事件触发
      });
      await page.waitForSelector(".detail-gallery-wrapper");
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
      console.log(pageContent, "---pageContent");
      const $ = cheerio.load(pageContent);
      // 使用 $ 选择器获取指定 class 下的所有 img 标签
      const mainElements = $(".detail-gallery-wrapper img");
      // 使用 each 方法遍历 img 标签，并获取它们的 src 属性
      const imgSrcList = [];
      const manImageList = [];
      mainElements.each((index, element) => {
        console.log(element, "---element");
        const src = element.attribs["src"];
        manImageList.push(src);
      });
      const imgElements = $(".content-detail img");
      imgElements.each((index, element) => {
        const src = element.attribs["data-lazyload-src"];
        imgSrcList.push(src);
      });
      console.log(imgSrcList, "----imgElements");
      console.log(manImageList, "---manImageList");
      const randomCloseWait = (min, max) => Math.random() * (max - min) + min;
      await page.waitForTimeout(randomCloseWait(2000, 4000));
      // await browser.close();
      ctx.body = successMsg({
        mainList: manImageList,
        detailsList: imgSrcList,
      });
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error };
    }
  }
}

module.exports = SpiderController;
