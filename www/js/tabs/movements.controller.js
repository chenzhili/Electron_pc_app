/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('movements.controller', [])
        .controller('MovementsCtrl', MovementsCtrl);

    MovementsCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','$timeout','localStorageService','$ionicLoading','$ionicScrollDelegate','$ionicPopup'];
    /* @ngInject */
    function MovementsCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,$timeout,localStorageService,$ionicLoading,$ionicScrollDelegate,$ionicPopup){
        var user=localStorageService.get('user');
        $scope.num='30';
        $scope.movements={
            num:'30',
            op:'ssc',
            ob:'one',
            digit:'个位走势'
        };
        $scope.sscScreen=[{ob:'one',content:'个位走势'},{ob:'ten',content:'十位走势'},{ob:'hundred',content:'百位走势'},{ob:'thousand',content:'千位走势'},
            {ob:'ten_thousand',content:'万位走势'}];
        $scope.movementsNum=[0,1,2,3,4,5,6,7,8,9];
        $scope.digitMovements=digitMovements;
        $scope.periods=periods;
        init();
        function init() {

            $ionicTabsDelegate.showBar(false);//隐藏开奖走势导航栏
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            movements();
        }

        //走势数据
        function movements() {
            yikeTaishan.movements($scope.movements.op,$scope.movements.ob,Number($scope.movements.num))
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status == 1){
                        $scope.datas=data.result.list;
                        $scope.analysis=data.result.analysis;
                        $timeout(function() {
                            pageLoad();
                        });
                        $scope.$digest();
                    }
                })
        }
        //位数走势
        function digitMovements(ob,content) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            $scope.movements.ob=ob;
            $scope.movements.digit=content;
            movements();
        }
        //期数筛选
        function periods() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            movements();
        }

        //走势线条
        function pageLoad(){
            var span=document.getElementsByClassName('span-active');
            var ul=document.getElementById('ul');
            var container=document.getElementById('container');
            var mycanvas=document.getElementById('mycanvas');
            mycanvas.style.display='none';
            mycanvas.style.display='block';
            mycanvas.width=container.offsetWidth;
            mycanvas.height=container.offsetHeight-88;
            var cans=mycanvas.getContext('2d');
                var u = navigator.userAgent;
                var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
                // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+token OS X/); //ios终端
            if(isAndroid){
                for(var i=0;i<span.length;i++){
                    var x=span[i].getBoundingClientRect().left+document.documentElement.scrollLeft+9;
                    var y=span[i].getBoundingClientRect().top+document.documentElement.scrollTop+$ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top-123;
                    if(i == 0){
                        cans.moveTo(x,y);
                    }else{
                        cans.lineTo(x,y);
                    }
                }
            }else{
                for(var i=0;i<span.length;i++){
                    var x=span[i].getBoundingClientRect().left+document.documentElement.scrollLeft+9;
                    var y=span[i].getBoundingClientRect().top+document.documentElement.scrollTop+$ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top-143;
                    if(i == 0){
                        cans.moveTo(x,y);
                    }else{
                        cans.lineTo(x,y);
                    }
                }
            }
            cans.lineWidth=1;
            cans.strokeStyle = '#E3B56E';
            cans.stroke();
            cans.save();
        }
    }
})();
