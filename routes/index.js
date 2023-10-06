var express = require('express');
var router = express.Router();
const DB = require('../db/connection');
const multer = require('multer');//formdata数据处理
const upload = multer({ dest: './uploads' });
const multiparty = require("multiparty");
const { body, validationResult } = require('express-validator');
const Minio = require('minio') //minio分布式储存


var minioClient = new Minio.Client({
  endPoint: '192.168.1.2', // 本机内网ip 注意：不要携带http或https
  port: 9000,    //端口号默认为9000 如果有多个端口号需在服务器查看对应的端口
  useSSL: false, // false代表不需要https
  accessKey: 'minioadmin',  // 账号
  secretKey: 'minioadmin' // 密码
});
/* 接收用户需求接口 */
router.post(
  '/sendDemand',
  // body('name').notEmpty().withMessage('用户名不能为空'),
  // body('age').notEmpty().withMessage('手机号不能为空'),
  body('name'),
  body('age'),
  function (req, res, next) {
    // 校验参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errMsg: errors.array()[0]?.msg });
    }
    // END-校验参数
    // 解构参数并执行SQL
    const { name, age } = req.body;
    DB(
      'insert into person(name, age) values(?, ?)',
      [name, age],
      function (err, result) {
        if (err) {
          console.log(err);
          console.log('[SELECT ERROR]：');
          res.status(500).json({ msg: err.message });
        } else {
          res.send({
            code: 200,
            msg: '发送成功~我们会尽快联系您！',
          });
        }
      }
    );
    // END-解构参数并执行SQL
  });

// 查询数据
router.get(
  '/getDemand',
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
    // const { name, age } = req.body;
    DB(
      'select * from person',
      function (err, result) {
        if (err) {
          console.log('[SELECT ERROR]:');
          res.status(500).json({ msg: err.message });
        } else {
          res.send({
            result:result,
            code: 200,
            msg: '查询成功',
          });
        }
      }
    );
    // END-解构参数并执行SQL
  });

  // 更新数据
  /* 接收用户需求接口 */
router.put(
  '/updateDemand',
  // body('name').notEmpty().withMessage('用户名不能为空'),
  // body('age').notEmpty().withMessage('手机号不能为空'),
  body('id'),
  body('name'),
  function (req, res, next) {
    // 校验参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errMsg: errors.array()[0]?.msg });
    }
    // END-校验参数
    // 解构参数并执行SQL
    const { id, name, age } = req.body;
    DB(
      // 'insert into person(name, age) values(?, ?)',
      'UPDATE person SET name = ?,age = ? WHERE id = ?;',
      [name, age, id],
      function (err, result) {
        if (err) {
          console.log('[SELECT ERROR]：');
          res.status(500).json({ msg: err.message });
        } else {
          res.send({
            code: 200,
            msg: '修改成功',
          });
        }
      }
    );
    // END-解构参数并执行SQL
  });

// 分页数据
router.get(
  '/getDemandPage',
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
    // const { name, age } = req.body;
    //当前所在页码
  let currentPage = req.query.currentPage||1;
  //定义每页数据数
  let pageSize = req.query.pageSize||10;
  let sql='select * from person';
    DB(
      sql,
      function (err, result) {
        if (err) {
          console.log('[SELECT ERROR]：');
          res.status(500).json({ msg: err.message });
        } else {
          // 计算数据总条数
          let total = result.length;
          // 分页条件 (跳过多少条)
          let n = (currentPage - 1) * pageSize;
          // 拼接分页的sql语句
          sql += ` limit ${n}, ${pageSize}`;
          DB(sql,(error,results)=>{
            if(error) return console.log(error.message)
            res.send({
              code:200,
              total,
              results
            });
          })
        }
      }
    );
    // END-解构参数并执行SQL
});

// 删除数据
router.delete(
  '/deleteDemand',
  // body('name').notEmpty().withMessage('用户名不能为空'),
  // body('age').notEmpty().withMessage('手机号不能为空'),
  body('id'),
  function (req, res, next) {
    // 校验参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errMsg: errors.array()[0]?.msg });
    }
    // END-校验参数
    // 解构参数并执行SQL
    const { id } = req.body;
    DB(
      'delete from person where id = ?',
      [id],
      function (err, result) {
        if (err) {
          console.log(err);
          console.log('[SELECT ERROR]：');
          res.status(500).json({ msg: err.message });
        } else {
          res.send({
            code: 200,
            msg: '删除成功',
          });
        }
      }
    );
    // END-解构参数并执行SQL
  });

router.post("/upload",(req,res,next)=>{
  var form = new multiparty.Form()
  form.parse(req,async (err, fields, files)=>{
    if(err){
      throw err
    }else{
      const bucketName = 'imgbucket'; //自己创建的桶名
      let fileName = files.file[0].originalFilename;
      let path = files.file[0].path;
      //上传文件
      try {
        await minioClient.fPutObject(bucketName,fileName , path);
        res.send({
          code: 200,
          url: `http://192.168.1.2:9000/${bucketName}/${fileName}`, // 返回访问URL
        });
      } catch {
        console.log('shangchuancuowu')
      }
    }
  })
})

module.exports = router;
