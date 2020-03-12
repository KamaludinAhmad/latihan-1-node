const express = require('express');
var session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express()
const port = 3000;
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "latihan1"
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//token
const isAuthorized = (request, result, next) => {
    if (typeof(request.headers['x-api-key']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }

    let token = request.headers['x-api-key']
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })
    next()
}

//login admin
app.post('auth', function(request, response){
    let data = request.body
    var username = data.username;
    var password = data.password;
    if (username&&password){
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields){
            if (results.length > 0){
                request.session.loggedin = true;
                request.session.username = data.username;
                response.redirect('/home');
            }else{
                response.send('Username or password false!!!');
            }
            response.end();
        });
    }else{
        response.send('Masukkan Username dan password!!!');
        response.end();
    }
});

app.get('/home', function(request, results){
    if (request.session.loggedin){
        let data = request.body
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

        result.json({
            success: true,
            message:'Selamat Datang, ' +request.session.username + '!',
            token: token
        })
    }else{
        result.json({
            success: false,
            message: 'Mohon Login Terlebih Dahulu !'
        })
    }
    result.end();
})

app.post('/login', function(request, response){
    var username = request.body.username;
    var password = request.body.password;
    if (username && password){
        db.query('SELECT *FROM user WHERE username = ? and password = ?', [username, password], function(error, results, fields){
            if (results.length > 0){
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            }else{
                response.send('username or password false!!!');
            }
            response.end();
        });
    }else{
        response.send('Masukkan username dan password!');
        response.end();
    }
});