/**
 * Created by frank on 2016/8/31.
 */
(function () {
    'use strict';

    angular
        .module('home.controller', [])
        .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicSlideBoxDelegate','$ionicLoading','$sce','$ionicViewSwitcher'];
    /* @ngInject */
    function HomeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicSlideBoxDelegate,$ionicLoading,$sce,$ionicViewSwitcher){
        var sscsh;
        $scope.playStatus={
            sscStatus:0
        };
      yikeTaishan.getMessageTitle(1,"status")
        .then(function(res){
          console.log(res);
        });
        $scope.openLink=openLink;
        $scope.openBannerLink=openBannerLink;
        $scope.$on('$ionicView.afterLeave', function() {
            clearInterval(sscsh);
            /*clearInterval(pksh);*/
        });
        init();
        function init() {
            ipcRenderer.on("try_home",function(e,msg){
                console.log(e);
                console.log(msg);
            });
            ipcRenderer.send("try_home","ok");
            if(localStorageService.get('user')){
              $scope.user=localStorageService.get('user');
            }else{
              $ionicPopup.alert({
                title: '提示',
                template: '请先登录',
                buttons:[{
                  text:'确定',
                  type: 'button-positive'
                }]
              }).then(function(){
                $state.go("login");
                $ionicViewSwitcher.nextDirection('forward');
              });
              return;
            }
          $ionicTabsDelegate.showBar(true);//隐藏开奖走势导航栏
          banner();
          lottery();
          notice();
          note();
          document.addEventListener("visibilitychange", onVisibilityChanged, false);
        }
        //
        function onVisibilityChanged() {
            lottery();
        }
        $scope.noteContent = [];
        /*广播信息*/
        function note(){
          yikeTaishan.getMessageTitle(1,"status")
            .then(function(res){
              if(res.status == 1){
                $scope.noteContent = res.result.list;
                $scope.$digest();
                var noteSwiper = new Swiper(".container-note",{
                  autoplay:1500,
                  loop:true,
                  direction:"vertical"
                });
              }
            });
        }
        //banner
        function banner() {
            yikeTaishan.banner()
                .then(function (banner) {
                    if(banner.status == 1){
                        $scope.banners=banner.result.banner;
                        $scope.$digest();
                        var swiper = new Swiper('.swiper-container', {
                            pagination: '.swiper-pagination',
                            autoplay:2000,
                            paginationClickable: true,
                            observer: true,//修改swiper自己或子元素时，自动初始化swiper
                            observeParents: true//修改swiper的父元素时，自动初始化swiper
                        });
                    }
                });
        }
        //公告列表
        function notice() {
            yikeTaishan.notice()
                .then(function (data) {
                    if(data.status == 1){
                        var pattern1=/&lt;/gim;
                        var pattern2=/&gt;/gim;
                        var pattern3=/&quot;/gim;
                        for(var i=0;i<data.result.notice.length;i++){
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern1,'<');
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern2,'>');
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern3,'"');
                            data.result.notice[i].content =$sce.trustAsHtml(data.result.notice[i].content);
                        }
                        $scope.noticeList=data.result.notice;
                        $scope.$digest();
                        jQuery(".txtMarquee-left").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",vis:2,interTime:50});
                    }
                })
        }

        var clearInter = '';
        var interFun = function(){
          $(".ssc_number").animateNumber({number:9});
        };
        //首页历史开奖
        function lottery() {
            yikeTaishan.lottery('index','')
                .then(function (lottery) {
                    if(lottery.status == 1){
                        /*$scope.pk=lottery.result.pk10;*/
                        $scope.ssc=lottery.result.ssc;
                        /*$scope.pkTime = parseInt($scope.pk.difference_time);//倒计时总秒数量*/
                        $scope.sscTime = parseInt($scope.ssc.difference_time);
                        if(moment().hour() >=2 && moment().hour() <10){
                            clearInterval(interFun);
                            $scope.playStatus.sscStatus=2;
                        }else{
                            if($scope.sscTime > 0){
                                clearInterval(interFun);
                                $scope.playStatus.sscStatus=1;
                            }else{
                                clearInterval(interFun);
                                $scope.playStatus.sscStatus=0;
                                $scope.$apply(function () {
                                  clearInter=setInterval(interFun,100);
                                });
                            }
                        }
                        sscTimer($scope.sscTime);
                        /*pkTimer($scope.pkTime);*/
                        $scope.$digest();
                    }
                })
        }
        //时时彩倒计时
        var ssct=5;
        function sscTimer(intDiff){
            clearInterval(sscsh);
            sscsh=setInterval(function(){
                var day=0,
                    hour=0,
                    minute=0,
                    second=0;//时间默认值
                if(intDiff > 0){
                    day = Math.floor(intDiff / (60 * 60 * 24));
                    hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
                    minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
                    second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
                }else{
                    clearInterval(sscsh);
                    if(intDiff == 0){
                        lottery();
                    }else{
                        ssct--;
                        if(ssct == 0){
                            lottery();
                            ssct=5;
                        }else {
                            sscTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.ssctime=hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
        //跳自定义链接
        function openBannerLink(link) {
            window.open(link,'_system');
        }
        //跳转官方网站
        function openLink() {
            window.open('http://036767.com/','_blank');
        }
    }
})();
