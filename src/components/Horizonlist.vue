<template>
    <div class="horizon">
        <ul class="horizon-ul" v-if="JSON.stringify(horList) != '{}'">
            <li class="horizon-li" v-for="(item,index) in showdata" @click="showDetail(item,item['datatype'],$event)" :title="item.datatip">
                <!--监控类-->
                <span :style="{'backgroundImage':'url('+item.imageUrl+')'}" v-if="item['datatype']=='control'"></span>
                <!--数据类-->
                <span :style="{'backgroundImage':'url('+item.chart.imageUrl+')'}" v-if="item['datatype']=='data'"></span>
                <!--通讯类-->
                <span :style="{'backgroundImage':'url('+item.photo+')'}" v-if="item['datatype']=='chart'"></span>
            </li>
            <li class="horizon-li" v-if="showdata.length!=9" v-for="i in (9-showdata.length)"></li>
        </ul>
        <ul class="horizon-ul" v-else>
            <li class="horizon-li" v-for="i in 9" title="暂无属性"><span class="ndata">暂无属性</span></li>
        </ul>
        <ul class="listpage" v-if="isPage && allpage>1">
            <li v-for="i in allpage" class="listpage-item" @click="pageindex = i"></li>
        </ul>
        <!--数据图表-->
        <EchartsData :echartdata = "echartdata" :echarttype = "echarttype" v-if = "showEcharts"></EchartsData>

        <!--视频监控区-->
        <WebVideo :videoData="videoParam" v-if="showWebVideo"></WebVideo>
        
        <!--个人信息区-->
        <MailInfo :mailData="mailInfo" v-if="showMailInfo"></MailInfo>
    </div>
    
</template>
<script>
  import EchartsData from '@/components/EchartsData'
  import MailInfo from '@/components/MailInfo'
  import WebVideo from '@/components/webVideo'
  export default {
    name: 'Horizonlist',
    data () {
      return {
          isPage:false,//是否分页
          getHorData:[],
          pageindex:0,
          allpage:0,
          echarttype: '',//图表数据类型[chart,permsg]
          echartdata: null,//图表数据
          showEcharts:false,//图表数据状态
          showMailInfo: false, //是否显示个人信息窗口
          showWebVideo: false, //是否显示视频监控窗口
          mailInfo: {}
      }
    },
    props:['horList'],
    computed:{
        showdata(){
            this.showMailInfo = false;
            this.showEcharts = false;
            let lastnum;
            if(this.origindata == undefined) return [];
            if( this.origindata.length>=this.pageindex+9){
                lastnum = this.pageindex+9
            }else{
                lastnum = this.origindata.length;
            }
            return this.origindata.slice(this.pageindex,lastnum);
        },
        origindata(){
            if(this.horList == null) return;
            let arrHori = [];
            for(let key in this.horList){
                let datatype,datatip;
                if(key=='cameraList' || key=='chartList'){
                    datatype = key=='cameraList'?'control':'data';
                    datatip = key=='cameraList'?'视频监控':'数据';
                    this.horList[key].map((item)=>{
                        item.datatype = datatype;
                        item.datatip = datatip;
                        arrHori.push(item);
                    })
                }
            }
            if(!!this.horList["mailList"] && this.horList["mailList"].length!=0){
                let person = this.horList["mailList"];
                person.map((item)=>{
                    item.datatype = 'chart';
                    item.datatip = '通讯'
                    arrHori.push(item);
                })
            }
            this.allpage = Math.ceil(arrHori.length/9)
            return arrHori
        }
    },
    methods: {
        showDetail(data,type,e){
            $(e.currentTarget).addClass('active').siblings().removeClass('active')
            this.showMailInfo = false;
            this.showEcharts = false;
            this.showWebVideo = false;
            if(type=='control'){
                var vParam = {
                    "compId": this.$store.state.compId, 
                    "cameraId":data.id
                }
                this.$http.post(this.$store.state.HOST+'/camera/getCameraOne', vParam ).then((res)=>{
                    if(res){
                          var resData = res.body.data;
                          this.videoParam = {}
                          this.videoParam.ip = resData.ip;
                          this.videoParam.port = resData.port;
                          this.videoParam.userName = resData.userName;
                          this.videoParam.pwd = resData.pwd;
                          this.videoParam.name = resData.name;
                          this.videoParam.equipmentport = resData.equipmentPort;
                          if(!!window.ActiveXObject || "ActiveXObject" in window){
                              this.showWebVideo = true
                          }
                          var videoData ={
                              "IP": this.videoParam.ip,
                              "ipPort": this.videoParam.port,
                              "username": this.videoParam.userName,
                              "pwd": this.videoParam.pwd,
                              "devicePort": this.videoParam.equipmentport,
                              "name":this.videoParam.name
                          }

                          if(this.$store.state.isAndroid){
                              this.CenterCommandPlugin("center_video",JSON.stringify(videoData))
                          }
                          if(this.$store.state.isiOS){
                              this.jsCallOCiosCenterVideo(this.videoParam)
                          }

                      }
                    
                }, (err)=>{
                    // console.log('获取视频监控详情请求错误')
                });
            }else if(type=='data'){
                this.echarttype = 'chart'
                this.echartdata = data;
                this.showEcharts = true
            }else if(type=='chart'){
                this.mailInfo = data;
                this.showMailInfo = true
            }
        },
        CenterCommandPlugin(paramType, params){
          //视频监控调用方法
          if(paramType=="center_video"){
              cordova.exec(function(data) {
                //   console.log('data--', data)
              }, function(e) {
              }, "CenterCommandPlugin"
              , "center_video"
              , ['',params,'']);
          }
        },
        jsCallOCiosCenterVideo(videoParam){
            videoParam = 'webRtc'+JSON.stringify(videoParam)
            cordova.exec(function(data) {
            }, function(e) {

            }, "MonitoringPlugin"
            , "getMonitorVideo"
            , ['',videoParam,'']);
        },
    },
    beforeMount(){
    },
    components:{
        EchartsData,
        MailInfo,
        WebVideo
    }
  }
</script>
<style lang='less' scoped>
.listpage{
    display: inline-block;
    margin: auto;
    &:before,&:after{
        clear:both;
        content:'';
        display:block;
        height:0;
    }
    .listpage-item{
        float:left;
        margin:0 3px;
        cursor:pointer;
        &:before{
            content:'';
            display:block;
            width:10px;
            height:10px;
            background:#fff;
            border-radius:100px;
        }
    }
}
    
</style>