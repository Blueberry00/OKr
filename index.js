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
        // console.log('data:' , data);
    })
   res.render('homePage.html')
})

app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

app.post('/api/homePage', function(req,res){
var password = req.body.password;
var username = req.body.username;
var created_at = moment().format('yyyy-mm-dd hh:mm:ss');

connection.query('insert into user values (null , 1 , ? , ? , 2 , 3 , ?)', [ password, username, created_at] , function(err,data){
    res.send("注册成功");
})
})

app.listen(3000);