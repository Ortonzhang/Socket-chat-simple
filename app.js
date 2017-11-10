const Koa = require('koa');
const app = new Koa();
const fs = require('fs')
const server = require('http').Server(app.callback());
const io = require('socket.io')(server)


app.use(async (ctx, next)=>{
    ctx.response.type = 'html';
    ctx.body = await fs.createReadStream('./src/index.html')
})

server.listen(8080, ()=>{
    console.log('run http://localhost:8080')
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

});


