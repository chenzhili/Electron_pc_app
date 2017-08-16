/**
 * Created by frank on 2016/11/17.
 */
(function () {
    'use strict';

    angular
        .module('user.linked.phone.controller', [])
        .controller('UserLinkedPhoneCtrl', UserLinkedPhoneCtrl);

    UserLinkedPhoneCtrl.$inject = ['$scope','$yikeUtils','$state','localStorageService','$ionicModal','$ionicTabsDelegate','$ionicLoading'];
    /* @ngInject */
    function UserLinkedPhoneCtrl($scope,$yikeUtils,$state,localStorageService ,$ionicModal,$ionicTabsDelegate,$ionicLoading){
        $scope.user=localStorageService.get('user');
        init();
        function init() {}
    }
})();
