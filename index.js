var express = require('express');
var nunjucks = require('nunjucks');
// var mysql = require('mysql');
// var moment = require('moment');
// var request = require('request');
// var bodyParser = require('body-parser');

// var connection = mysql.createConnection({
//         host: '192.168.0.110',
//         user: 'ubuntu',
//         password: '88888888',
//         database: 'okr'
//     });

var app = express();

nunjucks.configure('views',{
    autoescape:true,
    express:app,
    noCache:true
});

// app.use(bodyParser.urlencoded({extended:false}));


app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/home', function (req, res) {
    res.render('homePage.html')
});

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});

app.listen(3000);