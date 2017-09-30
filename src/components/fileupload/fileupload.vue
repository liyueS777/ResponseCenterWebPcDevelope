<template>
<div class="bgMask" >
    <div class="fileupbox">
        <ul>
        <li class="title">上传文件？</li>
        <li class="name spe">{{files.name}}</li>
        <li class="name spe">{{filesize}}KB</li>
        <li v-if="preimg!=null" class="img-pre"><img :src="preimg"/></li>
        <li><input type='text' class="input-box" v-model="filename" ref="input1"/></li>
        <li class='tip'>上传文件大小不可超过60MB</li>
        <li><button class="opt-btn" @click="cancel">取消</button><button class="opt-btn" @click="send">发送</button></li>
        </ul>
    </div>
</div>
</template>
<script>
export default {
    props:["files"],
    data () {
      return {
          filename:'',
          preimg:null
      }
    },
    computed:{
        filesize(){
            return (this.files.size/1024).toFixed(2)
        }
    },
    methods:{
        cancel(){
            this.$parent.curfile = null
        },
        send(){
            var curName= this.$refs.input1.value,filetype;
            var formdata = new FormData();
            formdata.append('file',this.files,curName);
            var regx = /image///w+/;
            if(regx.test(this.files.type)){
                filetype = 1;
            }else{
                filetype = 2;
            }
            this.$http.post(this.$store.state.HOST + '/FileUpload/uploadCustomFile',formdata).then((res)=>{
                let url = res.body.data;
                let link = this.$store.state.HOST+'/FileUpload/download?realFileName='+res.body.data+'&newFileName='+this.files.name;
                let curUser = this.$store.state.remoteConnect,curParent = this.$parent
                let msg = {
                    "compId":this.$store.state.compId,
                    "context":curName,
                    "deptId":curParent.userselect+curUser.selfId,
                    "fromName":curUser.username,
                    "fromUserId":curUser.selfId,
                    "imageUrl":curUser.avatarurl,
                    "toName":curParent.customlist[curParent.userselect].name,
                    "toUserId":curParent.userselect,
                    "msgType":filetype,
                    "fileUrl":url
                }
                this.$store.state.cusWS.send(-1,msg,'customService',-1)
                msg.createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                this.$parent.customlist[this.$parent.userselect].news = false;
                this.$parent.customlistnews[this.$parent.userselect] = 0;
                this.$parent.getInfoLists.push(msg)
                this.$parent.scrollToBottom()
            })
            this.$parent.curfile = null
        }
    },
    created(){
        this.filename = this.files.name
        let that = this;
        var regx = /image///w+/;
        if(regx.test(this.files.type)){ 
            var reader = new FileReader(); 
            reader.readAsDataURL(this.files);
            reader.onload =function(e){
                that.preimg=this.result;
            }
        } 
    },
    destroyed(){
        $(this.$parent.$refs.getfile).parent()[0].reset()
    }
}
</script>
<style scoped lang='less'>
.fileupbox{
    position: absolute;
    border: 1px solid #ddd;
    padding: 21px;
    text-align: center;
    border-radius: 4px;
    width: 300px;
    box-sizing: border-box;
    left: 50%;
    margin-left: -150px;
    top:15%;
    background:#fff;
    z-index:1000005;
    li{
        line-height:40px;
        &.title{
            font-size:22px;
        }
        &.name{
            font-size: 14px;
            margin-top: 15px;
            color: #6b6b6b;
        }
        &.spe{
            line-height:20px;
            margin-top:0;
        }
        .input-box{
            border: 1px solid #cecece;
            height: 30px;
            line-height: 25px;
            border-radius: 3px;
            box-shadow: 0px 1px 3px #ddd inset;
            padding: 0 10px;
        }
        &.tip{
            font-size:14px;
        }
        .opt-btn{
            &:first-child{
                background:#b7b7b7;
                margin-right:10px;
            }
            padding:5px 15px;
            border-radius:3px;
            background:#19bfff;
            color:#fff;
            cursor:pointer;
            opacity:0.8;
            &:hover{
                opacity:1;
            }
        }
        &.img-pre{
            height:100px;
            overflow:hidden;
            img{
                width:100%;height:100%;
            }
        }
    }
}
</style>