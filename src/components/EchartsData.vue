<!--调用图表数据组件-->
<template>
    <div :class="['echartsDiv',{'def-echartsDiv': isPre==1,'all-screen':isscreen}]" ref="screenObj">
        <i class="iconfont icon-guanbi echartsClose" title="关闭" @click="echartsClose"></i>
        <a class="echartsScreen"><i :class="['iconfont',!isscreen?'icon-quanping1':'icon-suoxiao']" :title="[!isscreen?'全屏':'退出全屏']" @click="Screen"></i></a>
        <div class="echartsBox">
            <iframe :src="iframeSrc" v-if="showIframe"></iframe>
            <div class="flex-box">
                <img v-if="showImg" :src="iframeSrc"/>
            </div>
        </div>
    </div>
</template>
<script>
  import echarts from 'echarts'
  export default {
    props:["echartdata","echarttype"],
    data () {
      return {
        isPre:0,
        showIframe:false,
        isscreen:false,
        showImg:false
      }
    },
    methods:{
      PCscreen(bool){
        let body = document.body
        if(!!bool){
            if (body.requestFullscreen) {  
                body.requestFullscreen();  
            } else if (body.mozRequestFullScreen) {  
                body.mozRequestFullScreen();  
            } else if (body.webkitRequestFullScreen) {  
               body.webkitRequestFullScreen();  
            } else if (body.msRequestFullscreen) {
                body.msRequestFullscreen();
            }
        }else{
            if (document.exitFullscreen){  
                document.exitFullscreen();  
            }else if (document.mozCancelFullScreen) {  
                document.mozCancelFullScreen();  
            }else if (document.webkitCancelFullScreen) {  
                document.webkitCancelFullScreen();  
            }else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
      },
      Screen(){
        this.isscreen = !this.isscreen;
        //if(this.$store.state.isMobile==false) this.PCscreen(this.isscreen)
        if(!!this.chart){
            setTimeout(()=>{
                this.chart.resize()
            },0)
        }
        
      },
      echartsClose(){
        this.$parent.showEcharts = false
      },
      showChat(obj){
            //数据图表展示
            let that = this;
            that.showEcharts = true
            var chartParam = {
              "chartId": obj.chart && obj.chart.id || this.$store.PcompId || this.$store.compId,
              "compId": obj.chart && obj.chart.compId || this.$store.PcompId || this.$store.compId
            }
            that.isPre = obj.chart.isPre
            if(!that.isPre){
                var topInit = that.$store.state.isMobile ? 12 : 22
                that.$http.post(this.$store.state.HOST+'/Chart/queryNewEstDataChart', chartParam).then(function(res){
                    if(res){
                        var chart = res.body.data.chart
                        var dataChart = res.body.data.dataChart
                        var chartType = chart.chartType
                        var option = {}
                        if(chartType == 1){ //折线图
                          option = {
                            legend: {
                                data:[chart.title],
                                top: topInit,
                                textStyle: {
                                    color: 'white',
                                    fontSize: 16
                                },
                            },
                            tooltip: {
                                trigger: 'axis',
                                formatter: "{b}: {c}"
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            textStyle: {
                                color: '#e6e6e6'
                            },
                            xAxis: {
                                type: 'category',
                                axisLabel: {
                                    formatter: '{value}'
                                },
                                data: JSON.parse(dataChart.nameData)
                            },
                            yAxis: {
                                type: 'value',
                                axisLine: {onZero: false},
                                axisLabel: {
                                    formatter: '{value}'
                                },
                                boundaryGap: false
                            },
                            series: [
                                {
                                    name: chart.title,
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: {
                                        normal: {
                                            width: 3,
                                            shadowColor: 'rgba(0,0,0,0.1)',
                                            shadowBlur: 10,
                                            shadowOffsetY: 10,
                                            color: 'white'
                                        }
                                    },
                                    data: JSON.parse(dataChart.valueData)
                                }
                            ]
                        };
                        }else if(chartType==2){ //柱状图
                            option = {
                                tooltip : {
                                    trigger: 'item',
                                    formatter: '金额: {c0}元'
                                },
                                legend: {
                                    textStyle:{ color:'#fff' },
                                    data:[chart.title],
                                    top:topInit
                                },
                                textStyle:{
                                    color: '#e6e6e6',
                                    fontSize: 16
                                },
                                itemStyle:{
                                    normal:{
                                        color: 'white'
                                    }
                                },
                                xAxis: {
                                    data: JSON.parse(dataChart.nameData)
                                },
                                yAxis: {},
                                series: [{
                                    name: [chart.title],
                                    type: 'bar',
                                    data: JSON.parse(dataChart.valueData)
                                }],
                                grid:{
                                    x:50,
                                    x2:20,
                                    y2:35,
                                }
                            };
                        }else if(chartType == 3){ //饼状图
                            let yPer = that.$store.state.isMobile ? '62%' : '60%'
                            option = {
                                tooltip : {
                                    trigger: 'item',
                                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                                },
                                color:['white','#ff9b12','#5bae16','#0a7faa'],
                                legend: {
                                    orient: 'vertical',
                                    textStyle:{ 
                                        color:'#fff', 
                                        fontSize: 16 
                                    },
                                    data: [chart.title],
                                    top: topInit
                                },
                                series : [
                                    {
                                        name: [chart.title],
                                        type: 'pie',
                                        radius : '55%',
                                        center: ['50%', yPer],
                                        data:JSON.parse(dataChart.valueData),
                                        itemStyle: {
                                            emphasis: {
                                                shadowBlur: 10,
                                                shadowOffsetX: 0,
                                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                                            }
                                        },
                                        label: {
                                            normal: {
                                                textStyle: {
                                                    color: '#e6e6e6'
                                                }
                                            }
                                        },
                                        labelLine: {
                                            normal: {
                                                lineStyle: {
                                                    color: 'rgba(255, 255, 255, 0.3)'
                                                },
                                                smooth: 0.2,
                                                length: 10,
                                                length2: 20
                                            }
                                        }
                                    }
                                ]
                            };
                            
                        }

                        var myChart = echarts.init($('.echartsBox')[0]);
                        myChart.setOption(option);
                        this.chart = myChart
                    }
                }, function(err){
                    
                });
            }else{
                var regx=/.(png|jpg|jpeg|gif|bmp)$/
                that.iframeSrc = obj.chart.chartUrl
                if(regx.test(obj.chart.chartUrl)==true){
                    that.showImg = true
                }else{
                    that.showIframe = true
                }
            }
        }
    },
    mounted(){
      if(this.echarttype == 'chart'){
        this.showChat(this.echartdata);
      }
    },
    // created(){
    //     if(this.$store.state.isMobile==false){
    //         document.addEventListener("fullscreenchange",() =>{  
    //             if(!document.fullscreen && this.isscreen==true){
    //                 this.Screen()
    //             }
    //         }, false);
    //         document.addEventListener("mozfullscreenchange", () =>{  
    //         if(!document.mozFullScreen && this.isscreen==true){
    //                 this.Screen()
    //             }
    //         }, false);
    //         document.addEventListener("webkitfullscreenchange", () =>{
    //             if(!document.webkitIsFullScreen && this.isscreen==true){
    //                 this.Screen()
    //             }
    //         }, false);
    //         document.addEventListener("msfullscreenchange",() =>{
    //             if(!document.msFullscreenElement && this.isscreen==true){
    //                 this.Screen()
    //             }
    //         }, false);
    //     }
    // },
    beforeDestroy(){
        // if(this.$store.state.isMobile==false){
        //     this.PCscreen(false)
        // }
    }
  }
</script>
<style lang="less" >
  @import '~assets/styles/echartData.less';
</style>
