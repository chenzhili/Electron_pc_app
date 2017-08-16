/**
 * Created by frank on 2016/9/5.
 */
(function () {
    'use strict';

    angular
        .module('user.register.controller', [])
        .controller('UserRegisterCtrl', UserRegisterCtrl);

    UserRegisterCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','$ionicLoading'];
    /* @ngInject */
    function UserRegisterCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,$ionicLoading){
        $scope.user={
            phone:'',
            qq:'',
            name:'',
            password:'',
            passwordTwo:'',
            op:'register',
            msg:'',
            code:''
        };
        $scope.register=register;
        $scope.sendMsg=sendMsg;
        $scope.focus=focus;
        $scope.blur=blur;
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
            }else if($scope.user.password == '' || $scope.user.password==null){
                $yikeUtils.toast('请先输入密码');
                return false;
            }else if($scope.user.password.length < 6){
                $yikeUtils.toast('密码长度至少6位');
                return false;
            }else if($scope.user.passwordTwo == '' || $scope.user.passwordTwo == null){
                $yikeUtils.toast('请再次输入密码');
                return false;
            }else if($scope.user.passwordTwo != $scope.user.password ){
                $yikeUtils.toast('两次密码不一致');
                return false;
            }else if($scope.user.phone != $scope.user.msg.phone){
                $yikeUtils.toast('请输入正确的验证码');
                return false;
            }else if($scope.user.code != $scope.user.msg.code){
                $yikeUtils.toast('请输入正确的验证码');
                return false;
            }else if(!$scope.user.qq){
              $yikeUtils.toast('请输入QQ号码');
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
        //注册
        function register() {
            var suc=formValidation();
            if(suc){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
                yikeTaishan.register($scope.user.phone,'',$scope.user.qq,$scope.user.name,$scope.user.password,$scope.user.op)
                    .then(function (data) {
                        $yikeUtils.toast(data.result.result);
                        if( data.status ==1 ){
                            $state.go('login');
                        }
                    })
            }
        }
        //获取焦点隐藏other
        function focus() {
            document.getElementsByClassName('register_other')[0].classList.add('keyboard-hide');
        }
        //失去焦点显示other
        function blur(){
            document.getElementsByClassName('register_other')[0].classList.remove('keyboard-hide');
        }
    }
})();
