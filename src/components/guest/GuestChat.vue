<template>
    <div v-if="hasCous">
    <div class="IMchat-wrapper guestchat" @click="showdetail=false" >
     <i class="iconfont icon-guanbi chat-close" @click="close"></i>
        <div class="serlist" v-if="customlist!=null">
            <span :class="['user-sattus title',status[customlist[userselect].isOnline]]">{{customlist[userselect].name || customlist[userselect].username}}</span>
            <a :class="['btn-ck',{'hasnew':hasnews>0}]" @click="blurclose($event)"><i class="iconfont icon-renyuanqiehuan"></i></a>
            <div class="serlist-detail" v-if="showdetail">
                <ul>
                    <template v-for="item in allcustomer">
                        <li :class="[{'selected':userselect==customlist[item].customerId},{'newMsg':customlist[item].news}]" @click="changeSelect(item,$event)"><span :class="['user-sattus',status[customlist[item].isOnline]]">{{customlist[item].name || customlist[item].username }}</span>
                        <span v-if="customlist[item].news">({{customlistnews[item]}})</span></li>
                    </template>
                </ul>
            </div>
        </div>
     	<ul class="chat-list" ref="chatList" @scroll="onScroll($event)">
        <li :class="[item.fromUserId == $store.state.oaId? 'myTalk' : 'otherTalk',shownewacha(item,index) && shownewacom?'news':'']" v-for="(item, index) in getInfoLists">
          <span class="tiptime" v-if="(setPreTime(index) || (index==0 && toupTop==true)) && !!item.createTime">{{item.createTime.slice(0,16)}}</span>
          <img :src="item.imageUrl">
          <div class="talkinfo">
              <h3><span class="name">{{item.fromName}}</span><span class="time">{{item.createTime.slice(11)}}</span></h3>
              <div class="msg-wrap">
                <template v-if="item.type==0 || item.msgType==0">
                    <p class="msg">{{emo(item.context)}}</p>
                </template>
                <template v-if="item.type==1 || item.msgType==1">
                    <div class="msg"><p class="fj"><a @click="download(realImgurl(item['fileUrl'],item['context']),$event)" :href="realImgurl(item['fileUrl'],item['context'])">{{item.context}}</a></p><img class="preImg" :src="realImgurl(item['fileUrl'],item['context'])"/><a class="screenall" @click="largeImg(realImgurl(item['fileUrl'],item['context']))"><i class="iconfont icon-quanping"></i></a></div>
                </template>
                <template v-if="item.type==2 || item.msgType==2">
                    <div class="msg"><p class="fj"><span><i class="iconfont icon-fujian"></i></span><a @click="download(realImgurl(item['fileUrl'],item['context']),$event)" :href="realImgurl(item['fileUrl'],item['context'])">{{item.context}}</a></p></div>
                </template>
              </div>
          </div>
        </li>
		</ul>
		<div class="enter-center">
			<textarea class="talkWrite" :style="{height:ch*28+'px'}" ref="textwz" id="talkWrite" :placeholder="!$store.state.isMobile?'按Ctrl+Enter键换行':''" @paste="pasteEven($event)" @keyup="enterInfo($event)" @touchend="enterInfo($event)"></textarea>
			<button class="btnSend" @click="sendInfo"><i class="iconfont icon-fasong"></i></button>
            <button class="othersFun" @click="done('getFile')"><i class="iconfont icon-fujian1"></i></button>
		</div>
        <form><input type="file" ref="getfile" style="display:none" @change="changeFile"/></form>
   </div>
   <!--附件窗口-->
   <FlieLoad :files="curfile" v-if="curfile!=null"></FlieLoad>
   <!--图片放大窗口-->
   <PicShow :imgUrl="imgL" v-if="imgLarge && imgL!=null"></PicShow>
   </div>
   
</template>
<script>
import FlieLoad from '@/components/fileupload/fileupload'
import PicShow from '@/components/common/PicShow'
export default {
    props:["curmsg","curlogin"],
    components:{
        FlieLoad,
        PicShow
    },
    data(){
        return {
            getInfoLists:[],
            curfile:null,
            customlist:null,//客服列表
            customlistnews:null,//客服新消息数
            userselect:null,
            showdetail:false,
            status:{0:'offline',1:'online'},
            pageItem:null,//消息
            initMsg:10,//初始信息数
            unread:0,
            imgLarge:true,
            imgL:null,
            toupTop:true,//是否需要翻页
            hasCous:false,//是否存在客服
            allcustomer:[],//客服在线顺序
            ch:1,
        }
    },
    computed:{
        shownewacom(){
            //是否显示最新消息提示
            return this.getInfoLists[this.getInfoLists.length-1].fromUserId!= this.$store.state.oaId && !!this.customlist[this.userselect].news;
        },
        hasnews(){
            let count=0;
            for(var item in this.customlistnews){
                if(item!=this.userselect){
                    count += this.customlistnews[item]
                }
            }
            if(count==0){
                this.$parent.showcusnews = false;
            }
            return count;
        }
    },
    watch:{
        curmsg(val){
            if(val.deptId==this.userselect+this.$store.state.remoteConnect.selfId){
                val.createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                this.getInfoLists.push(val)
                this.customlist[val.fromUserId].news = false;
                this.customlistnews[val.fromUserId] = 0;
                let $obj = this.$refs.chatList;
                if($obj.scrollTop + $obj.clientHeight==$obj.scrollHeight){
                    this.scrollToBottom();
                }
            }else{
               if(this.customlist[val.fromUserId].news==false){
                   this.customlist[val.fromUserId].news = true;
               };
               this.customlistnews[val.fromUserId]+=1;
               this.initMsg+=this.customlistnews[val.fromUserId];
            }
        },
        curlogin(val){
            if(!!this.customlist[val.userId]){
                this.customlist[val.userId].isOnline=(val.status=='online'?1:0)
                var cindex=-1,curlist = this.allcustomer;
                for(var cid of curlist){
                    cindex++;
                    if(cid==val.userId){
                        break;
                    }
                }
                curlist.splice(cindex,1)
                if(val.status=='online'){
                    curlist.unshift(val.userId)
                }else{
                    curlist.push(val.userId)
                }
                this.allcustomer = curlist;
            }
        }
    },
    methods:{
        emo(val){
            return emoji.emojify(val)
        },
        largeImg(url){
            this.imgLarge = true;
            this.imgL = url;
        },
        timeparse(time){
            return Date.parse(time)/1000;
        },
        setPreTime(index){
            var bool = false;
            if(!!this.getInfoLists[index-1]){
                var time =  this.timeparse(this.getInfoLists[index].createTime)-this.timeparse(this.getInfoLists[index-1].createTime);
                if(time>180){
                    bool = true
                }
            }
            return bool;
        },
        shownewacha(item,index){
            //是否显示最新消息提示
            return item.isRead==0 && item.fromUserId != this.$store.state.oaId && (index==0 || this.getInfoLists[index-1].isRead==1)
        },
        download(url,e){
            //手机端下载附件方法
            if(this.$store.state.isMobile){
                e.preventDefault();
                cordova.exec((()=>{

                }),((e)=>{

                }), 'OpenUrlPlugin', 'sendUrl', ['','', url])
            }
        },
        onScroll(e){
            if(e.target.scrollTop==0){
                this.initMsg = 10;
                if(!!this.getInfoLists[0]){
                    this.scrollHeight = this.$refs.chatList.scrollHeight;
                    this.pageItem = this.getInfoLists[0].id
                    this.getChatMsg(this.initMsg,true)
                }
            }
        },
        realImgurl(url,name){
            return this.$store.state.HOST+'/FileUpload/download?realFileName='+url+'&newFileName='+name;
        },
        blurclose(e){
            e.stopPropagation();
            this.showdetail = !this.showdetail;
        },
        close(){
            this.$parent.customerChat = false
        },
        done(type){
            if(type=='getFile'){
                $(this.$refs.getfile).click()
            }
        },
        changeFile(e){
            if(!!e.target.files[0] && e.target.files[0].size/1024>61440){
                this.$store.dispatch('modify',{'type':'isPop','val':true})
                this.$store.dispatch('modify',{'type':'popmsg','val':'上传文件大小不可超过60MB'})
                $(this.$refs.getfile).parent()[0].reset();
                return
            }
            this.curfile = e.target.files[0];
        },
        setIsRead(){
            //设置消息已读未读
            var msg = {
                compId:this.$store.state.compId,
                type:'customer',
                serverId:this.userselect,
                customerId:this.$store.state.remoteConnect.selfId,
                deptId:this.userselect+this.$store.state.remoteConnect.selfId
            }
            this.$store.state.cusWS.send(-1,msg,'isRead',-1)
        },
        changeSelect(customerId,e){
            if(this.userselect !=customerId){
                this.pageItem = null;
                this.setIsRead();
                this.customlist[this.userselect].news = false;
                this.customlistnews[this.userselect] = 0;
                this.userselect = customerId;
                this.getInfoLists =[];
                this.toupTop = false;
                this.getChatMsg(6);
            }
            this.showdetail = false;
            
        },
        pasteEven(e){
            if(!window.clipboardData){
                let pasteitems = e.clipboardData.items;
                if(typeof pasteitems !='undefined'){
                    for(var index in pasteitems){
                        let item = pasteitems[index];
                        if(item.kind == "file"){
                            let file = item.getAsFile()
                            this.curfile = file;
                            if(this.curfile instanceof File == false){
                                this.curfile = new File([file], "clipboard."+item.type.split('/')[1], {type:item.type});
                            }
                        }
                    }
                }
            }
            if(!!this.timeout){
                clearTimeout(this.timeout)
            }
            this.timeout = setTimeout(()=>{
                if(this.$refs.textwz.value!=''){
                    this.ch = this.$refs.textwz.value.split(/\n/).length;
                }
            },0)
        },
        enterInfo(e){
            var e = event || window.event;
            let regx = /\n/;
            this.ch = this.$refs.textwz.value.split(regx).length;
            if((e.ctrlKey && e.keyCode==13) || (!!e.commandKey && e.keyCode == 86)){
                this.sendInfo();
            }
        },
        scrollToBottom(type){
            if(!!this.timer){
                clearTimeout(this.timer);
            }
            var timeout = 50
            if(!!type){
                timeout = 5
            }
            
            this.timer = setTimeout(()=>{
                let $obj = this.$refs.chatList;
                if(!!type){
                    $obj.scrollTop = $obj.scrollHeight-this.scrollHeight;
                }else{
                    $obj.scrollTop = $obj.scrollHeight-$obj.clientHeight;
                }
            }, timeout);
        },
        sendInfo(){
            var context = $(this.$refs.textwz).val().trim();
            if(context==''){
                this.$parent.$parent.popMsgFun('发送内容不能为空！')
            }else{
                context = emoji.unemojify(context)
                let curUser = this.$store.state.remoteConnect
                let msg = {
                    "compId":this.$store.state.compId,
                    "context":context,
                    "deptId":this.userselect+curUser.selfId,
                    "fromName":curUser.username,
                    "fromUserId":curUser.selfId,
                    "imageUrl":curUser.avatarurl,
                    "toName":this.customlist[this.userselect].name,
                    "toUserId":this.userselect,
                    "msgType":0,
                }
                this.$store.state.cusWS.send(-1,msg,'customService',-1)
                msg.createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                this.getInfoLists.push(msg)
                $(this.$refs.textwz).val('')
                this.$refs.textwz.focus();
                this.ch = 1;
                this.customlist[this.userselect].news = false;
                this.customlistnews[this.userselect] = 0;
                this.scrollToBottom();
            }
        },
        getChatMsg(pageSize,bool){
            if(!!this.toupTop && !!bool){
                return
            }
            var query = {
                "compId":this.$store.state.compId,
                "deptId":this.userselect+this.$store.state.remoteConnect.selfId,
                "pageSize":pageSize,
            }
            if(!!bool){
                query.pageIndex = this.pageItem
            }

            this.$http.post(this.$store.state.HOST+'/customer/queryPageCustomer',query).then((res)=>{
                res = res.body;
                if(res.data!=null){
                    if(res.data.length>0){
                        this.getInfoLists = res.data.reverse().concat(this.getInfoLists)
                            if(!!bool){
                                this.scrollToBottom('pre')
                            }else{
                                if(this.pageItem == null){
                                    this.scrollToBottom();
                                }
                            }
                            if(res.data.length>5){
                                this.toupTop=false;
                            }
                    }else{
                        this.toupTop=true
                    }
                }
            })
        }
    },
    created(){
        this.$http.post(this.$store.state.HOST+'/customer/queryService',{"compId": this.$store.state.compId,"customerId":this.$store.state.remoteConnect.selfId}).then((res)=>{
            let result = res.body
            if(result.code == 0 ){
                this.$store.dispatch('modify',{'type':'isPop','val':true})
                this.$store.dispatch('modify',{'type':'popmsg','val':result.msg})
                this.$parent.customerChat = false
                return
            }else{
                this.hasCous=true;
                var usermap = {}, count =0, news={},hasnews=0,onlineuser=[],offlineuser=[];
                for(var cur of result.data){
                    if(!usermap[cur.manager["customerId"]]){
                        if(cur.manager.isOnline == 1 && count ==0){
                            cur.manager["selected"] = true;
                            this.userselect = cur.manager["customerId"];
                            count++;
                        }else{
                            cur.manager["selected"] = false;
                        }
                        if(cur.count>0){
                            if(cur.manager.isOnline == 1){
                                onlineuser.unshift(cur.manager["customerId"])
                            }else{
                                offlineuser.unshift(cur.manager["customerId"])
                            }
                            cur.manager["news"] = true
                        }else{
                            if(cur.manager.isOnline == 1){
                                onlineuser.push(cur.manager["customerId"])
                            }else{
                                offlineuser.push(cur.manager["customerId"])
                            }
                            cur.manager["news"] = false
                        }
                        news[cur.manager.customerId] = cur.count;
                        usermap[cur.manager.customerId] = cur.manager;
                    }
                }
                this.allcustomer = onlineuser.concat(offlineuser)
                this.userselect = this.allcustomer[0];
                this.customlist = usermap;
                this.customlistnews = news;
                this.toupTop = false;
                this.getChatMsg(6);
            }
        })
    },
    destroyed(){
        this.setIsRead();
    }
}
</script>