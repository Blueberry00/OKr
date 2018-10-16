var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var moment = require('moment');
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

app.get('/' , function(req,res){
    connection.query('select * from user', function(err,data){
    })
   res.render('homePage.html')
});

app.post('/api/homePage', function(req,res){
    var phone = req.body.phone;
    var password = req.body.password;
    var token = req.body.pushtock;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');
    
    connection.query('insert into user values (null , ? , ? , "" , "" , ? , ?)', [ phone, password, token ,created_at] , function(err,data){
        res.send("注册成功");
    });
    });

app.post('/api/login', function(req,res){
    var phone = req.body.phone;
    var password = req.body.password;

    console.log(phone,password);
})

app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

app.listen(3000);