/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('platform.program.details.controller', [])
        .controller('PlatformProgramDetailsCtrl', PlatformProgramDetailsCtrl);
    PlatformProgramDetailsCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function PlatformProgramDetailsCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.user=localStorageService.get('user');
        var id=$state.params.id;
        $scope.data = {
            time: '00:00'
        };
        $scope.playStatus=0;
        $scope.type=$state.params.type;
        $scope.isShow=false;
        $scope.collect=collect;
        $scope.copy=copy;
        var sscsh;
        var pksh;
        var status=0;
        $scope.$on('$ionicView.afterLeave', function() {
            clearInterval(sscsh);
            clearInterval(pksh);
        });
        init();
        function init() {
            lottery();
            document.addEventListener("webkitvisibilitychange", onVisibilityChanged, false);
            //获取客服微信,qq
            yikeTaishan.personalCenter('platform','')
                .then(function (data) {
                    if(data.status == 1){
                        $scope.message=data.result;
                        $scope.$digest();
                    }
                });
        }
        function onVisibilityChanged() {
            lottery();
        }
        function details() {
            if(status == 0){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
            }
            status=1;
            if($scope.type == 1){
              schemeDetails();
            }else {
              pkDetails();
            }
            /*yikeTaishan.expire($scope.user.id,$scope.user.token)
                .then(function (data) {
                    if(data.status == 1){
                        if($scope.type == 1){
                            schemeDetails();
                        }else {
                            pkDetails();
                        }
                    }else{
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: data.result.result,
                            buttons:[{
                                text:'确定',
                                type: 'button-positive'
                            }]
                        });
                        alertPopup.then(function() {
                            $ionicLoading.hide();
                            localStorageService.remove('user');
                            $state.go('login')
                        });
                    }
                });*/
        }
        //重庆时时彩方案详情
        function schemeDetails() {
            yikeTaishan.schemeDetails(id)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status ==1 ){
                        if(data.result.win2){
                            data.result.win2.create_time=moment.unix(Number(data.result.win2.create_time)).format("YYYY年MM月DD日 HH:mm:ss");
                        }
                        $scope.schemeDetails=data.result;
                        $scope.$digest();
                    }
                })
        }
        //pk10方案详情
        function pkDetails() {
            yikeTaishan.pkDetails(id)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status ==1 ){
                        if(data.result.win2){
                            data.result.win2.create_time=moment.unix(Number(data.result.win2.create_time)).format("YYYY年MM月DD日 HH:mm:ss");
                        }
                        $scope.schemeDetails=data.result;
                        $scope.$digest();
                    }
                })
        }
        //收藏方案
        function collect() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            yikeTaishan.collect('add',$scope.schemeDetails.plan.type,id,$scope.user.id)
              .then(function (data) {
                $ionicLoading.hide();
                $yikeUtils.toast(data.result.result);
                if(data.status == 1){
                  $scope.isShow=false;
                }
              });
            /*yikeTaishan.expire($scope.user.id,$scope.user.token)
                .then(function (data) {
                    if(data.status == 1){
                        yikeTaishan.collect('add',$scope.schemeDetails.plan.type,id,$scope.user.id)
                            .then(function (data) {
                                $ionicLoading.hide();
                                $yikeUtils.toast(data.result.result);
                                if(data.status == 1){
                                    $scope.isShow=false;
                                }
                            })
                    }else{
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: data.result.result,
                            buttons:[{
                                text:'确定',
                                type: 'button-positive'
                            }]
                        });
                        alertPopup.then(function() {
                            $ionicLoading.hide();
                            localStorageService.remove('user');
                            $state.go('login')
                        });
                    }
                })*/
        }
        // 复制
        function copy() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            $ionicLoading.hide();
            $scope.isShow=false;
            cordova.plugins.clipboard.copy($scope.schemeDetails.win3);
            $yikeUtils.toast('复制成功');
            /*yikeTaishan.expire($scope.user.id,$scope.user.token )
                .then(function (data) {
                    if(data.status == 1){
                        $ionicLoading.hide();
                        $scope.isShow=false;
                        cordova.plugins.clipboard.copy($scope.schemeDetails.win3);
                        $yikeUtils.toast('复制成功');
                    }else{
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: data.result.result,
                            buttons:[{
                                text:'确定',
                                type: 'button-positive'
                            }]
                        });
                        alertPopup.then(function() {
                            $ionicLoading.hide();
                            localStorageService.remove('user');
                            $state.go('login')
                        });
                    }
                })*/
        }
        // function callLottery() {
        //     yikeTaishan.expire($scope.user.id,$scope.user.token)
        //         .then(function (data) {
        //             if(data.status == 1){
        //                 lottery();
        //             }else{
        //                 var alertPopup = $ionicPopup.alert({
        //                     title: '提示',
        //                     template: data.result.result,
        //                     buttons:[{
        //                         text:'确定',
        //                         type: 'button-positive'
        //                     }]
        //                 });
        //                 alertPopup.then(function() {
        //                     localStorageService.remove('user');
        //                     $state.go('login');
        //                 });
        //             }
        //         })
        // }
        //首页历史开奖
        function lottery() {
            yikeTaishan.lottery('index','')
                .then(function (lottery) {
                    if(lottery.status == 1){
                        $scope.pk=lottery.result.pk10;
                        $scope.ssc=lottery.result.ssc;
                        $scope.pkTime = parseInt($scope.pk.difference_time);//倒计时总秒数量
                        $scope.sscTime = parseInt($scope.ssc.difference_time);//倒计时总秒数量
                        if($scope.type == 1){
                            if(moment().hour() >=2 && moment().hour() <10){
                                $scope.playStatus=2;
                            }else{
                                if($scope.sscTime > 0){
                                    $scope.playStatus=1;
                                }else{
                                    $scope.playStatus=0;
                                }
                            }
                            sscTimer($scope.sscTime);
                        }else{
                            if(moment().hour() >=0 && moment().hour() <=8){
                                $scope.playStatus=2;
                            }else{
                                if($scope.pkTime > 0){
                                    $scope.playStatus=1;
                                }else{
                                    $scope.playStatus=0;
                                }
                            }
                            pkTimer($scope.pkTime);
                        }
                        details();
                        $scope.$digest();
                    }
                })
        }
        //pk倒计时
        var pkt=5;
        function pkTimer(intDiff){
            clearInterval(pksh);
            pksh=setInterval(function(){
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
                    clearInterval(pksh);
                    if(intDiff == 0){
                        lottery();
                    }else{
                        pkt--;
                        if(pkt == 0){
                            lottery();
                            pkt=5;
                        }else {
                            pkTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.data.time = hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
        //时时彩倒计时
        var t=5;
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
                        t--;
                        if(t == 0){
                            lottery();
                            t=5;
                        }else {
                            sscTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.data.time = hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
    }
})();
