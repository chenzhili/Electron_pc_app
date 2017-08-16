/**
 * Created by frank on 2016/9/9.
 */
(function () {
    'use strict';

    angular
        .module('user.recharge.controller', [])
        .controller('UserRechargeCtrl', UserRechargeCtrl);

    UserRechargeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','localStorageService','$ionicLoading'];
    /* @ngInject */
    function UserRechargeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,localStorageService,$ionicLoading){
        var user=localStorageService.get('user');
        var token='';
        $scope.user={
            phone:'',
            password:''
        };
        $scope.recharge=recharge;
        $scope.focus=focus;
        $scope.blur=blur;
        init();
        function init() {
            if(user){
                token=user.token;
            }
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
            if($scope.user.phone == '' || $scope.user.phone == null){
                $yikeUtils.toast('请先输入手机号');
                return false;
            }else if($scope.user.password == '' || $scope.user.password == null){
                $yikeUtils.toast('请先输入卡密');
                return false;
            }else{
                return true;
            }
        }
        //充值
        function recharge() {
            var suc=formValidation();
            if(suc){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
                yikeTaishan.recharge($scope.user.phone,$scope.user.password,token)
                    .then(function (data) {
                        $yikeUtils.toast(data.result.result);
                        if( data.status ==1){
                            $state.go('login');
                        }
                    })
            }
        }
        //获取焦点隐藏other
        function focus() {
            document.getElementsByClassName('other')[0].classList.add('keyboard-hide');
        }
        //失去焦点显示other
        function blur(){
            document.getElementsByClassName('other')[0].classList.remove('keyboard-hide');
        }
    }
})();