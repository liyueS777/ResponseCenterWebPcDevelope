<!-- 公用提示组件 -->
<template>
    <div class="bgMask">
        <div class="popBox" style="display:none">
            <div class="popTip"><i class="iconfont icon-info"></i></div>
            <h2 :class="[{'long':leng}]">{{popmsg}}</h2>
            <div class="btnGroup">
                <button @click="closePop()" v-if="$store.state.poptype==null">确认</button>
                <button @click="reconet" v-else>重新连接</button>
            </div>
        </div>
    </div>
</template>
<script>
  export default {
    props:["popmsg"],
    data () {
      return {
      }
    },
    computed:{
        leng(){
            if(this.popmsg.length>17){
                return true;
            }else{
                return false
            }
        }
    },
    methods:{
        reconet(){
            this.$store.state.remoteConnect.$webSocket.reconnect()
            this.$store.dispatch('modify',{'type':'isPop','val':false})
        },
        closePop(){
            this.$store.dispatch('modify',{'type':'isPop','val':false})
        }
    },
    mounted(){
        $(this.$el).find('.popBox').slideDown(200)
    },
    beforeDestroy(){
        this.$store.dispatch('modify',{'type':'poptype','val':null})
    }
  }
</script>
<style lang="less" scoped>
.popBox{
    width: 320px;
    height: 260px;
    background: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    margin-left: -160px;
    top: 50%;
    margin-top: -130px;
    max-width: 100%;
    h2.long{
        line-height:35px;
        padding:0 5px;
    }
}
.popTip{
    height:100px;
    display:flex;
    align-items: center;
    justify-content: center;
    color:#F8BB86;
    margin-top:25px;
    
    .iconfont{
        font-size:75px;
    }
}
h2{
    line-height:60px;
    font-size:20px;
}
.btnGroup{
    text-align:center;
    padding-top:15px;
    button{
        width: 69px;
        background-color: #3b72a9;
        border: 0;
        border-radius: 5px;
        line-height: 28px;
        height: 25px;
        color: #fff;
        cursor:pointer;
        &:hover{
            background-color: #4d94da;
        }
    }
}
</style>