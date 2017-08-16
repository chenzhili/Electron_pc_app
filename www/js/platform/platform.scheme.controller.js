/**
 * Created by frank on 2016/9/7.
 */
(function () {
    'use strict';

    angular
        .module('platform.scheme.controller', [])
        .controller('PlatformSchemeCtrl', PlatformSchemeCtrl);

    PlatformSchemeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function PlatformSchemeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.user=localStorageService.get('user');
        $scope.oneStar=[];
        $scope.twoStar=[];
        $scope.threeStar=[];
        $scope.fourStar=[];
        $scope.fiveStar=[];
        $scope.status={
            status:1,
            oneStar:true,
            twoStar:false,
            threeStar:false,
            fourStar:false,
            fiveStar:false,
            playingMethod:$state.params.playType
        };
        $scope.selectStar=selectStar;
        $scope.playingMethod=playingMethod;
        init();
        function init() {
            playingMethod();
        }
        //重庆时时彩方案列表
        function sscList() {
            yikeTaishan.sscScheme()
                .then(function (data) {
                  console.log(data);
                    $ionicLoading.hide();
                    if(data.status == 1){
                        for(var i=0;i < data.result.plan.length;i++){
                            if(data.result.plan[i].address == 1){
                                $scope.oneStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 2){
                                $scope.twoStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 3){
                                $scope.threeStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 4){
                                $scope.fourStar.push(data.result.plan[i]);
                            }else{
                                $scope.fiveStar.push(data.result.plan[i]);
                            }
                        }
                        $scope.$digest();
                    }
                })
        }
        //玩法
        function playingMethod() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
          $scope.oneStar=[];
          $scope.twoStar=[];
          $scope.threeStar=[];
          $scope.fourStar=[];
          $scope.fiveStar=[];
          if($scope.status.playingMethod == 'ssc'){
            sscList();
          }
        }
        //选择星级
        function selectStar(status) {
            $scope.status.status=status;
            if($scope.status.status == 1){
                $scope.status.oneStar=true;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 2){
                $scope.status.oneStar=false;
                $scope.status.twoStar=true;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 3){
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=true;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 4){
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=true;
                $scope.status.fiveStar=false;
            }else{
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=true;
            }
        }
    }
})();
