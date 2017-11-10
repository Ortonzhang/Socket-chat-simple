# webSocket

websocket是基于TCP的一种新的网络协议，实现了浏览器和服务器的双向通信。

## 实现原理
浏览器发出webSocket的连线请求，服务器发出响应，这个过程称为`握手`,握手的过程只需要一次，就可以实现持久连接。

## 握手与连接

浏览器发出连线请求,此时的request如下：

![request](http://upload-images.jianshu.io/upload_images/4060631-482f8d79d35b6616.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


通过`get`可以表明此次连接的建立是以HTTP协议为基础的，返回101状态码。

**如果不是101状态码，表示握手升级的过程失败了**

101是`Switching Protocols`,表示服务器已经理解了客户端的请求，并将通过Upgrade 消息头通知客户端采用不同的协议来完成这个请求。在发送这个响应后的空档，将`http`升级到`webSocket`。

其中`Upgrade`和`Connection`字段告诉服务端，发起的是`webSocket`协议

`Sec-WebSocket-Key`是浏览器经过Base64加密后的密钥，用来和`response`里面的`Sec-WebSocket-Accept`进行比对验证

`Sec-WebSocket-Version`是当前的协议版本
 
`Sec-WebSocket-Extensions`是对`WebSocket`的协议扩展


服务器接到浏览器的连线请求返回结果如下：

![response](http://upload-images.jianshu.io/upload_images/4060631-c1dcb04866442d15.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


`Upgrade`和`Connection`来告诉浏览器，服务已经是基于webSocket协议的了，让浏览器也遵循这个协议

`Sec-WebSocket-Accept`是服务端确认后并加密后的`Sec-WebSocket-Accept`

至此，webSocket连接成功，接下来就是`webSocket`的协议了。


## 基本实现

``` demo
var ws = new WebSocket("ws://echo.websocket.org");

ws.onopen = function(){ws.send("Test!"); };

ws.onmessage = function(evt){console.log(evt.data);ws.close();};

ws.onerror = function(evt){console.log("WebSocketError!");};

```

以上代码可以直接在chrome的控制台执行

第一行创建一个`WebSocket`对象，实现握手与连接，参数是连接的地址。**`WebSocket`**协议的url是以`ws://`开头的，加密的使用`wss://`。

连接成功后，就会调用`onopen`函数。

发送消息使用`send`函数，参数为文本消息

使用`onmessage`函数收服务器端发送过来的数据

错误处理使用`onerror`函数

关闭连接使用`onclose`函数

# Socket.io

## 简介
Socket.io是一个`webSocket`库，目标是构建不同浏览器和移动设备上使用的实时应用。它会自动根据浏览器从`webSocket` `ajax长轮询` `ifrane流`等各种方式选择最佳的方式。

## 特点
Socket.io主要有以下几点：

 1、实时分析：将数据推送到客户端，这些客户端会被表示为实时计数器，图表或日志客户
 2、实时通讯和聊天：几行代码就可以实现一个简单的聊天室
 3、二进制流传输：支持任何形式的二进制文件传输，例如：图片，视频，音频等
 4、文档合并：允许多个用户同时编辑一个文档，并且能够看到每个用户做出的修改

## 聊天室的实现

[Socket.io](https://socket.io/docs/)上面有个入门的聊天室demo，基于`node-http-server`或者`express`,玩了`koa`以后，觉得`koa`很清爽，所以打算用`koa`来实现聊天室。

首先创建`simple-koa-chat`文件夹，用来存放我们的代码。

执行`npm init -y`命令生成package.json文件

执行`npm i koa socket.io -D` 安装koa和socket.io，并添加到`devDependencies`依赖

执行`mkdir src && cd src && touch index.html`创建src文件夹，并在里面创建index.html

执行`cd../ && touch app.js`，回到根目录下，创建app.js。

执行完后，在编辑器里面打开，此时目录结构如下：

![目录结构](http://upload-images.jianshu.io/upload_images/4060631-5ea625024b49c2c3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

编辑app.js文件
``` app.js
	
	const Koa = require('koa')
	const app = new Koa()
	const fs = require('fs')
	const server = require('http').Server(app.callback())
	const io = require('socket.io')(server)
	
	
	app.use(async (ctx, next)=>{
		ctx.response.type = 'html'
		ctx.body = await fs.createReadStream('./src/index.html')
	})
	
	server.listen(8080, ()=>{
		console.log('open http://localhost:8080')
	});
	io.on('connection', function(socket){
		socket.on('chat message', function(msg){
			io.emit('chat message', mas)
		})
	})
```

编辑index.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Socket.IO chat</title>
    <link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
  </head>
  <style>
    li{
      padding: 4px 10px;
      border: 1px solid #eee;
      width:fit-content;
      border-radius: 5px;
      margin-bottom: 10px;
    }
  </style>
  <body>
    <div class="container" style="margin-top:100px">
        <div class="panel panel-default">
            <div class="panel-heading">Socket.IO 简易聊天室</div>
            <div class="panel-body">
                <div class="col-md-12">
                    <ul class="messages pull-letf list-unstyled"></ul>
                    <form action="">
                      <div class="form-group">
                        <textarea class="form-control"  placeholder="输入发言内容"></textarea>
                      </div>
                      <button type="button" class="btn btn-primary">发言</button>
                    </form>
                </div>
            </div>
          </div>
    </div>
    
    
    <script src="/socket.io/socket.io.js"></script>
    <script src="https://code.jquery.com/jquery-1.11.1.js"></script>
    <script>
        $(function () {
            var socket = io();
            $('.btn').click(function(){
              socket.emit('chat message', $('.form-control').val());
              $('.form-control').val('');
            });

            // 监听 chat message事件 
            socket.on('chat message', function(msg){
              $('.messages').append($('<li>').text(msg));
            });  
        });
    </script>
  </body>
</html>

```

执行`nodemon app.js` 启动我们的服务。

[nodemon](https://nodemon.io/)是一个工具,用于项目代码发生变化时可以自动重启。


打开浏览器你可以看到如下的页面

![简易聊天室](http://upload-images.jianshu.io/upload_images/4060631-7738d6d9773b2e45.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


