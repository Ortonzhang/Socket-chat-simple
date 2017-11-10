const Koa = require('koa');
const app = new Koa();
const fs = require('fs')
const server = require('http').Server(app.callback());

//  我们传入server对象（HTTP服务器）初始化了一个socket.io对象。
const io = require('socket.io')(server)

app.use(async (ctx, next)=>{
    ctx.response.type = 'html';
    ctx.body = await fs.createReadStream('./src/index.html')
})

server.listen(8080, ()=>{
    console.log('run http://localhost:8080')
});

/*
    监听connection事件接收socket
    使用socket.on绑定了'chat message'自定义事件
    接收到事件后将消息发送给其他用户使用io.emit方法

*/ 

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

});


