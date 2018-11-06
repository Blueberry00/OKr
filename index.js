var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var moment = require('moment');
var cookieParser = require('cookie-parser');
var request = require('request');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: '88888888',
    database: 'okr'
});

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//首页拉取
app.get('/api/homepage', function (req, res) {
    res.cookie("test", "value");
    connection.query(`select *,
    (select phone from user where user.id = okr.user_id) as phone
    from okr`, function (err, data) {
            var phone = req.cookies.username;
            var sum = data.length;
            res.json({data,sum:sum});
        //    console.log('sum: ' ,sum)
        })
});

//????各页面登陆ID
app.get('/api/phones',function(req,res){
    var phone = req.cookies.username;
    
    res.json({phone})
})

//详情页okr的获取
app.get('/api/details/:id', function (req, res) {
    var id = req.params.id;

    connection.query(`select *,
   (select phone from user where user.id = okr.user_id) as phone
   from okr where id=? limit 1`, [id], function (err, data) {
            res.cookie('okr_id', id);
            var phone = req.cookies.username;
            res.json({ data,phone:phone});
            // console.log('data: ',data)
        })
})

//okr详情页面评论
app.get('/api/comments/:id', function (req, res) {
    var okr_id = req.params.id;

    connection.query(`select * ,
                    (select username from user where user.id=comment.user_id) as username,
                    (select avatar from user where user.id=comment.user_id) as avatar
            from comment where okr_id=?`, [okr_id], function (err, data) {
            res.json({ data, okr_id: okr_id });
        })
});

//个人页面的okr
app.get('/api/userOkr/:id', function (req, res) {
    var user_id = req.params.id;

    connection.query(`select * ,
    (select username from user where user.id = okr.user_id) as username
    from okr where user_id=?`,[user_id], function (err, data) {
            res.json({data, user_id : user_id});
            // console.log('data: ', data);
        })
})

//api所有页面
app.get('/api/*', function (req, res) {
    var url = req.originalUrl;
    request.get('localhost:3000' + url, function (err, resp) {
        res.send(JSON.parse(resp.body))
    })
})

//详情页面
app.get('/details', function (req, res) {
    res.render('details.html')
})

//加载的零时页面
app.get('/d',function(req,res){
    res.render('jiazai.html')
})

//个人页面
app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

//个人首页
app.get('/', function (req, res) {
    res.render('homePage.html')
})

//评论
app.post('/api/comments', function (req, res) {
    var okr_id = req.cookies.okr_id;
    var uid = req.cookies.uid;
    var write = req.body.write;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into comment values (null,? , ? , ? , ?)', [okr_id, uid, write, created_at], function (err, data) {
        // console.log('data:', data)
        res.send("评论成功");
    })
});

//注册
app.post('/api/homePage', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0, 3) + "****" + phone.substr(7);
    var token = Math.random();
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        // console.log('data :',data)
        if (data.length > 0) {
            res.send('用户名已存在');
        } else {
            connection.query('insert into user values (null, ?, ?, ?, "", ?, ?)', [phone, password, username, token, created_at], function (err, data) {
                res.json({ data });
            });
        }
    })
});

//发布
app.post('/api/articles', function (req, res) {
    var title = req.body.title;
    var key_results = req.body.key_results;
    var action = req.body.action;
    var user_name = req.cookies.uid;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log('user_name： ',user_name);

    if(user_name == undefined){
        res.send('对不起，请先登陆！')
    }else{
        connection.query('insert into okr values (null,?, ? ,? , ? ,?)', [title, key_results, action, user_name, created_at], function (err, data) {
            res.json({data});
        });
    }
});

// 登陆
app.post('/api/login', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        console.log('data:', data)
        if (data.length > 0) {
            res.cookie('uid', data[0].id);
            res.cookie('user_name', data[0].username);
            res.cookie('username', data[0].phone);
            res.cookie('time', data[0].created_at);

            var token = phone + password + new Date().getTime() + Math.random();
            connection.query('update user as t set t.token = ? where  phone=? ', [token, phone], function (err, data) {
                res.cookie('token', token)
                res.json({ data });
            });
        } else {
            res.send('对不起');
        }
    })
})

app.listen(3000);