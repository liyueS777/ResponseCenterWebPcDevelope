<template>
    <div class="home-wrapper">
        <div class="wrapper-con">
            <div class="title"><span>响应中心</span><i></i></div>
            <!--视界-->
            <Horizon :horList = "getHorLists" ref="horlist"></Horizon>

            <!--中控区-->
            <div class="instruction">
                <ul class="instruction-ul">
                    <li v-for="item in 9" @click="chatFun('customers',item)" :class="[{'news':(item==8　&& !!showcusnews)}]">
                        <!--<span v-if="$store.state.isMobile">{{item.name}}</span>-->
                    </li>
                </ul>
            </div>
            <!--文字音频视频-->
            <div class="userList-wrapper ins" v-if="showIns && !customerChat">
                <div class="title-top">指令<i title="关闭" class="iconfont icon-guanbi" @click="showIns=false"></i></div>
                <ul class="user-list">
                    <li v-for="item in directives" :title="item.name" @click="chatFun(item.identification)">{{item.name}}</li>
                </ul>
            </div>
            <!--组织盘区-->
            <div class="deptbox" @mousedown="doStart($event)" @mouseup="doEnd($event)" @touchend="doEnd($event)" @touchstart="doStart($event)">
                <div class="dept">
                    <span v-if="pointXYArr.length!=0" class="ltitile">{{isCompany ? (!!showpandata[countdept]?showpandata[countdept].compan.compName:'')  : showpandata[countdept].orgName}}</span>
                    <ul>
                        <li v-for="(item,index) in showpandata" :style="pointXYArr[index]" :title="getTitle(item)" :data-arr="index" :data-apt="getID(item)" @click="showDep(item,index, $event)"><img :src="getImageUrl(item)" draggable="false"/></li>
                    </ul>
                    <transition name="fade">
                        <span class="dep-name" v-if="userInfo.showSelectedname && selectedUser!=null" @click="showStaffView(selectedUser, 0, 'cls')">
                            {{selectedUser["aliasName"] || selectedUser["fullname"]}}
                        </span>
                    </transition>
                </div>
                <span v-if="!!$store.state.company && ($store.state.compSelectId==$store.state.compId || !$store.state.PcompId)" class="switch-btn" @click="switchPanData()">{{switchBtnTitle}}</span>
            </div>
        </div>
        <!--IM区-->
        <IMChat v-if="showMsg" :receiveParam ="receiveParam" :position="position"></IMChat>
        <!--用户列表区-->
        <UserList v-if="userInfo.showUserList && !customerChat" :userlist="userInfo.userlist" :showStaffView="showStaffView" :sltIndex="userInfo.sltIndex"></UserList>
        <!--客户聊天窗口-->
        <GuestChat　v-if="customerChat" :curlogin="receiveLogin" :curmsg="receiveMsg"></GuestChat>
        <!--小翌机器人-->
        <Robot　v-if="robotChat"></Robot>
    </div>

</template>

<script>
import Horizon from '@/components/Horizonlist'
import IMChat from '@/components/IMChat'
import UserList from '@/components/UserList'
import GuestChat from '@/components/guest/GuestChat'
import Robot from '@/components/guest/robot'
import WebSocketClient from '@/plugins/WebSocketClient'
export default {
    name:'Home',
    data(){
        return {
            directives: [],
            pointXYArr:[],//数组定位存储
            maxpanshow:10,//转盘最大展现数
            pandata:[],//转盘原始数据
            showpandata:[],//转盘展示数据
            startindex:0,//旋转序列数
            countdept:10,//选中的部门系列号，非部门id,相对于showpandata
            selectIdx:0,//相对于pandata
            predept:null,//上一个选中的部门，只在点击事件下成立
            countdeptList:{},//部门id与部门序号映射表
            animatetime:250,//转盘动画速度
            animateffect:'linear',//旋转动画
            selectedUser:null,//选中的音视频的人
            comList:[],//公司视界集展示数据
            countList:[],//部门视界集展示数据
            staffHorList:[],//个人视界集展示数据
            showMsg: false,//是否显示IM窗口
            receiveParam:{}, //接收IM聊天回来的消息
            position: 'com', // 公司: "com", 部门: "dept", 员工:"staff"
            userInfo:{
                showUserList: false,//是否显示用户列表窗口
                showSelectedname:false,//转盘部门负责人状态显示
                userlist: [], //部门用户信息数据
                sltIndex: '' //被选择的成员信息
            },
            isCompany: false, // 公司层级为true, 部门层级为false
            curfile:null,//附件列表
            customerChat:false,//客服聊天
            receiveMsg:null,
            receiveLogin:null,
            showIns:false,//是否展示指令区
            showcusnews:false,//客服是否显示新消息提示
            robotChat:false
        }
    },
    computed:{
        getHorLists(){
            if(typeof this.$refs.horlist!='undefined')
                $(this.$refs.horlist.$el).find('li').removeClass('active')
            if(this.position == "com"){
                return this.comList;
            }else if(this.position == "dept"){
                return this.countList;
            }else{
                return this.staffHorList;
            }
        },
        switchBtnTitle(){
            return this.isCompany ? "部门": "公司";
        }
    },
    methods:{
        getTitle(obj){
            return this.isCompany ? obj.compan.compName : obj.orgName;
        },
        getID(obj){
            return this.isCompany ? obj.compan.compId : obj.id
        },
        getImageUrl(obj){
            return this.isCompany ? obj.compan.imageUrl : obj.imageUrl
        },
        IM(data){
            var receiveData = data;
            var receiveParam = {
                "compId": receiveData.compId,
                "deptId": receiveData.deptId,
                "createTime": receiveData.createTime || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "context": receiveData.context,
                "fromUserId": receiveData.fromUserId,
                "fromName": receiveData.fromName,
                "toName": receiveData.toName,
                "toUserId": receiveData.toUserId,
                "imageUrl": receiveData.imageUrl,
                "type":"IM"
            }
            this.receiveParam = receiveParam;
        },
        //客满中心方法
        registSocketFun(ws,type){
            if(typeof this[type]=='function'){
                ws.on(type, this[type].bind(this));
            }
        },
        customService(data){
            if(!this.customerChat){
                this.showcusnews = true;
            }
            this.receiveMsg = data;
        },
        servicelist(data){
            this.receiveLogin = data
        },
        chatFun(type,index){
            //中控区事件
            if(!!index && index!=8 && index!=9){
                return
            }
            if(!!index && index==9){
                this.robotChat = true;
                return
            }
            if(!!index && index==8 && type=='customers'){
                if(this.$store.state.cusWS == null){
                    var reqWsUrl = this.$store.state.HOST.replace(/http/, 'ws')+ '/customerWS/';
                    var that = this;
                    var comid = this.$store.state.PcompId || this.$store.state.compId;
                    var curWS = new WebSocketClient({
                        path: reqWsUrl+comid+'/'+this.$store.state.oaId+'/customer', //测试服务器 http://172.19.6.178:8080
                        open(){
                            that.$store.dispatch('modify',{'type':'cusWS','val':this})
                            that.registSocketFun(this,'servicelist')
                            that.registSocketFun(this,'customService')
                        },
                        close(){
                        }
                    })
                    setInterval(()=>{
                        curWS.send('ping','keepMsg');
                    },60000)
                }
                this.customerChat = true;
                return;
            }
            if(this.$store.state[type] == undefined){
                this.$parent.popMsgFun('您暂未开通此权限！');
                return;
            }
            if(this.$store.state.webStatus == false && isWsExit==false){
                this.$parent.popMsgFun('连接不上通讯服务，请检查网络',true);
                return;
            }
            if(isWsExit==true){
                this.$parent.popMsgFun('您已在其他终端登录',true);
                return;
            }
            if(type=='message'){
                if(this.$store.state.login){
                    if(this.position == "com"){
                        this.$parent.popMsgFun('公司通信暂未开通，敬请期待！');
                        return;
                    }
                    if( this.position == "staff" && this.$store.state.oaId == this.$store.state.toUserId){
                        this.$parent.popMsgFun('不能与自己进行消息通信！');
                        return;
                    }
                    if( this.position == "dept" && this.$store.state.oaDeptId != this.$store.state.deptId){
                        this.$parent.popMsgFun('暂不能与其它部门进行通信！');
                        return;
                    }
                    if (!this.showMsg) this.showMsg = true;
                    this.showIns = false;
                    this.userInfo.showUserList = false;

                }else{
                    this.$parent.popMsgFun('您暂未登录，请先登录！')
                }
            }else if(type=='frequency' || type=='video'){
                if(!this.$store.state.isMobile){
                    let tip = (type=='frequency')?'语音':'视频';
                    this.$parent.popMsgFun(tip+'通话暂未开通，敬请期待！');
                    return;
                }
                if(this.selectedUser==null){
                    this.$parent.popMsgFun('请选择人员进行音视频');
                    return;
                }
                let media = (type=='frequency')?{'video':false,'audio':true}:{'video':true,'audio':true};
                if(this.$store.state.remoteConnect==null){
                    this.$parent.popMsgFun('未连接通讯服务');
                    return;
                }
                this.showIns = false
                var device = this.$store.state.device == 'pc' ? 'pc': 'phone';
                this.$store.state.remoteConnect.startCall({'to':this.selectedUser['userId'],'toUsername':this.selectedUser['fullname'],'toAvator':this.selectedUser['imageUrl'],'media':media, 'device': device})
            }
        },
        setPandata(data){
            //配置转盘数据,data为转盘展现全部数据，若数据改变只需要调用该方法
            let len = data.length;
            if(len>this.maxpanshow){
                this.noneedchange = true
            }else{
                this.noneedchange = false
            }
            if(len>0){
                if(len>this.maxpanshow) len=this.maxpanshow;
                this.pandata = data;
                this.userInfo.showSelectedname = true;
                var cutidx = 0,chant = {};
                data.forEach((item, index)=>{
                    let chantid;
                    if(!!item.compan){
                        chant[item.compan.compId]=index;
                        if(item.compan.compId == this.$store.state.compSelectId){
                            cutidx = index;
                            return;
                        }
                    }else{
                        chant[item.id]=index;
                        if(item.id == this.$store.state.oaDeptId){
                            cutidx = index;
                            return;
                        }
                    }
                })
                this.countdeptList = chant
                if(cutidx+1 > this.maxpanshow){
                    this.showpandata = this.pandata.slice(cutidx+1-len,cutidx+1);
                }else{
                    this.showpandata = this.pandata.slice(0,len)
                }
                this.countdept = len-1;
                this.selectIdx = this.getRealIndex(len-1)
                this.initPan(len);

            }
        },
        getRealIndex(index){
            if(this.isCompany){
                return this.countdeptList[this.showpandata[index].compan.compId]
            }else{
                return this.countdeptList[this.showpandata[index].id]
            }

        },
        getDept(){
            //获取转盘部门
            this.$http.post(this.$store.state.HOST+'/depart/getDepartInfo',{ "compId": this.$store.state.compSelectId}).then((res)=>{
                if(res && res.body.code){
                    this.isCompany = false;
                    this.setPandata(res.data.data);
                }else{
                    this.isCompany = true;
                    this.$parent.popMsgFun("部门信息为空，请联系管理员！")
                }
            });
        },
        getCompany(){
            var compId = this.$store.state.PcompId || this.$store.state.compId
            this.$http.post(this.$store.state.HOST+'/company/getCompanyAllInfo', {"compId": compId}).then((res)=>{
                if(res && res.body.code){
                    if(res.body.data == null) return;
                    this.isCompany = true;
                    this.setPandata(res.body.data);
                }else{
                    this.isCompany = false;
                }
            }, (err)=>{});
        },
        getCompanyView(){
            //获取公司视界集
            let param ={compId:this.$store.state.compSelectId};
            this.$http.post(this.$store.state.HOST+'/company/getViewByCompany', param ).then((res)=>{
                this.comList = res.body.data;
            });
        },
        getView(){
            //获取视界集
            let param ={compId:this.$store.state.compSelectId,departId:this.showpandata[this.countdept].id}
            this.$http.post(this.$store.state.HOST+'/depart/getViewByDept', param ).then((res)=>{
                this.countList = res.body.data;
            });
        },
        getUserInfoByDept(){
            this.$http.post(this.$store.state.HOST+'/depart/getUserInfoByDept', {"compId": this.$store.state.compSelectId, "departId": this.showpandata[this.countdept].id}).then((res)=>{
                if(res){
                    if(res.data.data == null){
                        this.userInfo.userlist=[];
                        this.selectedUser=null;
                        if(!!this.$store.state.depart==true && !this.$store.state.company && this.showpandata[this.countdept].id != this.$store.state.oaDeptId) return
                        this.userInfo.showUserList = true
                        return
                    };
                    this.selectLeader(res.data.data);
                    if(!!this.$store.state.depart==true && !this.$store.state.company && this.showpandata[this.countdept].id != this.$store.state.oaDeptId) return
                    this.userInfo.showUserList = true
                }
            }, (err)=>{});
        },
        getDirective(){
            this.$http.post(this.$store.state.HOST+'/directive/getDirectives', { "compId": this.$store.state.PcompId || this.$store.state.compId}).then((res)=>{
                if(res){
                    if(res.data.data == null) return;
                    this.directives = res.data.data;
                }
            }, (err)=>{});
        },
        getResources(){
            var param = {
                "compId": this.$store.state.PcompId || this.$store.state.compId,
                "userId": this.$store.state.userId
            }
            this.$store.dispatch('modify',{type:'compSelectId',val:this.$store.state.compId})
            //resCode: 101:消息、102：音频、103：视频，201：公司、202：部门、203：员工
            var resObj = {
                "101":"message",
                "102":"frequency",
                "103":"video",
                "201":"company",
                "202":"depart",
                "203":"staff"
            }
            this.$http.post(this.$store.state.HOST+'/resource/getResourcesByUserId', param).then((res)=>{
                if(res.body.code){
                    if(res.body.data == null) return;
                    var resourceList = res.body.data;
                    resourceList && resourceList.length && resourceList.map((item, key)=>{
                        this.$store.dispatch('modify',{type:resObj[item.resCode],val:true})
                        if(item.resCode == '201'){
                            this.isCompany = true;
                        }
                        this.$store.dispatch('modify',{type:'compSelectId',val:this.$store.state.compId})
                    })
                    if(this.isCompany){
                        this.getCompany();
                    }else{
                        this.getDept();
                    }
                }
            }, (err)=>{});
        },
        selectLeader(arr){
            if(Array.isArray(arr)){
                var index = 0;
                arr.some((item, key)=>{
                    if(item.isLead == 1){ //  isLead,  1: 领导， 0: 非领导
                        this.selectedUser = item;
                        index = key;
                        return true;
                    }
                })
                var lead =  arr.splice(index, 1);
                this.userInfo.userlist = lead.concat(arr);
            }
        },
        showDep(clickobj,curindex, event){

            //未开通公司权限和部门权限时，不可切换部门视界集
            if(this.$store.state.company == undefined && this.$store.state.depart == undefined ){
                var depart_id= $(event.target).attr('data-apt') || $(event.target).parent().attr('data-apt');
                if(depart_id != this.$store.state.oaDeptId){
                    this.$parent.popMsgFun("您未开通查看其他部门权限！");
                    return;
                }
            }
            //旋转盘点击选中事件
            if(!this.$store.state.isMobile) this.showMsg = false;
            this.predept = this.selectIdx
            this.countdept = curindex
            this.selectIdx = this.getRealIndex(curindex);

            let that = this;
            let cutlen = that.pointXYArr.length-1-curindex;
            $(this.$el).find('.dept').find('li').each(function(index){
                if(index==curindex){
                    that.animateEvent(this,that.pointXYArr[that.pointXYArr.length-1])
                    $(this).addClass('selected').siblings().removeClass('selected');
                }else{
                    let tranidnex;
                    if(index+cutlen<=that.pointXYArr.length-1){
                        tranidnex = that.pointXYArr[index+cutlen]
                    }else{
                        tranidnex = that.pointXYArr[index+cutlen-that.pointXYArr.length]
                    }
                    that.animateEvent(this,tranidnex)
                }
            })
            this.startindex =  that.pointXYArr.length-curindex-1;
            if(this.isCompany && !!clickobj.compan){
                this.position="com";
                this.$store.dispatch('modify', {type: 'compSelectId', val: clickobj.compan.compId});
                this.selectedUser = clickobj.companyUser;
                // console.info('点击选中的公司id',this.countdept)
                this.getCompanyView();
            }else{
                this.position="dept";
                // console.info('点击选中的部门id',this.countdept);
                if(this.$store.state.company){
                    this.showIns = false;
                }else{
                    if( clickobj.id == this.$store.state.oaDeptId){
                        this.showIns = false;
                    }else{
                        this.userInfo.showUserList = false;
                    }
                }
                this.$store.dispatch('modify', {type: 'deptId', val: clickobj.id+''});
                this.getView();
                this.getUserInfoByDept();
            }
        },
        showStaffView(obj, index, type){
            this.selectedUser = obj;
            this.position = "staff";
            this.userInfo.showSelectedname = true;
            this.userInfo.showUserList = false;
            this.userInfo.sltIndex = index;
            if(!!type && type=='cls') this.showIns = true;
            var toUsrId = '', toUsrName = ''
            toUsrId = obj['userId'];
            toUsrName = obj['aliasName'];
            var param = {
                "compId": this.$store.state.compSelectId,
                "userId": this.isCompany ? obj.uId  :obj.id
            }
            this.$http.post(this.$store.state.HOST+'/user/getViewByUser', param).then((res)=>{
                if(res){
                    if(res.body.data==null) return;
                    this.staffHorList = res.body.data;
                }
            }, (err)=>{});
            this.$store.dispatch('modify',{type:'toUserId',val: toUsrId});
            this.$store.dispatch('modify',{type:'toUsername',val: toUsrName});
            if(this.$store.state.oaId == toUsrId) return;
            var deptId = this.sortUserId(this.$store.state.oaId, toUsrId)
            this.$store.dispatch('modify',{type:'deptId',val: deptId});

        },
        initPan(len){
            //初始化转盘定位
            let ctx = $(this.$el).find('.dept').find('ul')[0],ctx1 = $(this.$el).find('.dept')[0]
            const temp = Math.PI/180;
            var a = Math.pow((ctx.offsetWidth-40)/2,2), b = Math.pow((ctx1.offsetHeight+60)/2,2);
            let square = 360/len;

            function getXY(k){
                let sum = (a*b)/(b+Math.pow(k, 2)*a),
                    x=Math.sqrt(sum),
                    y = k*x;
                    return{ x:x,y:y}
            }
            let exitArr = [];
            for(var i=1;i<=len;i++){
                var k = 1/Math.tan(temp*square*i);
                var result = getXY(k)
                if(i>len/2){
                     let left = ctx.offsetWidth/2+result.x-16+'px',
                         top = ctx1.offsetHeight/2-result.y-16+'px';
                     exitArr.push({left:left,top:top})
                }else{
                     let left = ctx.offsetWidth/2-result.x-16+'px',
                         top = ctx1.offsetHeight/2+result.y-16+'px';
                     exitArr.push({left:left,top:top})
                }
            }
            this.pointXYArr = exitArr
            clearTimeout(this.timeout)
            this.timeout = setTimeout(()=>{
                var $ctxLi;
                if(this.isCompany){
                    $ctxLi = $(ctx).find('li[data-apt='+this.$store.state.compSelectId+']');
                }else{
                    $ctxLi = $(ctx).find('li[data-apt='+this.$store.state.oaDeptId+']');
                }
                if($ctxLi.length==0){
                    $ctxLi = $(ctx).find('li:last-child');
                }
                $ctxLi.addClass('selected').trigger('click');
            }, 100)
        },
        doEnd(event){
            console.log(111111);
            event = event || window.event;
            if(this.$store.state.isMobile){
                var touch = event.changedTouches
                if(typeof touch=='undefined') return;
                this.endX = touch[0].clientX
                this.moveDepBoard(this.startX, this.endX)
            }else{
                this.pcEndX = event.clientX
                this.moveDepBoard(this.pcStartX, this.pcEndX)
            }
        },
        doStart(event){
            event = event || window.event
            if(this.$store.state.isMobile){
                var touch = event.changedTouches
                if(typeof touch=='undefined') return;
                this.startX = touch[0].clientX
            }else{
                this.pcStartX = event.clientX
            }
        },
        animateEvent(obj, movelen){
            this.userInfo.showSelectedname = false
            $(obj).animate(movelen,this.animatetime,this.animateffect,()=>{
                this.userInfo.showSelectedname = true
            })
        },
        moveDepBoard(startX, endX){
            //未开通公司权限和部门权限时，不可转动转盘切换视界集
            if(this.$store.state.company == undefined && this.$store.state.depart == undefined) return;
            let len = this.pointXYArr.length,
                that = this;
            //鼠标滑动来切换视界集，默认显示最底下部门
            function addSelect(num,$obj){
                // 增加选择效果
                if(num==that.pointXYArr.length-1){
                    let dataapt = $obj.attr('data-apt'),
                        dataidnex = $obj.attr('data-arr');
                    $obj.addClass('selected').siblings().removeClass('selected')
                }
            }
            if(Math.abs(endX - startX) > 20){
                this.userInfo.showUserList = false;
                if(!this.$store.state.isMobile) this.showMsg = false;
                if( endX - startX > 20){
                    //逆时针滑动
                    this.selectIdx++;
                    this.selectIdx = (this.selectIdx>this.pandata.length-1) ? 0:(this.selectIdx);
                    this.countdept++;
                    this.countdept = (this.countdept>this.showpandata.length-1) ? 0:(this.countdept);
                    //转盘动画
                    $(this.$el).find('.dept').find('li').each(function(index){
                        let anim;
                        if(that.startindex>0){
                            anim = ((len-that.startindex)-index+1>0)?(len-Math.abs((len-that.startindex)-index+1)):Math.abs((len-that.startindex)-index+1);
                        }else{
                            anim = (index-1<0)?(len-index-1):(index-1)
                        }
                        addSelect(anim,$(this))
                        that.animateEvent(this,that.pointXYArr[anim])
                    })
                    //转盘数据
                    let startindex = (this.startindex==0)?this.startindex:len-this.startindex;
                    if(!!this.noneedchange){
                        this.showpandata.splice(startindex,1,this.pandata[this.selectIdx])
                    }
                    this.selectedUser = this.showpandata[that.countdept].companyUser;
                    this.startindex = (this.startindex<=0)?len-1:(this.startindex-1);
                    if(this.isCompany){
                        this.$store.dispatch('modify',{type:'compSelectId',val: this.showpandata[this.countdept].compan.compId});
                    }
                }else if( startX - endX > 20){
                    //顺时针滑动
                    this.countdept--;
                    this.countdept =(this.countdept<0)? this.showpandata.length-1:this.countdept
                    this.selectIdx--;
                    this.selectIdx = (this.selectIdx<0) ? this.pandata.length-1:this.selectIdx;
                    //转盘动画
                    $(this.$el).find('.dept').find('li').each(function(index){
                        let anim = (index>=len-1-that.startindex)?(index-len+1+that.startindex):(index+1+that.startindex);
                        addSelect(anim,$(this))
                        that.animateEvent(this,that.pointXYArr[anim])
                    })
                    //转盘数据
                    if(!!this.noneedchange){
                        let cuto = this.selectIdx+1>=this.pandata.length?0:this.selectIdx+1
                        this.showpandata.splice(this.showpandata.length-this.startindex-1,1,this.pandata[cuto])
                    }
                    let curpre = this.showpandata.length-this.startindex-1,
                        preindex = (curpre-1)>=0? curpre-1 : this.showpandata.length-1,
                        nextindex = preindex-1>=0? preindex-1 : this.showpandata.length-1;
                    this.selectedUser = this.showpandata[that.countdept].companyUser;
                    this.startindex = (this.startindex>=len-1)?0:(this.startindex+1);
                    if(this.isCompany){
                        this.$store.dispatch('modify',{type:'compSelectId',val: this.showpandata[this.countdept].compan.compId});
                    }
                }
                if(!this.isCompany){
                    this.position = 'dept';
                    this.getView();

                    this.getUserInfoByDept();
                }else{
                    this.position = 'com';
                    this.getCompanyView();
                }
            }
        },
        sortUserId(fromUserId, toUserId){
            var tempArr = [];
            tempArr.push(fromUserId, toUserId);
            tempArr.sort(function(fromUserId, toUserId){
            return fromUserId - toUserId
            })
            return tempArr.join('');
        },
        switchPanData(){
            if(this.isCompany){
                this.userInfo.showUserList = false
                this.getDept();
            }else{
                this.userInfo.showUserList = false
                this.getCompany();
            }
        },
        setCusomerNews(){
            this.$http.post(this.$store.state.HOST+'/customer/queryService',{"compId": this.$store.state.compId,"customerId":this.$store.state.remoteConnect.selfId}).then((res)=>{
                let result = res.body
                if(result.code == 1){
                    var usermap = {}, count =0, news={};
                    for(var cur of result.data){
                        count+=cur.count;
                    }
                    if(count>0){
                        this.showcusnews = true;
                    }
                }
            })
        }
    },
    watch:{
        '$store.state.remoteConnect'(val, oldVal){
            if(val){
                val.$webSocket.on('IM', this.IM.bind(this));
                this.setCusomerNews();
                window.Tsl=val.$webSocket
            }
        },
        '$store.state.oaId'(val, oldVal){
            if(val){
                this.getResources();
                this.getDirective();
            }
        },
        'countdept'(val, oldVal){
            if(val && this.position == 'dept'){
                this.userInfo.sltIndex = 0;
            }
        }
    },
    components:{
        Horizon,
        IMChat,
        UserList,
        GuestChat,
        Robot
    }
}
</script>
<style lang='less'>
    @import '~assets/styles/home.less';
    @import '~assets/styles/userlist.less';
</style>
