<template>
  <div class="IMchat-wrapper">
     <i class="iconfont icon-guanbi chat-close" @click="closeChat"></i>
     <ul ref="chatlist1" class="chat-list">
        <li :class="[item.fromUserId != 'robot'? 'myTalk' : 'otherTalk']" v-for="(item, key) in getInfoLists">
          <img :src="item.imageUrl">
          <div class="talkinfo">
              <h3><span class="name">{{item.fromName}}</span><span class="time">{{item.createTime}}</span></h3>
              <div class="msg-wrap">
                <p class="msg">{{item.context}}</p>
              </div>
          </div>
        </li>
	　</ul>
     <div class="enter-center">
		<textarea class="talkWrite"  ref="talkWrite" style="height:40px;" @keyup="enterInfo($event)" @touchend="enterInfo($event)"></textarea>
		<button class="btnSend" @click="sendInfo">发送</button>
	 </div>
   </div>
</template>
<script>
export default {
    data(){
        return {
            getInfoLists:[],
        }
    },
    methods:{
        closeChat(){
            this.$parent.robotChat = false
        },
        enterInfo(e){
            var e = event || window.event;
            if(e.keyCode == 13){
                this.sendInfo();
            }
        },
        scrollToBottom(){
            if(!!this.timeout){
                clearTimeout(this.timeout)
            }
            this.timeout = setTimeout(()=>{
                let $obj = this.$refs.chatlist1
                $obj.scrollTop = $obj.scrollHeight-$obj.clientHeight;
            },0)
        },
        sendInfo(){
            let sendinfo = this.$refs.talkWrite.value.replace(' ','').replace('\n','');
            if(sendinfo==''){
                this.$parent.$parent.popMsgFun('发送内容不能为空！');
                return;
            }
            let item = {
                fromUserId:this.$store.state.oaId,
                fromName:this.$store.state.remoteConnect.username,
                imageUrl:this.$store.state.remoteConnect.avatarurl,
                createTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                context:this.$refs.talkWrite.value
            }
            this.getInfoLists.push(item)
            this.$refs.talkWrite.value = '';
            this.$refs.talkWrite.focus();
            if(!Number(sendinfo)){
                let codearr='';
                for(let i=0;i<sendinfo.length;i++){
                    codearr+=String.fromCharCode(sendinfo.charCodeAt(i)-65248);
                }
                if(!isNaN(Number(codearr))){
                    sendinfo = codearr;
                }
            }
            if(typeof this.curques[Number(sendinfo)-1]!='undefined'){
                this.errorTip(this.curques[Number(sendinfo)-1])
            }else{
                if(this.curques[0].parentId!=0 && Number(sendinfo)==0){
                    this.getQues(this.curques[0].id,true)
                    return
                }
                this.errorTip();
            }
        },
        errorTip(res){
            let item = {
                fromUserId:'robot',
                fromName:'小翌',
                imageUrl:'static/images/roboto.png',
                createTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            }
            if(!!res){
                if(res.answer=='' || res.answer==null){
                    this.getQues(res.id)
                    return;
                }else{
                    item.context=res.answer;
                }
            }else{
                item.context='您输入的信息有误，请输入正确的查询序号';
            }
            this.getInfoLists.push(item)
            this.scrollToBottom()
        },
        makeQues(arr,bool){
            let str = '';
            if(!bool){
                str+='0：返回上一层\n';
            }
            for(var index in arr){
                str+=`${Number(index)+1}：${arr[index].question}\n`
            }
            let item = {
                fromUserId:'robot',
                fromName:'小翌',
                createTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                imageUrl:'static/images/roboto.png',
                context:str
            }
            this.getInfoLists.push(item)
            this.scrollToBottom()
        },
        getQues(qid,bool){
            let param={
                'robotId':qid
            },requrl=''
            if(!!bool){
                requrl = '/customer/getRobotReturnParent';
            }else{
                requrl = '/customer/getRobotMessage';
            }
            this.$http.post(this.$store.state.HOST+requrl,param).then((res)=>{
                if(!!res.data && res.data.data.length!=0){
                    this.curques = res.data.data
                    let bool=false;
                    if(res.data.data[0].parentId==0){
                        bool=true;
                    }
                    this.makeQues(res.data.data,bool)
                }
            })
        }
    },
    created(){
        let item = {
            fromUserId:'robot',
            fromName:'小翌',
            createTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            imageUrl:'static/images/roboto.png',
            context:`您好，${this.$store.state.remoteConnect.username}，我能为您提供以下服务\n（输入数字可获得相应答复）`
        }
        this.getInfoLists.push(item)
        this.getQues('')
    }
}
</script>
<style>
</style>