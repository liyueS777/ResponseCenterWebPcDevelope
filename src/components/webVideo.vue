<!--调用监控组件-->
<template>
   <div class="video-wrapper">
     <p class="video-title">
       {{videoData.name}}
       <i class="iconfont icon-guanbi video-close" title="关闭" @click="videoClose"></i>
     </p>
     <iframe class="webVideo" width="800" height="500"
             :src="webIframeSrc"
             frameborder="0" scrolling="no" ref="webVideo">
     </iframe>
     <span class="web-addr" @click="getWebcomponents()" title="获取浏览器插件">获取浏览器插件</span>
   </div>
</template>
<script>
  export default {
    props:["videoData"],
    data () {
      return {
        webIframeSrc:""
      }
    },
    watch:{
      videoData: function(val,oldVal){
        this.show();
      }
    },
    mounted(){
      this.show()
    },
    methods:{
      videoClose(){
        this.$parent.showWebVideo = false;
      },
      show(){
        const that = this;
        that.dialogCameraDetailVisible = true;
        that.$nextTick(function () {
          let ip,port,userName,pwd;
          ip = this.videoData.ip;
          port = this.videoData.port;
          userName = this.videoData.userName;
          pwd = this.videoData.pwd;
          if (ip && port && userName && pwd) {
            that.webIframeSrc = 'static/webVideo/cn/index.html?szIP=' + encodeURIComponent(ip) + '&szPort=' + port + '&szUsername=' + userName + '&szPassword=' + encodeURIComponent(pwd);
          }else {
            that.webIframeSrc = "";
          }
          that.$refs.webVideo.src = that.webIframeSrc;
        });
      },
      getWebcomponents(){
        location.href = 'static/webVideo/codebase/WebComponents.exe'
      }
    }
  }
</script>
<style lang="less" scoped>
  @import '~assets/styles/webVideo.less';
</style>
