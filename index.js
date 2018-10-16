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

nunjucks.configure('views',{
    autoescape:true,
    express:app,
    noCache:true
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

app.get('/' , function(req,res){
    connection.query('select * from user', function(err,data){
    })
    var username = req.cookies.username;
   res.render('homePage.html',{username:username})
});

app.post('/api/homePage', function(req,res){
    var phone = req.body.phone;
    var password = req.body.password;
    var token = req.body.pushtock;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');
    
    connection.query('insert into user values (null , ? , ? , "" , "" , ? , ?)', [ phone, password, token ,created_at] , function(err,data){
    //    console.log('data:' ,data)
        res.send("注册成功");
    });
    });

app.post('/api/login', function(req,res){
    var phone = req.body.phone;
    var password = req.body.password;

    connection.query('select * from user where phone=? and password=? limit 1',[ phone , password],function(err,data){
        if(data.length > 0){
            res.cookie('uid',data[0].id)
            res.cookie('username',data[0].phone)
            res.send('登陆成功');
            // res.render('homePage.html');
        }else{
            res.send('对不起，用户名或密码错误')
        }
    })
})

app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

app.listen(3000);