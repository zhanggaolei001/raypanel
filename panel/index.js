const notify = require('./sendNotify');
const express = require('express'); 
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express();
const fs = require('fs');
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/logs')));
var cookieFile = "/scripts/cookie.list"
const os = require('os'); 
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
 
 
 
app.get('/logs', function (request, response) {
  (async () => {
    try {
      //todo:枚举今日所有日志文件
      var pathName = "/scripts/panel/public/logs";
      fs.readdir(pathName, function (err, files) {
        var list = [];
        if (files) {
          files.forEach(file => {
            list.push(`<li><a href='./${file}'>${file}</a><br/><a href='./delete/${file}'>删除↑↑↑↑↑</a></li>`)
          })
          let result = `<ul> ${list.join("<br/>")}</ul>`
          console.log(result);
          response.send(result)
        } else {
          response.send("没有日志")
        }
      });

    } catch (err) {
      response.send({ err: 2, msg: '错误' });
    }
  })();
}); 
app.get('/logs/delete/:file', function (req, res) {
  var file = req.params.file;
  //todo:删除file:
  fs.unlinkSync(`/scripts/panel/public/logs/${file}`);
  // fs.unlinkSync(`D:/github/jd_scripts/panel/public/logs/${file}`);
  //删除后让客户端跳转
  res.statusCode = 302
  res.setHeader('Location', '/logs')
  res.send('ok,返回中...');
});
//检测本站有多少用户
app.get('/totalCount', function (req, res) {
  const data = getFileContentByName(cookieFile);
 
  var lines = data.split(/\r?\n/);
  var cookieArr = []
  lines.forEach(line => {
    try {
      if (line.includes("pt_key")) {
        cookieArr.push(line)
      }
    } catch (error) {
      console.log('错误的cookie格式:' + line);
    }
  })
  res.send(`{"totalCount":${cookieArr.length}}`) 
});  
const vipGroup = ['vipusrPin']

function getFileContentByName(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf8');
  }
  return '';
} 


app.post('/addck', function (request, response) {
  const ck = request.query.ck; 
   
  if (ck) {
    (async () => {
      console.log("获取到新用户:"+ck);
      try { 
        try {
          var userCookie = ck;
          var pt_pin = userCookie.split(';')[1].split('=')[1] 
          const data = getFileContentByName(cookieFile); 
          var isNewUser = true;
          var lines = data.split(/\r?\n/);
          var cookieArr = []
          lines.forEach(line => {
            try {
              if (line.includes("pt_key")) {
                cookieArr.push(line)
              }
            } catch (error) {
              console.log('错误的cookie格式:' + line);
            }
          })
          cookieArr.forEach(cookie_str => { 
            if (cookie_str) {
              if (cookie_str.indexOf(pt_pin) != -1) {
                isNewUser = false;
              }
            }
          })
          if (isNewUser) {  
            cookieArr.push(userCookie) 
          } else {
            var oldCookieIndex = cookieArr.findIndex(cookie => cookie.includes(pt_pin)) 
            cookieArr[oldCookieIndex] = userCookie   
            if (vipGroup.includes(pt_pin)) { 
            }
             else {
              cookieArr = cookieArr.filter(function (item) {
                return item != userCookie;
              });
              cookieArr.splice(oldCookieIndex + 1, 0, userCookie); 
            } 
          } 
          var newCookies = [];
          var i = 1;
          cookieArr.forEach(c => {
            newCookies.push(c);
          })
          try {
            fs.writeFileSync(cookieFile, newCookies.join("\n"))
            notify.sendNotify("cookie更新或新增", pt_pin + "\r\n")
            response.send("ok");
          } catch (error) {
            console.log(error);
          }
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        response.send(err);
      }
    })();
  } else {
    response.send("ck不能为空");
  } 
});

// 本地运行开启以下
const PORT = 5678;
app.listen(PORT, () => {
  console.log(`应用正在监听 ${PORT} 端口!`);
});

// 云函数运行开启以下
module.exports = app;
