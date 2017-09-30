<!-- 公用图片放大组件 -->
<template>
    <div class="bgMask">
        <div class="popBox">
            <a title="关闭" class="close-btn iconfont icon-guanbi" @click="closePop"></a>
            <div class="flex-box">
                <img :src="imgUrl"/>
            </div>
            <div class="btn-group"><a :href="imgUrl" title="下载" @click="download($event)"><i class="iconfont icon-xiazai"></i></a></div>
        </div>
    </div>
</template>

<script>
  export default {
    props:["imgUrl"],
    data () {
      return {
      }
    },
    methods:{
        closePop(){
            this.$parent.imgLarge = false;
        },
        download(e){
            //手机端下载附件方法
            if(this.$store.state.isMobile){
                e.preventDefault();
                cordova.exec((()=>{

                }),((e)=>{

                }), 'OpenUrlPlugin', 'sendUrl', ['','', this.imgUrl])
            }
        }
    }
  }
</script>
<style lang="less" scoped>
.popBox{
    width: 800px;
    background: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top:0;
    height:100%;
    padding:10px;
    margin-left: -50%;
    box-sizing: border-box;
    max-width: 100%;
    max-height: 100%;
    .close-btn{
        cursor: pointer;
        position: absolute;
        top: 3px;
        right: 5px;
        z-index: 222;
        font-size: 30px;
        color: #000;
        border-radius: 100px;
    }
    .btn-group{
        position: absolute;
        bottom: 0;
        background: #13171b;
        width: 126px;
        border-radius: 3px;
        left:50%;
        margin-left:-63px;
        height: 38px;
        line-height: 36px;
        a{
            color:#fff;
        }
    }
    .iconfont{
        font-size:20px;
        &.icon-guanbi{
            font-size: 24px;
            line-height: 25px;
        }
    }
}

.flex-box{
    width:100%;
    height:100%;
    box-sizing:border-box;
    display:flex;
    overflow: auto;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #eee;
    border: 1px solid #ddd;
    position:relative;
    img{
        width:100%;
    }
}
@media (min-width:700px){
    .popBox{
        margin-left: -400px;
        height: 500px;
        top: 50%;
        margin-top: -250px;
        padding:25px;
        .close-btn{
            top: -16px;
            right: -13px;
            background: #13171b;
            color: white;
        }
        
    }
    .flex-box .btn-group{
        height: 30px;
        line-height: 30px;
    }
}
</style>