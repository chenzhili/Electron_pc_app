/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('lottery.controller', [])
        .controller('LotteryCtrl', LotteryCtrl);

    LotteryCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function LotteryCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.refresh=refresh;
        $scope.loadMore=loadMore;
        $scope.screen=screen;
        var page=1;
        $scope.lotteryList=[];
        $scope.op='ssc';
        var user=localStorageService.get('user');
        init();
        function init() {
            $ionicTabsDelegate.showBar(true);//隐藏开奖走势导航栏
        }
        //下拉刷新
        function refresh() {
          page=1;
          lottery();
        }
        //上拉加载
        function loadMore() {
          lottery();
            /*yikeTaishan.expire(user.id,user.token)
                .then(function (data) {
                    if(data.status == 1){
                        lottery();
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
                            localStorageService.remove('user');
                            $state.go('login')
                        });
                    }
                })*/
        }
        function lottery() {
            yikeTaishan.lottery($scope.op,page)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status== 1 && data.result.total > 0){
                        for(var i=0;i<data.result.list.length;i++){
                            data.result.list[i].time=moment.unix(Number(data.result.list[i].time)).format("YYYY.MM.DD HH:mm");
                        }
                        if(page == 1){
                            $scope.lotteryList=data.result.list;
                        }else{
                            $scope.lotteryList=$scope.lotteryList.concat(data.result.list);
                        }
                    }else{
                        $scope.lotteryList=[];
                    };
                    $scope.noMoreItemsAvailable = $scope.lotteryList.length >= Number(data.result.total);
                    $scope.$digest();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    page++;
                });
        }
        //分类筛选
        function screen() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
          page=1;
          loadMore();
        }
    }
})();
