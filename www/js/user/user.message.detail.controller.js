/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('user.message.detail.controller', [])
        .controller('UserMessageDetailCtrl', UserMessageDetailCtrl);

  UserMessageDetailCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','localStorageService','$ionicLoading','$sce'];
    /* @ngInject */
    function UserMessageDetailCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,localStorageService,$ionicLoading,$sce){
      var id=$state.params.id;
      init();
      $scope.content = {
        content:"",
        title:"",
        time:"",
        writer:""
      };
      function init(){
        yikeTaishan.getMessageDetail(id)
          .then(function(res){
            var pattern1=/&lt;/gim;
            var pattern2=/&gt;/gim;
            var pattern3=/&quot;/gim;
            res.result.update.content=res.result.update.content.replace(pattern1,'<');
            res.result.update.content=res.result.update.content.replace(pattern2,'>');
            res.result.update.content=res.result.update.content.replace(pattern3,'"');
            res.result.update.content =$sce.trustAsHtml(res.result.update.content);
            $scope.content.content = res.result.update.content;
            $scope.content.time = moment.unix(Number(res.result.update.time)).format("YYYY.MM.DD HH:mm");
            $scope.content.title = res.result.update.title;
            $scope.content.writer = res.result.update.writer;
            $scope.$digest();
          });
      }
    }
})();
