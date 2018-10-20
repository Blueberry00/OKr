var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var moment = require('moment');
var cookieParser = require('cookie-parser');
// var request = require('request');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'ubuntu',
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

app.get('/', function (req, res) {
    res.cookie("test", "value");
    connection.query(`select id, object,key_results,action, created_at,
    (select phone from user where user.id = okr.user_id) as phone
    from okr`, function (err, data) {
            var phone = req.cookies.username;

            res.render('homePage.html', { phone: phone, okrs: data, title: '首页' });
        })
});

app.get('/details/:id', function (req, res) {
    var id = req.params.id;
    connection.query(`select *,
   (select phone from user where user.id = okr.user_id) as phone
   from okr where id=? limit 1`, [id], function (err, data) {
       res.cookie('okr_id',id);
          var phone = req.cookies.username;
            res.render('details.html', { phone: phone, okr: data[0] ,id : id })
        })
});


app.get('/center', function (req, res) {
    res.cookie("test", "value");
    connection.query(`select id, object,key_results,action, created_at,
    (select phone from user where user.id = okr.user_id) as phone
    from okr`, function (err, data) {
        var user_id = req.cookies.uid;
        res.cookie('user_ids', user_id);
        var phone = req.cookies.username;
        // data.user_id = phone;
           console.log('data: ',data)
            res.render('personalCenter.html', { phone: phone, okrs: data,});
        })
});


// app.get('/center', function (req, res) {
//     res.cookie("test", "value");
//     var user_id = req.cookies.uid;
//     var phone = req.cookies.username;

//     connection.query(`select id, object,key_results,action, created_at,
//     (select phone from user where user.id = okr.user_id) as phone
//     from okr`, function (err, data) {

//     connection.query('select * from okr where user_id = phone',user_id,function(err,data){
        
//            console.log('data: ',data)
//             res.render('personalCenter.html', { phone: phone, okrs: data,});
//         })
// });



app.post('/api/comments', function (req, res) {
    var okr_id = req.cookies.okr_id;
    var uid = req.cookies.uid;
    var writeIn = req.body.write;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into comment values (null,? , ? , ? , ?)', [okr_id,uid, writeIn, created_at], function (err, data) {
        // console.log('data:', data)
        res.send("评论成功");
    })
});

app.post('/api/homePage', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0, 3) + "****" + phone.substr(7);
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into user values (null , ? , ? , ? , "" , "" , ?)', [phone, password, username, created_at], function (err, data) {
        // console.log('data:', data)
        res.send("注册成功");
    });
});

app.post('/api/articles', function (req, res) {
    var title = req.body.object;
    var key_results = req.body.key_results;
    var action = req.body.action;
    var user_name = req.cookies.uid;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into okr values (null,?, ? ,? , ? ,?)', [title,key_results ,action ,user_name, created_at], function (err, data) {
        res.send("发布成功");
    });
});


app.post('/api/login', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        if (data.length > 0) {
            res.cookie('uid', data[0].id);
                res.cookie('user_name', data[0].username);
                res.cookie('username', data[0].phone);
                res.cookie('time', data[0].created_at);

            var token = phone + password + new Date().getTime() + Math.random();
            connection.query('update user as t set t.token = ? where  phone=? ', [token, phone], function (err, data) {
                res.cookie('token', token)
               
                res.send('登陆成功');
            });
        } else {
            res.send('对不起，用户名或密码错误')
        }
    })
})

    



// app.get('/details', function (req, res) {
//     res.render('details.html')
// });

// app.get('/center', function (req, res) {
//     res.render('PersonalCenter.html')
// });



app.listen(3000);