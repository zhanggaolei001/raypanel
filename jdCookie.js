/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。
const fs = require('fs');
const request = require('request');
var cookieFile = "/scripts/cookie.list"
const cookie_server = ""//panel服务的ip和端口,环境变量中去取,定义下,未来实现,先留着
const server_number = "1"//todo:1.从环境变量中获取服务器编号,从0开始,变量名称待定
const server_token = ""//安全凭据,妥善保管,与panel中对应起来.
const os = require('os');
const { resolve } = require('path');
const platform = os.platform()
switch (platform) {
  case 'darwin':
    console.log("MacOSX")
    break;
  case 'linux':
    cookieFile = "/scripts/cookie.list"
    console.log('Linux')
    break;
  case 'win32':
    cookieFile = "./cookie.list"
    console.log('Windows')
    break;
  default:
    console.log("无法确定操作系统!")
}
function getFileContentByName(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf8');
  }
  return '';
}
let CookieJDs = []
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
function writeToCookieFile(cookies) {
  fs.writeFileSync(cookieFile, cookies)

}
function getLocalCookie() {
  const data = getFileContentByName(cookieFile);
  var lines = data.split(/\r?\n/);
  lines.forEach(line => {
    try {
      if (line.includes("pt_key")) {
        CookieJDs.push(line)
      }
    } catch (error) {
      console.log('错误的cookie格式:' + line);
    }
  })

}
function getServerCookie() {
  var options = {
    'method': 'GET',
    'url': `${cookie_server}/cookies?token=${server_token}&server_number=${server_number}`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) {
      console.log(error);
      getLocalCookie();
    } else {
      console.log(response.body);
      var result = response.body;
      writeToCookieFile(result)
      var lines = result.split(/\r?\n/);
      lines.forEach(line => {
        try {
          if (line.includes("pt_key")) {
            CookieJDs.push(line)
          }
        } catch (error) {
          console.log('错误的cookie格式:' + line);
        }
      })
    }
  });

}
//todo:0:检测当前时间是否为整点附近(如每天小时的58分之前)
var now = new Date();
var minutes = now.getMinutes();
if (server_token && server_number && cookie_server && minutes > 7 && minutes < 52) {
  getServerCookie();
} else {
  getLocalCookie();
}

if (JSON.stringify(process.env).indexOf('GITHUB') > -1) {
  console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    await process.exit(0);
  })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共${CookieJDs.length}个京东账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n提示:京东cookie 【${CookieJDs[i]}】填写不规范,可能会影响部分脚本正常使用。正确格式为: pt_key=xxx;pt_pin=xxx;（分号;不可少）\n`);
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
