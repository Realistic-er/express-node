var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// 解析 req.body
const bodyParser = require('body-parser'); 
// 用于打印请求的一些信息
var logger = require('morgan');
var { expressjwt:jwt } = require("express-jwt");
const SECRET_KEY = 'login2023'; // 与生成token的密钥要一致!

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// 假如客户端发起了一个post请求，将一个json格式的数据发送到了我们的服务器
// 我们可以使用json解析中间件
app.use(express.json());
// 处理URL-encoded格式的数据
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  jwt({
      secret: SECRET_KEY,
      algorithms: ['HS256'], // 使用何种加密算法解析
  }).unless({ path: ['/login'] }) // 登录页无需校验
)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.status(err.status).json({
    msg: '未知错误',
    code: err.status
  });
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  // res.status(400).json({
  //   msg: '请求错误',
  //   code: err.status
  // });
  // res.status(401).json({
  //   msg: '未经token验证,没有权限',
  //   code: err.status
  // });
  // res.status(403).json({
  //   msg: '服务器拒绝请求',
  //   code: err.status
  // });
  // res.status(404).json({
  //   msg: '服务器找不到请求的网页',
  //   code: err.status
  // });
  
  // res.render('error');
  // res.send({
  //   code: err.status,
  //   msg:'未知错误'
  // })
});

module.exports = app;
