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

            // console.log('data:', data)
 
            res.render('homePage.html', { phone: phone, okrs: data, title: '首页' });
        })
});

app.get('/details/:id', function (req, res) {

    var id = req.params.id;
   connection.query(`select *,
   (select phone from user where user.id = okr.user_id) as phone
   from okr where id=? limit 1`,[id], function(err,data) {
    // console.log('okr data: ' , data)

    res.render('details.html',{okr: data[0] });
   })
 
});


app.get('/details', function (req, res) {
    connection.query('select * from okr', function (err, data) {
        var username = req.cookies.username;
        
        res.render('details.html', {username: username, okrs : data, title:'详情'});
    })
});


app.post('/api/comments', function (req, res) {

    var oke_id = id;
    var uid = req.cookies.uid;
    var writeIn = req.body.write;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into comment values (null,? , ? , ? , ?)',[ oke_id,uid, writeIn, created_at] , function (err, data) {
        console.log('data:', data)
        res.send("评论成功");
    })
});

app.post('/api/homePage', function (req, res) {
    
    var phone = req.body.phone;
    var password = req.body.password;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into user values (null , ? , ? , "" , "" , "" , ?)', [phone, password, created_at], function (err, data) {
        //    console.log('data:' ,data)
        res.send("注册成功");
    });
});

app.post('/api/articles',function(req,res){
    var title = req.body.object;
    var actions = req.body.action;
    var user_name = req.cookies.uid;
    // var times = req.cookies.time;

    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log(title,actions,created_at);
    
    connection.query('insert into okr values (null,?,"",?, ? ,?)', [title, actions ,user_name ,created_at], function (err, data) {
        res.send("发布成功");
    });
});

app.post('/api/login', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;

    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        if (data.length > 0) {
            res.cookie('uid', data[0].id);
            res.cookie('user_name',data[0].username);
            res.cookie('username', data[0].phone);
            res.cookie('time',data[0].created_at);

            res.send('登陆成功');
            // res.render('homePage.html');
        } else {
            res.send('对不起，用户名或密码错误')
        }
    })
})


// app.get('/details', function (req, res) {
//     res.render('details.html')
// });

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

app.listen(3000);