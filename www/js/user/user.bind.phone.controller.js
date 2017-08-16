/**
 * Created by frank on 2016/11/17.
 */
(function () {
    'use strict';

    angular
        .module('user.bind.phone.controller', [])
        .controller('UserBindPhoneCtrl', UserBindPhoneCtrl);

    UserBindPhoneCtrl.$inject = ['$scope','$yikeUtils','$state','localStorageService','$ionicModal','$ionicTabsDelegate','$ionicLoading'];
    /* @ngInject */
    function UserBindPhoneCtrl($scope,$yikeUtils,$state,localStorageService ,$ionicModal,$ionicTabsDelegate,$ionicLoading){
        var user=localStorageService.get('user');
        $scope.user={
            phone:'',
            code:'',
            msg:''
        };
        $scope.register=register;
        $scope.sendMsg=sendMsg;
        init();
        function init() {}
        //表单验证
        function formValidation() {
            if($scope.user.phone == '' || $scope.user.phone == null){
                $yikeUtils.toast('请先输入手机号');
                return false;
            }else if($scope.user.code == '' || $scope.user.code == null){
                $yikeUtils.toast('请先输入验证码');
                return false;
            }else if($scope.user.phone != $scope.user.msg.phone){
                $yikeUtils.toast('请输入正确的验证码');
                return false;
            }else if($scope.user.code != $scope.user.msg.code){
                $yikeUtils.toast('请输入正确的验证码');
                return false;
            }else{
                return true;
            }
        }
        //发送短信验证码
        function sendMsg() {
            if($scope.user.phone == '' || $scope.user.phone==null){
                $yikeUtils.toast('请先输入手机号');
                return false;
            }
            yikeTaishan.sendMsg($scope.user.phone,$scope.user.op)
                .then(function (data) {
                    $yikeUtils.toast(data.result.result);
                    if(data.status == 1){
                        $scope.user.msg=data.result.msg;
                        var sendMsg=document.body.querySelector('#send-msg');
                        settime(sendMsg);
                    }
                });
        }
        var countdown=60;
        //倒计时
        function settime(obj) {
            if (countdown == 0) {
                obj.removeAttribute("disabled");
                obj.innerHTML="获取验证码";
                countdown = 60;
                return;
            } else {
                obj.setAttribute("disabled", true);
                obj.innerHTML="重新发送(" + countdown + ")";
                countdown--;
            }
            setTimeout(function() {
                    settime(obj) }
                ,1000)
        }
        //绑定手机号
        function register() {
            var suc=formValidation();
            if(suc){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
                yikeTaishan.bindPhone($scope.user.phone,user.token)
                    .then(function (data) {
                        $yikeUtils.toast(data.result.result);
                        if( data.status ==1 ){
                            user.phone=$scope.user.phone;
                            $state.go('tab.account');
                        }
                    })
            }
        }
    }
})();