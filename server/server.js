const express = require('express');
const http = require('http');
const fs = require("fs");
const { Server } = require("socket.io");

/* Setting up web server & socket.io */
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    "pingTimeout": 120*1000,
    "maxHttpBufferSize": (1024*1024)
});

var mices = {};
var dots = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/socketio.js', (req, res) => { /* Provide socket.io client library */
    res.sendFile(__dirname + '/socketio.js');
});

app.get('/cursor.png', (req, res) => { /* Provide cursor */
    res.sendFile(__dirname + '/cursor.png');
});

io.on('connection', (socket) => {
    socket.uniqueId = idGen();

    io.emit("add mice", socket.uniqueId);
    io.emit("show draw", {"id": socket.uniqueId, dots: dots});

    Object.keys(mices).forEach((miceId) => {
        socket.emit("add mice", miceId);
    });

    mices[socket.uniqueId] = {isAdmin: false};

    socket.on("disconnect", (reason) => {
        io.emit("remove mice", socket.uniqueId);
        delete mices[socket.uniqueId];
    });

    socket.on("new pos", (data, ret) => {
        io.emit("mice pos", [socket.uniqueId, data[0], data[1]]);
    });

    socket.on("draw", (data, ret) => {
        data.dots.forEach((dot, i) => {
            if(data.dots[i][2] > 50) {
                data.dots[i][2] = 50;
            }

            dots.push(dot);
        });

        io.emit("show draw", {"id": socket.uniqueId, "dots": data.dots});
    });

    socket.on("command clear", (data, ret) => {
        if(mices[socket.uniqueId].isAdmin) {
            dots = [];
            io.emit("do clear");
        }
    });

    socket.on("command login", (data, ret) => {
        if(data == "mySuperSecretPassword69") {
            mices[socket.uniqueId].isAdmin = true;
        }
    });
});

server.listen(7676, () => {
    console.log(`EpicShareMice is now listening to port 7676`);
});

setInterval(() => {
    if(dots.length > 100000) {
        dots = dots.splice(dots.length-100000);
    }
}, 2000);

var alp = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function idGen(len = 32) {
    var res = "";

    for(var i = 0; i < len; i++) {
        res += alp[Math.floor(Math.random() * alp.length)];
    }

    return res;
}

var nums = "0123456789";
function idGenNum(len = 8) {
    var res = "";

    for(var i = 0; i < len; i++) {
        res += alp[Math.floor(Math.random() * alp.length)];
    }

    return res;
}

function systemBotId() {
    return 1000000 + Math.floor(Math.random()*500000);
}