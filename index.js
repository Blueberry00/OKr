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

app.get('/api/homepage', function (req, res) {
    res.cookie("test", "value");
    connection.query(`select *,
    (select phone from user where user.id = okr.user_id) as phone
    from okr`, function (err, data) {
            var phone = req.cookies.username;
            //   console.log('phone: ',phone)
            res.json({ data , phone:phone});
            // console.log(data)
        })
});

app.get('/', function (req, res) {
    res.render('homePage.html')
})

app.get('/api/details/:id', function (req, res) {
    var id = req.params.id;

    connection.query(`select *,
   (select phone from user where user.id = okr.user_id) as phone
   from okr where id=? limit 1`, [id], function (err, data) {
            res.cookie('okr_id', id);
            var phone = req.cookies.username;
            res.json({ data });
            // console.log('data: ',data)
        })
})

// app.get('/api/comments/:okr_id', function (req, res) {
//     var okr_id = req.query.okr_id;
//     var page = req.query.page || 1;
//     var size = 10;

//     connection.query(`select *,
// (select username from user where user.id=comment.user_id) as username,
// (select avatar from user where user.id=comment.user_id) as avatar
//                     from comment where okr_id=? limit ?, ?`, [okr_id, (page - 1) * size, size], function (err, data) {
//             res.json(data);
//             console.log('data: ', data)
//         })
// });

app.get('/api/comments/:id', function (req, res) {
    var okr_id = req.params.id;

    connection.query(`select * ,
                    (select username from user where user.id=comment.user_id) as username,
                    (select avatar from user where user.id=comment.user_id) as avatar
            from comment where okr_id=?`, [okr_id], function (err, data) {
            res.json({ data, okr_id: okr_id });
        })
});


app.get('/details', function (req, res) {

    res.render('details.html')
})

// app.get('/details/:id', function (req, res) {
//     var id = req.params.id;

//     connection.query(`select *,
//    (select phone from user where user.id = okr.user_id) as phone
//    from okr where id=? limit 1`, [id], function (err, data) {
//             res.cookie('okr_id', id);
//             var phone = req.cookies.username;
//             res.render('details.html', { phone: phone, okr: data[0], id: id })
//         })
// });


// ????
app.get('/api/presonal/:id', function (req, res) {
    var user_id = req.params.id;

    connection.query(`select *,
    (select phone from user where user.id = okr.user_id) as phone
    from okr where user_id=?`, [user_id], function (err, data) {
            var phone = req.cookies.username;
            res.json(data)
            console.log(data)
        })
});


// app.get('/detailsokr/:id',function (req ,res){
//     var id = req.params.id;
//     connection.query(`select * from okr where id=?`,[id],function (err,data){
//         console.log('data:',data)
//         res.json(data[0]);
//     })
//     // res.render('detailsokr.html');
// })



app.get('/api/*', function (req, res){
    var url = req.originalUrl;
    request.get('localhost:3000' + url, function(err,resp){
        res.send(JSON.parse(resp.body))
    })
})

app.get('/center', function (req, res) {
    res.render('PersonalCenter.html')
});



//评论
app.post('/api/comments', function (req, res) {
    var okr_id = req.cookies.okr_id;
    var uid = req.cookies.uid;
    var writeIn = req.body.write;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into comment values (null,? , ? , ? , ?)', [okr_id, uid, writeIn, created_at], function (err, data) {
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
        console.log('data :',data)
        if (data.length > 0) {
            res.send('用户名已存在');
        }else{
            connection.query('insert into user values (null, ?, ?, ?, "", ?, ?)', [phone, password, username, token, created_at], function (err, data) {
                res.json({data});
            });
        } 
    })
});


//发布

app.post('/api/articles', function (req, res) {
    var title = req.body.object;
    var key_results = req.body.key_results;
    var action = req.body.action;
    var user_name = req.cookies.uid;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into okr values (null,?, ? ,? , ? ,?)', [title, key_results, action, user_name, created_at], function (err, data) {
        res.send("发布成功");
    });
});

// 登陆
app.post('/api/login', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        console.log('data:',data)
        if (data.length > 0) {
            res.cookie('uid', data[0].id);
            res.cookie('user_name', data[0].username);
            res.cookie('username', data[0].phone);
            res.cookie('time', data[0].created_at);

            var token = phone + password + new Date().getTime() + Math.random();
            connection.query('update user as t set t.token = ? where  phone=? ', [token, phone], function (err, data) {
                res.cookie('token', token)
                res.json({data});
            });
        }else{
            res.send('对不起');
        } 
    })
})




// app.get('/details', function (req, res) {
//     res.render('details.html')
// });





app.listen(3000);