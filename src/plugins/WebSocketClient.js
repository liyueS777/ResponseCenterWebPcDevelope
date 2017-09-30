class websocketClient{
    constructor(options){
        var that = this
        const opt = {
          open () {},
          _open () { that.sendMessageCache() },
          _close () {
            console.log('又开始初始化');
            if(!isWsExit){
              let time=5000
              if(that.losseConnect){
                time=0
              }
              setTimeout(that.init.bind(that), time);
            }
          },
          close () {},
          message () {},
          error () {},
          loginout() {},
          loginoutJoin(){}
        }
        this.options = {...opt, ...options}
        this.connected = false;
        this.events = {};
        this.messageCache = [];
        this._ws='';
        this.init();
        this.send = this.send
        this.reconnect = this.reconnect
        this.close = this.close
        this.losseConnect = false
    }
    init(){
        this._ws = new window.WebSocket(this.options.path)
        this._ws.onopen = (e) => {
            this.connected = true
            this.connected = true
            this.losseConnect = false
            this.options.open.call(this, e)
        }
        this._ws.onmessage = ({ data }) => {
            const message = JSON.parse(data)
            if (message.id) {
                this.event(message.id, message)
            } else {
                 if(message.type == "loginout" || message.type == "loginoutJoin"){
                      isWsExit = true;
                      this.options[message.type](JSON.parse(message.msg))
                 }else{
                      let sendmsg;
                      if(message.type == 'login'){
                           this.options._open()
                      }
                      if(message.type=='customService'){
                           sendmsg = message.msg
                      }else if(message.type=='IM'){
                           sendmsg=JSON.parse(JSON.parse(message.msg).msg)
                      }else{
                           sendmsg=JSON.parse(message.msg)
                      }
                      this.event(message.type, sendmsg)
                }
            }
            return this
        }
        this._ws.onclose = (e) => {
             this.connected = false
             this.options._close()
             this.options.close.call(this, e)
        }
        this._ws.onerror = (e) => {
             this.options.error.call(this, e)
        }
    }
    send(to, msg, type = -1, isDepart = 0){
        let data
        if(isDepart!=-1){
            data = {to, msg, type, isDepart}
        }else{
            data = { msg, type }
        }
        this.sendMsg(data)
    }
    close(){
        this._ws.close()
    }
    sendMessageCache () {
        if (this.messageCache.length) {
            let msg = this.messageCache.shift()
            this.sendMsg(msg)
            this.sendMessageCache()
        }
    }
    reconnect(){
      isWsExit = false;
      if(this.connected){
        this.losseConnect = true;
        this._ws.close()
      }else{
        this.init()
      }
    }
    sendMsg (msg) {
        if (this.connected) {
            this._ws.send(JSON.stringify(msg))
        } else {
            this.messageCache.push(msg)
        }
    }
    request = (data, type, to, isDepart = 0) => {
        return new Promise((resolve, reject) => {
            try {
                const msg = {'msg':data, type, to, isDepart}
                //登陆成功回调
                this.on('login', (data) => {
                    // console.log(data)
                    // if (error === true) {
                    //   reject(data)
                    // }
                    resolve(data)
                })
                //被踢出回调
                this.on('loginout', (data) => {
                    reject(data)
                })
                this.sendMsg(msg)
            } catch (e) {
                reject(e)
            }
        })
    }
    on(name, fn){
        if (typeof fn === 'function') {
            if (!this.events[name]) this.events[name] = []
            this.events[name].push(fn)
        }
    }
    off(name, fn){
        const eventsArray = this.events[name]
        if (eventsArray) {
            eventsArray.every(eventFn => {
                if (eventFn === fn) {
                    eventsArray.splice(eventsArray.indexOf(eventFn), 1)
                    return false
                }
                return true
            })
        }
    }
    event (name, data) {
        let eventsArray = this.events[name]
        eventsArray && eventsArray.forEach(fn => fn(data))
    }
}
export default websocketClient