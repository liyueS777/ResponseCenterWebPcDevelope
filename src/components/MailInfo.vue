<!--调用通讯组件-->
<template>
    <div class="mailInfoDiv">
        <i class="iconfont icon-guanbi echartsClose" title="关闭" @click="mailClose"></i>
        <div class="mailInfoBox">
          <p class="mail-photo">
            <img :src="mailData.photo">
          </p>
          <ul class="mail-info">
            <li><label>字号:</label><span>{{mailData.name}}</span></li>
            <li><label>职位:</label><span>{{mailData.position}}</span></li>
            <li><label>部门:</label><span>{{mailData.departName}}</span></li>
            <li><label>邮箱:</label><span>{{mailData.email}}</span></li>
          </ul>
        </div>
    </div>
</template>
<script>
  
  export default {
    props:["mailData"],
    data () {
      return {
    
      }
    },
    methods:{
      mailClose(){
        this.$parent.showMailInfo = false;
      }
    },
  }
</script>
<style lang="less" >
 @import '~assets/styles/mailInfo.less';
</style>
