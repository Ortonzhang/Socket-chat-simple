var socket = io();
const imgGroup = ['/img/1.jpg','/img/2.jpg','/img/3.jpg','/img/4.jpg','/img/5.jpg' ];
const emojiGroup = ['😂','😀','😭','😹','🙏','😬','😁','😃','😄','😅','😆','😇','😉','😊','🙂','🙃','😋','😌','😍','😘','😗','😙','😚','😜','😝','😛','🤑','🤓','😎','🤗','😏','😶','😐','😑','😒','🙄','🤔','😳','😞','😟','😠','😡','😔','😕','🙁','😣','😖','😫','😩','😤','😮','😨','😰','😯','😦','😧','😢','😥','😪','😵','😲','🤐','😷','🤒','🤕','😴','💤','🙌','👏','👋','👊','👌','💪','👍','👆','👇','👈','👉','🖕','🤘','🖖','💩','😈','👿','👹','👺','💀','👻','👽','🤖','😺','😸','😻','😼','😽','🙀','😿','😾','💅','👄','👅','👂','👃','👁','👀','👤','🗣','👶','👦','👧','👨','👩','👱','👴','👵','👲','👳','👮','👷','💂']

// $._messengerDefaults = {
//     extraClasses: 'messenger-fixed messenger-theme-ice messenger-on-top'
// }

let App = new Vue({
    el:'#app',
    data:{
        userDefault:'orton',
        userList:[],
        AllMsgList:[],
        sendAllMsg:'',
        emojiGroup,
        oneInfo:{},
        oneMsg:'',
        userSelf:{},
    },
    methods:{
        init(){
            this.userList = []
            $('.user-modal').modal('show')
            $('body').click(_ => {
                $('#emoji').hide()
            })
        },
        saveUser(){
            var userInfo = {
                name: this.userDefault,
                img: imgGroup[Math.floor(Math.random()*5)]
            }
            socket.emit('login', userInfo)
            
            socket.on('checkName', function(){
                Messenger().post({
                    message: "昵称重复，请修改",
                    hideAfter: 3,
                    type: 'error',
                    showCloseButton: true
                });
                return false
            })
            socket.on('userInit',(list)=>{
                $('.user-modal').modal('hide')
                this.userList = list
                this.userSelf = _.findWhere(this.userList, {name:this.userDefault})
            })
        },
        sendOne(item){
            this.oneInfo = item
            $('.one-modal').show()
        },
        oneEmit(){
            $('.one-modal').hide()
            socket.emit('sendOne', {msg: this.oneMsg, receive:this.oneInfo})
        },
        emojiShow(){
            $('#emoji').show()
        },
        emoji(item){
            this.sendAllMsg+= ' ' + item
        },
        sendAll(event){
            event.preventDefault()
            $('#emoji').hide()
            if(this.sendAllMsg){
                
                socket.emit('sendAll', {form: this.userSelf, msg: this.sendAllMsg})
                this.sendAllMsg = ''
            } else {
                alert('请输入发言内容')
            }
        },
            
        upImg(){
            var that = this
            let input =  $('<input type="file">')
            input.change( _ => {
                if(input[0].files.length){
                    var file = input[0].files[0]
                    reader = new FileReader()

                    reader.onload = function(e){

                        socket.emit('sendAllImg', {form: that.userSelf, msg: e.target.result})

                    }

                    reader.readAsDataURL(file);
                }


            })
            input.click()
        }        
        
    }
})
App.init()
socket.on('messageAll', function(msg){
    App.AllMsgList.push(msg)
})

socket.on('userUpdate',function(list){
    App.userList = list
})
// socket.on('disconnect', function(use){
//     alert(`${use.name}离开了`)
// })

socket.on('toOne', function(obj){
    Messenger().post({
        message: `来自${obj.receive.name}的消息:${obj.msg}`,
        hideAfter: 10,
        type: 'info',
        showCloseButton: true
    });
})
socket.on('messageAllImg', function(msg){
    msg.type = 'img'
    App.AllMsgList.push(msg)
})