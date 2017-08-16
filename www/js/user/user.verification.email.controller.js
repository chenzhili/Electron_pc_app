/**
 * Created by frank on 2016/9/5.
 */
(function () {
    'use strict';

    angular
        .module('user.verification.email.controller', [])
        .controller('UserVerificationEmailCtrl', UserVerificationEmailCtrl);

    UserVerificationEmailCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','$ionicLoading'];
    /* @ngInject */
    function UserVerificationEmailCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,$ionicLoading){
        $scope.complete=complete;
        var uid=$state.params.uid;
        $scope.openEmailLink=openEmailLink;
        init();
        function init() {}
        //完成验证
        function complete() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            yikeTaishan.confirmEmail(uid)
                .then(function (data) {
                    if(data.status == 1){
                        $ionicLoading.hide();
                        $state.go('login');
                    }else{
                        $yikeUtils.toast(data.result.result);
                    }
                })
        }
        //跳自定义链接
        function openEmailLink() {
            window.open('http://ui.ptlogin2.qq.com/cgi-bin/login?style=9&appid=522005705&daid=4&s_url=https%3A%2F%2Fw.mail.qq.com%2Fcgi-bin%2Flogin%3Fvt%3Dpassport%26vm%3Dwsk%26delegate_url%3D%26f%3Dxhtml%26target%3D&hln_css=http%3A%2F%2Fmail.qq.com%2Fzh_CN%2Fhtmledition%2Fimages%2Flogo%2Fqqmail%2Fqqmail_logo_default_200h.png&low_login=1&hln_autologin=%E8%AE%B0%E4%BD%8F%E7%99%BB%E5%BD%95%E7%8A%B6%E6%80%81&pt_no_onekey=1','_system');
        }
    }
})();