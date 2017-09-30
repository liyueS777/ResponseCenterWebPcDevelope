<template>
  <div id="app" class="app-wrapper">
    <router-view></router-view>
    <!--复用弹出框-->
    <PopTip :popmsg="$store.state.popmsg" :poptype="$store.state.poptype" v-if="$store.state.isPop"></PopTip>
  </div>
  
</template>

<script>
import store from './store/home'
import initcordova from '@/plugins/initCordova'
import WebSocketClient from '@/plugins/WebSocketClient'
import videoCall from '@/plugins/videoPlugin'
import PopTip from '@/components/common/PopTip'
import moment from 'moment'
import emoji from 'node-emoji'

export default {
  name: 'app',
  store,
  components:{PopTip},
  data(){
    return {
      sessionid: ''
    }
  },
  methods:{
    popMsgFun(msg,bool){
        this.$store.dispatch('modify',{'type':'isPop','val':true})
        this.$store.dispatch('modify',{'type':'popmsg','val':msg})
        if(!!bool){
          this.$store.dispatch('modify',{'type':'poptype','val':bool})
        }
    },
    getUser(sessionid, url){
        var that =this;
        //url="http://uc.weilian.cn/account_auth_admin/user-api.findBySessionId"//测试
        $.ajax({
            type: "POST",
            url: url, //用户中心地址
            data: {
                sessionId: sessionid,
                // enterpriseCode: "SUNEEE",
                // clientIp: "127.0.0.1",
                // encryptCode:"1234567899876543",
                // appCode: "XIANGPU"
            },
            dataType: "json",
            success: (result)=>{
                if(result.data==null){
                  alert(result.message)
                  return
                }
                var userdata = result.data.user
                if(!result.data.dataPower.enterprise){
                  that.$store.dispatch('modify',{type:'popmsg',val:"当前帐号无企业信息的信息"});
                  that.$store.dispatch('modify',{type:'isPop',val:true});
                  return
                }
                if(!!result.data.dataPower.enterprise.company.comp_code){
                    var curComId = result.data.dataPower.enterprise.company.comp_code
                    that.$http.post(this.$store.state.HOST+'/company/getCompIdByCode',{"compCode":curComId}).then((res)=>{
                        res = res.body
                        let splitarr=['SUNEEE','YINENG'];
                        if(!!result.data.dataPower.enterprise.company.cluster_code && result.data.dataPower.enterprise.company.cluster_code!='' && splitarr.indexOf(result.data.dataPower.enterprise.company.comp_code)==-1){
                          that.$http.post(this.$store.state.HOST+'/company/getCompIdByCode',{"compCode":result.data.dataPower.enterprise.company.cluster_code}).then((resp)=>{
                            resp = resp.body
                            if(resp.code==1){
                              that.$store.dispatch('modify',{type:'PcompId',val:resp.data});
                            }
                          });
                        }
                        if(res.code==1){
                            that.$store.dispatch('modify',{type:'compId',val:res.data});
                            that.$store.dispatch('modify',{type:'login',val:userdata});
                            that.$store.dispatch('modify',{type:'avatorurl',val: that.usercenterImageURL}); //用户中心头像地址
                            that.$http.post(this.$store.state.HOST+'/depart/updateUserImage',{"compId": this.$store.state.compId, "email":userdata.email, 'newImage':that.usercenterImageURL+userdata.photo}).then(function(res){
                              // console.log(res.msg)
                            });
                            var email = userdata.email;
                            that.$http.post(this.$store.state.HOST+'/depart/queryUserInfoByEmail',{"compId": this.$store.state.compId, "email": email}).then(function(userres){
                                if(userres.data.data==null){
                                  that.popMsgFun(`帐号信息有误，请联系管理员`);
                                  return;
                                }
                                var userid = userres.data.data.userId;
                                var departid = userres.data.data.departId;
                                that.$store.dispatch('modify',{type:'userId',val:userres.data.data.id}) // oa 用户id
                                that.$store.dispatch('modify',{type:'oaId',val:userid}) // oa uerId
                                that.$store.dispatch('modify',{type:'oaDeptId',val:departid+''}) // oa部门id

                                var equipmentType = that.$store.state.isMobile ? 'phone': 'pc';
                                //本地地址：ws://172.19.5.83:8090/command/websocketDemo/{userId}/{equipmentType}
                                var reqWsUrl = that.$store.state.HOST.replace(/http/, 'ws')+ '/websocketDemo/';
                                var webSocket =new WebSocketClient({
                                    path: reqWsUrl+userid+`/${equipmentType}`, //测试服务器 http://172.19.6.178:8080  
                                    open (){
                                      let user = {'userId':userid, 'deptId': departid, 'device': that.$store.state.device}
                                      this.request(user, 'login', userid).then((user) => {
                                          console.log('用户已登陆', user)
                                          that.$store.dispatch('modify',{type:'webStatus',val:true})
                                          var a = videoCall.get(userid)
                                          a.setws(this)
                                          a.setName((userdata.userName || userdata.name))
                                          a.setAvator(that.usercenterImageURL+userdata.photo)
                                          if(that.$store.state.isMobile){
                                            a.registSocketFun('remoteCall')
                                            a.registSocketFun('remoteJoin')
                                          }
                                          a.setVue(that.popMsgFun)
                                          that.$store.dispatch('modify',{type:'remoteConnect',val:a})
                                          setInterval(()=>{
                                            this.send('ping','keepMsg');
                                          },60000)
                                      },(msg) => {
                                      })
                                    },
                                    loginout(data){
                                      var deviceObj = {
                                        'pc': '电脑',
                                        'ios':'iphone',
                                        'android': 'Android'
                                      }

                                      that.popMsgFun(`账号在另一台${deviceObj[data.device]}上登录！`);
                                      webSocket.close();
                                    },
                                    loginoutJoin(data){
                                      // that.popMsgFun(`另一个设备已回应`);
                                      // webSocket.close();
                                    },
                                    close(){
                                      if(that.$store.state.webStatus != false){
                                        that.$store.dispatch('modify',{type:'webStatus',val:false})
                                      }
                                    }
                              });
                          });
                        }else{
                            res.msg="系统无当前用户的企业信息存在，请联系管理员"
                            that.$store.dispatch('modify',{type:'popmsg',val:res.msg});
                            that.$store.dispatch('modify',{type:'isPop',val:true});
                            return
                        }
                    })
                }
            }
        });
    },
    getSystemConfig(){
        this.$http.post(this.$store.state.HOST+'/systemConfig/getSystemConfigList').then((res)=>{
          if(res.body.code){
            let configList = res.body.data;
            configList && configList.length && configList.map((item, key)=>{
              this[item.configKey] = item.configValue;
            })
            this.getUser(this.sessionid, this.usercenterURL);
          }
        });
    }
  },
  beforeMount(){
    window.isWsExit = false; //是否主动关闭websocket
    window.emoji = emoji;
    window.moment = moment;
    this.$store.dispatch('modify',{type:'HOST',val:HOST})
    let u = navigator.userAgent,
            isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
            isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            isIpad = u.indexOf('iPad') > -1 
    let isMobile = isAndroid || isiOS || isIpad;
    this.$store.dispatch('modify',{type:'isMobile',val:isMobile})
    this.$store.dispatch('modify',{type:'isAndroid',val:isAndroid})
    this.$store.dispatch('modify',{type:'isiOS',val:isiOS})
    this.$store.dispatch('modify',{type:'isIpad',val:isIpad})

    var device = !isMobile ? 'pc': ( isAndroid ? 'android' : 'ios');
    this.$store.dispatch('modify',{type:'device',val: device});

    var reg = new RegExp("(^|&)sessionId=([^&]*)(&|$)");
    this.sessionid = window.location.search.substr(1).match(reg)[2];
    this.getSystemConfig();
  },
  beforeDestroy(){
     this.$store.state.remoteConnect.$webSocket.close()
  }
}
</script>

<style lang="less">
  @import '~assets/styles/iconfont/iconfont.css';
  @import '~assets/styles/base.less';
  @import '~assets/styles/IMchat.less';
</style>
