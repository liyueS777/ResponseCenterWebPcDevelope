<!--部门成员列表组件 暂无用处，后期群视频-->
<template>
    <div class="userList-wrapper">
        <div class="title-top">
            选择用户
            <i class="iconfont icon-guanbi" title="关闭" @click="userListClose"></i>
        </div>
        <ul class="user-list">
            <li v-if="userlist.length==0"　class="nomenber">当前部门无用户</li>
            <li v-for="(item, index) in userlist" :class="{'selected': index == sltIndex}" @click="showStaffView(item, index)">{{item.aliasName || item.fullname}}</li>
        </ul>
    </div>
</template>
<script>
  export default {
    props:["userlist", "showStaffView", "sltIndex"],
    data () {
      return {

      }
    },
    methods:{
        userListClose(){
            this.$parent.userInfo.showUserList = false;
        }
    },
    watch:{
        'userlist'(val, oldVal){
            if(val){
                $('.user-list').scrollTop(0);
            }
        }
    }
  }
</script>