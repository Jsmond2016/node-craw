
// 爬虫来源：https://juejin.cn/post/6892346298964869127
// jQuery 学习文档：https://jquery.cuishifeng.cn/
// nightmare 文档：https://www.cnblogs.com/shen55/p/12241695.html
// 推荐学习 nodejs爬虫博客专栏：https://www.cnblogs.com/xiaxuexiaoab/tag/nodejs%E7%88%AC%E8%99%AB/

const express = require('express');
//充当客户端向百度新闻发起请求
const superagent = require('superagent');
const cheerio = require('cheerio');
//使用 Nightmare 自动化测试工具
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  //show:true 显示内置模拟浏览器
  show: false
}) 
const app = express();

let newBookList = [];
let attentionList = [];

// 豆瓣读书-小说
const url = 'https://book.douban.com/tag/%E5%B0%8F%E8%AF%B4'

//渲染内容
// let pageRes = {};

/* 
  使用superagent.get()方法来获取百度新闻首页
*/
superagent.get(url).end((err, res) => {
  if (err) {
    console.log('豆瓣图书抓取失败-' + err);
  }
  // console.log(res)
  newBookList = getNewBookList(res);
  attentionList = getAttentionList(res);
})

nightmare.goto(url)
  .wait('div#subject_list', '#book_rec')
  .evaluate(() => ({
    subListHtml: document.querySelector('div#subject_list').innerHTML,
    attenHtml: document.querySelector('#book_rec').innerHTML
  })) // 获取的值作为结果给到 then 的 res，即 htmlStr
  .then(html => {
    const { subListHtml, attenHtml } = html
    newBookList = getNewBookList(subListHtml);
    attentionList = getAttentionList(attenHtml)
  })
  .catch(err => {
    console.log(err);
  })

/* 
获取本地新闻
*/
let getNewBookList = htmlStr => {
  let newBooks = [];
  let $ = cheerio.load(htmlStr);
  $('.subject-list > li').each((index, item) => {
      const href = $(item).find("div.info h2 a").attr("href")
      const bookName = $(item).find("div.info h2 a").text().trim()
      newBooks.push({
        imgUrl: href,
        bookName
      })
    })
  return newBooks;
}

/* 
获取热点新闻
*/
let getAttentionList = res => {
  let attList = [];
  // 通过第三方的库得到 $
  let $ = cheerio.load(res);
  $('dl').each((idx, ele) => {
    const bookUrl = $(ele).find('dt a').attr('href')
    const bookName = $(ele).find('dd a').text().trim()
    attList.push({
      attrBookUrl: bookUrl,
      attrBookName: bookName  
    });
  })
  return attList;
}

app.get('/', (req, res) => {
  // res.send('爬虫实战');
  res.send({
    attentionList: attentionList,
    newBookList: newBookList
  });
  //渲染内容
  // res.send(pageRes.text);
})

let server = app.listen(3000, () => {
  //获取地址
  let host = server.address().address;
  //获取端口号
  let port = server.address().port;
  // %s 占位符
  console.log('Your App is running at http://localhost:3000');
})
