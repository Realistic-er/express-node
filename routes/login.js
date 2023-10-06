var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const DB = require('../db/connection');
const { body, validationResult } = require('express-validator');
var SECRET_KEY = 'login2023';

/* GET users listing. */
router.post('/login', function(req, res, next) {
    const { account, password } = req.body;
  // 先查找用户名是否在数据库中,定义sql语句
  const sql = "select * from user where account = ?";
  // 执行语句
  DB(sql, account, (err, results) => {
    if (err) return res.output(err);
    // 语句执行成功，但没有相应的username
    if (results.length !== 1) return res.output("登录失败");
    // 语句执行成功，也有相应的username
    // 进行密码的比较
    // 前面是客户端的密码，后面是数据库中存储经过加密的密码
    const compareResult = password === results[0].password;
    // 会返回true或false
    if (!compareResult) {
      return res.output("密码错误，登录失败！");
    }
    // 密码比对正确，在服务端生成token字段
    // 获取到用户的信息，剔除掉密码，生成token
    const user = { account: 'admin' };
    // 对用户的信息进行加密，生成token字符串，参数2和参数3可以直接写，也可以抽出去
    const token = jwt.sign(user, SECRET_KEY,
        { expiresIn: '3h' });
    // 调用res.send将token响应给客户端
    // res.output("登录成功", 0, "Bearer " + tokenStr);
    res.send({
      status: 200,
      message: 'login success!',
      token,
    })
  });
});

// 分页数据
router.get(
  '/info',
  // body('name').notEmpty().withMessage('用户名不能为空'),
  // body('age').notEmpty().withMessage('手机号不能为空'),
  // body('name'),
  // body('age'),
  function (req, res, next) {
    // 校验参数
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errMsg: errors.array()[0]?.msg });
    // }
    // END-校验参数
    // 解构参数并执行SQL
  let sql='select *,* from son,person where son.c_id = person.id'
    DB(
      sql,
      function (err, result) {
        if (err) {
          console.log('[SELECT ERROR]：');
          res.status(500).json({ msg: err.message });
        } else {
          res.send({
            code:200,
            result
          });
        }
      }
    );
    // END-解构参数并执行SQL
});


module.exports = router;

