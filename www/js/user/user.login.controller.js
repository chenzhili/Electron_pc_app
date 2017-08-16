/**
 * Created by frank on 2016/9/6.
 */
(function () {
    'use strict';

    angular
        .module('user.login.controller', [])
        .controller('UserLoginCtrl', UserLoginCtrl);

    UserLoginCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','localStorageService','$ionicLoading','$rootScope'];
    /* @ngInject */
    function UserLoginCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,localStorageService,$ionicLoading){
        $scope.user={
            email:'',
            password:'',
            op:''
        };
        $scope.isOpen=window.isOpen;
        var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $scope.login=login;
        $scope.focus=focus;
        $scope.blur=blur;
        $scope.$on('$ionicView.beforeEnter', function() {
            if(localStorageService.get('user')){
                $state.go('tab.home')
            }
            if(localStorageService.get('account')){
                $scope.user={
                    email:localStorageService.get('account').email,
                    password:localStorageService.get('account').password
                };
            }
        });
        init();
        function init() {
            //是否显示充值等信息
            yikeTaishan.isShowRecharge()
                .then(function (data) {
                    $scope.isOpen=data.result.open;
                });
            //获取客服微信,qq
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
        //表单验证
        function formValidation() {
            if($scope.user.email == '' || $scope.user.email == null){
                $yikeUtils.toast('请先输入帐号');
                return false;
            }else if($scope.user.password == '' || $scope.user.password == null){
                $yikeUtils.toast('请先输入密码');
                return false;
            }else{
                return true;
            }
        }
        //登录
        function login() {
            var suc=formValidation();
            if(suc){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
                if(filter.test($scope.user.email)){
                    $scope.user.op='email';
                }else {
                    $scope.user.op='phone';
                }
                yikeTaishan.login($scope.user.email,$scope.user.password,$scope.user.op)
                    .then(function (data) {
                        $yikeUtils.toast(data.result.result);
                        console.log(data);
                        if(data.result.result == "登陆成功"){
                            localStorageService.set('user',data.result.user);
                            localStorageService.set('account',$scope.user);
                            $state.go('tab.home');
                        }
                    })

            }
        }
        //获取焦点隐藏other
        function focus() {
            document.getElementsByClassName('login_other')[0].classList.add('keyboard-hide');
        }
        //失去焦点显示other
        function blur(){
            document.getElementsByClassName('login_other')[0].classList.remove('keyboard-hide');
        }
    }
})();
