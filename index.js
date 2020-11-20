const express = require('express');
//充当客户端向百度新闻发起请求
const superagent = require('superagent');
const cheerio = require('cheerio');
//使用 Nightmare 自动化测试工具
const Nightmare = require('nightmare')
const nightmare = Nightmare({
    show: false
}) //show:true 显示内置模拟浏览器
const app = express();
// a标签 ：新闻的标题和链接

let hotNews = [];
let localNews = [];

//渲染内容
// let pageRes = {};

/* 
  使用superagent.get()方法来获取百度新闻首页
*/
superagent.get('http://news.baidu.com/').end((err, res) => {
    if (err) {
        console.log('热点新闻抓取失败-' + err);

    } else {
        //返回的数据包含在res中
        // console.log(res.text);
        hotNews = getHotNews(res);
        localNews = getLocalNews(res);

        //渲染内容
        // pageRes = res;
        /* 
        将来后续的操作
            1.存入数据库
            2.跳转对应的路由  /echarts
        */
    }
})

nightmare.goto('http://news.baidu.com/')
    .wait('div#local_news')
    .evaluate(() => document.querySelector('div#local_news').innerHTML)
    .then(htmlStr => {
        localNews = getLocalNews(htmlStr);
    })
    .catch(err => {
        console.log(err);
    })

/* 
获取本地新闻
*/
let getLocalNews = htmlStr => {
    let localNews = [];
    let $ = cheerio.load(htmlStr);
    const xxx = $('ul#localnews-focus')
    console.log('xxx: ', xxx);
    $('ul#localnews-focus li a').each((index, item) => {
        let news = {
            title: $(item).text(), //获取新闻标题
            href: $(item).attr('href') //获取新闻网页链接
        }
        localNews.push(news);
    })

    $('div#localnews-zixun ul li a').each((index, item) => {
        let news = {
            title: $(item).text(), //获取新闻标题
            href: $(item).attr('href') //获取新闻网页链接
        }
        localNews.push(news);
    })
    return localNews;
}

/* 
获取热点新闻
*/
let getHotNews = res => {
    let hotNews = [];
    // 通过第三方的库得到 $
    let $ = cheerio.load(res.text);
    const yyy = $('#top-nav-appintro')
    console.log('yyy: ', yyy);
    $('#pane-news ul li a').each((idx, ele) => {
        let news = {
            title: $(ele).text(), //获取新闻标题
            href: $(ele).attr('href') //获取新闻网页链接
        }
        hotNews.push(news);
    })
    return hotNews;
}

app.get('/', (req, res) => {
    // res.send('爬虫实战');
    res.send({
        hotNews: hotNews,
        localNews: localNews
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
    console.log('Your App is running at http://%s:%s', host, port);
})
