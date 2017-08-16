/**
 * Created by john on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('account.controller', [])
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','localStorageService','$ionicPopup','$cordovaImagePicker'];
    /* @ngInject */
    function AccountCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,localStorageService,$ionicPopup,$cordovaImagePicker){
        $scope.user= {
          image:null,
          phone:null
        };
        if(localStorageService.get('user')){
          $scope.user=localStorageService.get('user');
        }
        $scope.images=$scope.user.image;
        $scope.loginout=loginout;
        $scope.pickImage=pickImage;
        $scope.goBindPhone=goBindPhone;
        var userTime;
        $scope.$on('$ionicView.afterLeave', function() {
            clearInterval(userTime);
        });
        init();
        function init() {
            $ionicTabsDelegate.showBar(true);//打开导航栏
            //是否显示充值等信息
            yikeTaishan.isShowRecharge()
                .then(function (data) {
                    $scope.isOpen=data.result.open;
                });
            getMessage();
        }


        //获取客服微信,qq
        function getMessage() {
            yikeTaishan.personalCenter('platform','')
                .then(function (data) {
                    if(data.status == 1){
                        $scope.message=data.result;
                        $scope.$digest();
                    }
                })
        }
        //联系客服
        $ionicModal.fromTemplateUrl('templates/modal/service.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.service= modal;
        });
        $scope.openModal = function() {
            $scope.service.show();
        };
        $scope.closeModal = function() {
            $scope.service.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.service.remove();
        });
        //用户账户到期倒计时
        /*function sscTimer(intDiff){
            clearInterval(userTime);
            userTime=setInterval(function(){
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
                    clearInterval(userTime);
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '您的会员时间已到期',
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
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.datatime=day + '天' + hour + '时' + minute + '分' + second + '秒';
                $scope.$digest();
                intDiff--;
            }, 1000);
        }*/
        //退出登录
        function loginout() {
          var comfirmPopup = $ionicPopup.confirm({
            title: '退出登录',
            template: '确认要退出登录？',
            okText: '确定',
            cancelText: '取消'
          });
          comfirmPopup.then(function (res) {
            if (res) {
              yikeTaishan.logout($scope.user.id)
                .then(function (data) {
                  $yikeUtils.toast(data.result.result);
                  if(data.status == 1){
                    localStorageService.remove('user');
                    $state.go('login');
                  }
                })
            }
          });
        }
        //跳转绑定手机页面
        function goBindPhone() {
            if($scope.user.phone == ''){
                $state.go('bind-phone');
            }else{
                $state.go('linked-phone');
            }
        }
        //上传头像
        function pickImage() {
          var options = {
            maximumImagesCount: 1,
            width: 200,
            height: 200,
            quality: 80
          };
          $cordovaImagePicker.getPictures(options)
            .then(function (results) {
              if(results.length > 0){
                $scope.images = results[0];
                var fileURL = $scope.images;
                var url = encodeURI("http://14.29.54.33:8080/app/index.php?i=2&c=entry&m=yike_ts_plan&do=image_upload");
                var option = new FileUploadOptions();
                option.fileKey = "imgs";
                option.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                option.mimeType = "image/jpeg";
                var params = {};
                params.uid = $scope.user.id;
                option.params = params;
                var ft = new FileTransfer();
                ft.upload(fileURL, url, onSuccess, onError, option);
              }
            }, function (error) {
              $yikeUtils.toast('上传失败')
            });
        }
        function onSuccess(r) {
            var data=JSON.parse(r.response);
            $scope.user.image=data.result.image;
            localStorageService.set('user',$scope.user);
            $yikeUtils.toast('上传成功');
        }
        //图片上传失败回调
        function onError(error) {
            $yikeUtils.toast("错误发生了，请重试 = " + error.code);
            // console.log("upload error source " + error.source);
            // console.log("upload error target " + error.target);
        }
    }
})();
