/**
 * Created by john on 2016/8/31.
 */
(function () {
    'use strict';

    angular
        .module('program.details.controller', [])
        .controller('ProgramDetailsCtrl',ProgramDetailsCtrl);

    ProgramDetailsCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate'];
    /* @ngInject */
    function ProgramDetailsCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate) {

        init();
        function init() {
            $ionicTabsDelegate.showBar(true);//打开导航栏
        }

    }
})();