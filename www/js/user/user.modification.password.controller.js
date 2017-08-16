/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('user.modification.password.controller', [])
        .controller('UserModificationPasswordCtrl', UserModificationPasswordCtrl);

    UserModificationPasswordCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','localStorageService','$ionicLoading'];
    /* @ngInject */
    function UserModificationPasswordCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,localStorageService,$ionicLoading){
        var user=localStorageService.get('user');
        $scope.user={
            oldPassword:'',
            newPassword:'',
            password:''
        };
        $scope.modification=modification;
        $scope.focus=focus;
        $scope.blur=blur;
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
            if($scope.user.oldPassword == ''){
                $yikeUtils.toast('请先输入旧密码');
                return false;
            }else if($scope.user.oldPassword.length < 6){
                $yikeUtils.toast('密码长度至少6位');
                return false;
            }else if($scope.user.newPassword == ''){
                $yikeUtils.toast('请先输入新密码');
                return false;
            }else if($scope.user.newPassword.length < 6){
                $yikeUtils.toast('密码长度至少6位');
                return false;
            }else if($scope.user.password == ''){
                $yikeUtils.toast('请再次输入密码');
                return false;
            }else if($scope.user.password != $scope.user.newPassword){
                $yikeUtils.toast('两次密码不一致');
                return false;
            }else{
                return true;
            }
        }
        //修改密码
        function modification() {
            var suc=formValidation();
            if(suc){
              $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
              });
                /*yikeTaishan.expire(user.id,user.token)
                    .then(function (data) {
                        if(data.status == 1){
                            $ionicLoading.show({
                                template: '<ion-spinner icon="bubbles"></ion-spinner>'
                            });
                            yikeTaishan.modificationPassword('modify','',$scope.user.newPassword,$scope.user.oldPassword,user.token)
                                .then(function (data) {
                                    $yikeUtils.toast(data.result.result);
                                    if(data.status == 1){
                                        localStorageService.remove('user');
                                        $state.go('login');
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
                    });*/

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
