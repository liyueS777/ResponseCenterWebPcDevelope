<template>
   <div class="IMchat-wrapper">
     <i class="iconfont icon-guanbi chat-close" @click="closeChat"></i>
     	<ul ref="chatlist1" class="chat-list" @scroll="onScroll($event)">
        <li :class="[item.fromUserId == fromUserId? 'myTalk' : 'otherTalk']" v-for="(item, key) in getInfoLists">
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
			<textarea class="talkWrite" :style="{height:ch*28+'px'}" @paste="pasteEven($event)" ref="talkWrite" :placeholder="!$store.state.isMobile?'按Ctrl+Enter键换行':''" @keyup="enterInfo($event)" @touchend="enterInfo($event)"></textarea>
			<button class="btnSend" @click="sendInfo">发送</button>
		</div>
   </div>
</template>
<script>
  export default {
    data () {
      return {
        deptInfoList: [], //部门消息列表
        ptpInfoList: [], //点对点消息列表
        pageSize: 10,
        pageIndex: 1,
        pageItem: null,
        ch:1
      }
    },
    props: ['receiveParam', 'position'],
    computed: {
      getInfoLists(){
        return this.position == 'staff' ? this.ptpInfoList : this.deptInfoList;
      }
    },
    methods:{
      closeChat(){
        this.$parent.showMsg = false;
      },
      pasteEven(){
        clearTimeout(this.timeout)
        this.timeout = setTimeout(()=>{
            if(this.$refs.talkWrite.value!=''){
                this.ch = this.$refs.talkWrite.value.split(/\n/).length;
            }
        },0)
      },
      enterInfo(event){
        var e = event || window.event;
        let regx = /\n/
        this.ch = this.$refs.talkWrite.value.split(regx).length;
        if(event.ctrlKey && event.keyCode==13 || (!!event.commandKey && event.keyCode == 86)){
          this.sendInfo();
        }
      },
      sendInfo(){ 
        var context = $(this.$refs.talkWrite).val().trim(); 
        if(!context){
          $(this.$refs.talkWrite).blur();
          this.$parent.$parent.popMsgFun('发送内容不能为空！')
          return;
        }
        var userData = this.$store.state.login,
            fromUserId = this.fromUserId,
            fromUsername = userData.userName,
            toUserId = this.$store.state.toUserId,
            toUsername = this.$store.state.toUsername,
            imageUrl = this.$store.state.avatorurl+userData.photo,
            deptId = this.$store.state.deptId;

        this.startTalk({
           toUserId,
           toUsername,
           fromUserId,
           fromUsername,
           imageUrl,
           deptId,
           context
        })  
      },
      startTalk(param){
        var isDepart = this.position == 'dept' ? 1 : 0  // 1: 部门 ， 0：非部门
        this.$store.state.remoteConnect.$webSocket.send('',{'compId': this.$store.state.compId, 'fromUserId':param.fromUserId, 'fromName': param.fromUsername , 'toUserId': param.toUserId, 'toName': param.toUsername,'deptId':param.deptId,'imageUrl': param.imageUrl, 'context': param.context},'IM', isDepart);

        var sendParam = {
          "compId": this.$store.state.compId,
          "deptId": param.deptId,
          "createTime": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          "context": param.context,
          "fromUserId": param.fromUserId,
          "fromName": param.fromUsername,
          "toName": param.toName,
          "toUserId": param.toUserId,
          "imageUrl": param.imageUrl,
          "type":"IM"
        }
        if(param.deptId.indexOf(this.fromUserId)>-1){
          this.ptpInfoList.push(sendParam);
        }else{
          this.deptInfoList.push(sendParam);
        }
        $(this.$refs.talkWrite).val('')
        this.$refs.talkWrite.focus()
        this.ch = 1;
        this.scrollToBottom()
      },
      getMsgLists(pageSize,bool){

        var param = {
            "compId":this.$store.state.compId,
            "deptId":this.$store.state.deptId,
            "pageSize":pageSize,
        }
        if(!!bool){
           param.pageIndex = this.pageItem
        }
        this.$http.post(this.$store.state.HOST+'/message/queryPageMessage',param).then((res)=>{
            if(res && res.body.data.length!=0){
              if(this.pageItem!=null){
                this.scrollToBottom(true)
              }else{
                this.scrollToBottom();
              }
              if(param.deptId.indexOf(this.fromUserId) > -1){
                this.ptpInfoList = res.body.data.reverse().concat(this.ptpInfoList);
                this.pageItem = res.body.data[0].id;
              }else{
                this.deptInfoList = res.body.data.reverse().concat(this.deptInfoList);
                this.pageItem = res.body.data[0].id;
              }
            }else{
              this.pageItem = -1;
            }
        }, (err)=>{
        
        });
      },
      onScroll(event){
        var scrollTop = event.target.scrollTop
        if(scrollTop===0 && this.pageItem!=-1){
            this.scrollHeight = this.$refs.chatlist1.scrollHeight;
            this.getMsgLists(this.pageSize,true)
        }
      },
      scrollToBottom(type){
        var timeout = 50
        if(!!type){
            timeout = 5
        }
        this.timer = setTimeout(()=>{
            let $obj = this.$refs.chatlist1;
            if(!!type){
                 $obj.scrollTop = $obj.scrollHeight-this.scrollHeight;
             }else{
                $obj.scrollTop = $obj.scrollHeight-$obj.clientHeight;
            }
        }, timeout);
      }
    },
    watch:{
      receiveParam(val, oldVal){
        if(val){
          if(val.deptId && val.deptId.indexOf(this.fromUserId)>-1){
            this.ptpInfoList.push(val);
          }else{
            this.deptInfoList.push(val);
          }
          let $obj = this.$refs.chatlist1;
          if($obj.scrollTop + $obj.clientHeight==$obj.scrollHeight){
            this.scrollToBottom();
          }
        }
      }
    },
    beforeMount(){
      this.getMsgLists(this.pageSize);
      this.fromUserId = this.$store.state.oaId;
    }
  }
</script>
