const Koa = require('koa');
const app = new Koa();
const path = require('path')
const views = require('koa-views');
const static = require('koa-static');
const server = require('http').Server(app.callback());
const _ = require('underscore');
//  我们传入server对象（HTTP服务器）初始化了一个socket.io对象。
const io = require('socket.io')(server)


app.use(static(
    path.join( __dirname, './src/publish')
))

app.use(views(path.join(__dirname, './src/views'), {
    extension:'jade'
}))

app.use(static(
    path.join( __dirname, './src/publish')
))

app.use(async (ctx, next)=>{
    await ctx.render('index')
})

server.listen(8080, ()=>{
    console.log('run http://localhost:8080')
});

/*
    监听connection事件接收socket
    使用socket.on绑定了'chat message'自定义事件
    接收到事件后将消息发送给其他用户使用io.emit方法

*/ 

var userList = []
io.on('connection', function (socket) {
    console.log(socket.id)
    socket.emit('userInit', userList)

    socket.on('login', function(msg){
        msg.id = socket.id
        let user = _.findWhere(userList,{name:msg.name})
        if(user){
            socket.emit('checkName', 'false')
        } else {
            userList.push(msg)
            socket.emit('userInit', userList)
            io.emit('userUpdate', userList)
        }

        
        // 坑  需要使用io socket不可以
    })

    socket.on('sendAll', function(msg){
        io.emit('messageAll', msg);
    })
    socket.on('sendAllImg', function(msg){
        io.emit('messageAllImg', msg)
    })
    socket.on('sendOne', function(msgObj){
        let Tosocket = _.findWhere(io.sockets.sockets,{id:msgObj.receive.id})
        Tosocket.emit('toOne', msgObj )
    })
    socket.on('disconnect', function(){
        let user = _.findWhere(userList,{id:socket.id})
        if(user){
			userList = _.without(userList,user);
            io.emit('userUpdate',userList);
            socket.broadcast.emit('disconnect', user)
		}
    })

});


