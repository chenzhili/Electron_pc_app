// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'yike', 'tab.module','user.module','LocalStorageModule','ngCordova','platform.module'])

    .run(function ($ionicPlatform,$rootScope, $location,$yikeUtils,$state,$ionicHistory,$cordovaToast,$ionicPopup,$ionicLoading,$timeout,localStorageService) {
        //连接超时
        window.connectionTimeout = function () {
            $yikeUtils.toast('请求超时');
        };
        if (window.cordova && window.cordova.InAppBrowser) {
            window.open = window.cordova.InAppBrowser.open;
        }
            document.addEventListener("offline", onOffline, false);
            function onOffline() {
                $yikeUtils.toast('未连接网络');
            }
        //双击退出
        $ionicPlatform.registerBackButtonAction(function (e) {
            //判断处于哪个页面时双击退出
            var path = $location.path();
            if (path == '/tab/home' || path == '/tab/account' || path == '/tab/lottery' || path == '/login') {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.show('再按一次退出系统',1000,'bottom');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            }else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            }else{
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.show('再按一次退出系统',1000,'bottom');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
            e.preventDefault();
            return false;
        }, 101);

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
                //延迟splash screnn 隐藏时间,不然会有短暂的白屏出现
                setTimeout(function () {
                    navigator.splashscreen.hide();
                }, 1000);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            //启动极光推送服务
            try {
                if(window.plugins.jPushPlugin){
                    window.plugins.jPushPlugin.init();
                    window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                    window.plugins.jPushPlugin.setBadge(0);
                    document.addEventListener("jpush.openNotification", function (event) {

                      console.log(event);
                        var alertContent, url, params, id, target = {};
                        if (device.platform == "Android") {
                            alertContent = window.plugins.jPushPlugin.openNotification.alert;
                            var extras = window.plugins.jPushPlugin.openNotification.extras['cn.jpush.android.EXTRA'];
                            url = extras.url;
                            params = extras.params;
                            id = extras.id;
                        } else {
                            url = event.url;
                            params = event.params;
                            id = event.id;
                            window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                            window.plugins.jPushPlugin.setBadge(0);
                        }
                        target[params] = id;
                        $state.go(url, target);
                    }, false);
                    document.addEventListener("jpush.receiveNotification", function (event) {
                      console.log(event);
                        window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                        window.plugins.jPushPlugin.setBadge(0);
                    });
                }
            } catch (ex) {
                console.log(ex);
            }

        });

        /*检查热更新*/
        var appUpdate = {
          // Application Constructor
          initialize: function() {
            this.bindEvents();
          },
          // Bind any events that are required.
          // Usually you should subscribe on 'deviceready' event to know, when you can start calling cordova modules
          bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('chcp_updateLoadFailed', this.onUpdateLoadError, false);
          },
          // deviceready Event Handler
          onDeviceReady: function() {
          },
          onUpdateLoadError: function(eventData) {
            var error = eventData.detail.error;

            // 当检测出内核版本过小
            if (error && error.code == chcp.error.APPLICATION_BUILD_VERSION_TOO_LOW) {
              var dialogMessage = '有新的版本,请下载更新';

              // iOS端 直接弹窗提示升级，点击ok后自动跳转
              if(ionic.Platform.isIOS()){
                chcp.requestApplicationUpdate(dialogMessage, this.userWentToStoreCallback, this.userDeclinedRedirectCallback);
                // Android端 提示升级下载最新APK文件
              }else if(ionic.Platform.isAndroid()){
                var confirmPopup = $ionicPopup.confirm({
                  template: '有新的版本,请下载更新',
                  cssClass: 'popup',
                  cancelText:'取消',
                  okText:'升级'
                });
                confirmPopup.then(function (res) {
                  if (res) {
                    $ionicLoading.show({
                      template: "已经下载：0%"
                    });
                    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function(fileEntry) {
                      fileEntry.getDirectory("时时彩", { create: true, exclusive: false }, function (fileEntry) {
                        //下载代码
                        var fileTransfer = new FileTransfer();
                        fileTransfer.download("http://14.29.54.33:8080/hot_update/ssc_www/ssc.apk", fileEntry.toInternalURL()+"ssc.apk", function(entry) {
                          // 打开下载下来的APP
                          cordova.plugins.fileOpener2.open(
                            entry.toInternalURL(),//下载文件保存地址
                            'application/vnd.android.package-archive', {//以APK文件方式打开
                              error: function(err) {
                              },
                              success: function() {}
                            });
                        }, function(err) {
                        },true);
                        fileTransfer.onprogress = function(progressEvent) {
                          $timeout(function () {
                            var downloadProgress = (progressEvent.loaded / progressEvent.total) * 100;
                            $ionicLoading.show({
                              template: "已经下载：" + Math.floor(downloadProgress) + "%"
                            });
                            if (downloadProgress > 99) {
                              $ionicLoading.hide();
                            }
                          });
                        };
                      },function(err){alert("创建失败")});
                    });
                  }
                });
              }
            }
          },
          userWentToStoreCallback: function() {
            // user went to the store from the dialog
          },
          userDeclinedRedirectCallback: function() {
            // User didn't want to leave the app.
            // Maybe he will update later.
          }
        };
      if(localStorageService.get('user')){
        appUpdate.initialize();
      }

    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.backButton.icon('ion-ios-arrow-left');
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.views.swipeBackEnabled(false);
        // $ionicC
        // $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            //首页
            .state('tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            //历史开奖
            .state('tab.lottery', {
                url: '/lottery',
                views: {
                    'tab-lottery': {
                        templateUrl: 'templates/tab-lottery.html',
                        controller: 'LotteryCtrl'
                    }
                }
            })
            //开奖走势
            .state('tab.movements', {
                url: '/movements',
                views: {
                    'tab-movements': {
                        templateUrl: 'templates/tab-movements.html',
                        controller: 'MovementsCtrl'
                    }
                }
            })
            //个人中心
            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })
            //推荐方案
            .state('recommend-program', {
                url: '/recommend-program/:playType',
                templateUrl: 'templates/recommend-program.html',
                controller:'PlatformSchemeCtrl'
            })
            //方案详情
            .state('program-details', {
                url: '/program-details/:id/:type',
                templateUrl: 'templates/program-details.html',
                controller:'PlatformProgramDetailsCtrl'
            })
            //我的方案
            .state('my-scheme', {
                url: '/my-scheme',
                templateUrl: 'templates/my-scheme.html',
                controller:'UserSchemeCtrl'
            })
            //注册
            .state('register', {
                url: '/register',
                templateUrl: 'templates/user-register.html',
                controller:'UserRegisterCtrl'
            })
            //充值
            .state('recharge', {
                url: '/recharge',
                templateUrl: 'templates/user-recharge.html',
                controller:'UserRechargeCtrl'
            })
            //验证邮箱
                .state('verification-email', {
                    url: '/verification-email/:uid',
                    templateUrl: 'templates/verification-email.html',
                    controller:'UserVerificationEmailCtrl'
                })
                //重置密码
            .state('reset-password', {
                url: '/reset-password',
                templateUrl: 'templates/reset-password.html',
                controller:'UserResetPasswordCtrl'
            })
            //修改密码
            .state('modification-password', {
                url: '/modification-password',
                templateUrl: 'templates/modification-password.html',
                controller:'UserModificationPasswordCtrl'
            })
            //登录
            .state('login', {
                url: '/login',
                templateUrl: 'templates/user-login.html',
                controller:'UserLoginCtrl'
            })
            //绑定手机
            .state('bind-phone', {
                url: '/bind-phone',
                templateUrl: 'templates/bind-phone.html',
                controller:'UserBindPhoneCtrl'
            })
            //已绑定手机
            .state('linked-phone', {
                url: '/linked-phone',
                templateUrl: 'templates/linked-phone.html',
                controller:'UserLinkedPhoneCtrl'
            })
            //我的消息
            .state('my-message', {
              url: '/my-message',
              templateUrl: 'templates/my-message.html',
              controller:'UserMessageCtrl'
            })
            //我的消息详情
            .state('my-message-detail', {
              url: '/my-message-detail/:id',
              templateUrl: 'templates/my-message-detail.html',
              controller:'UserMessageDetailCtrl'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');

    });

angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

/**
 * ==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================
 *
 * This patch works around iOS9 UIWebView regression that causes infinite digest
 * errors in Angular.
 *
 * The patch can be applied to Angular 1.2.0 – 1.4.5. Newer versions of Angular
 * have the workaround baked in.
 *
 * To apply this patch load/bundle this file with your application and add a
 * dependency on the "ngIOS9UIWebViewPatch" module to your main app module.
 *
 * For example:
 *
 * ```
 * angular.module('myApp', ['ngRoute'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngRoute', 'ngIOS9UIWebViewPatch'])
 * ```
 *
 *
 * More info:
 * - https://openradar.appspot.com/22186109
 * - https://github.com/angular/angular.js/issues/12241
 * - https://github.com/driftyco/ionic/issues/4082
 *
 *
 * @license AngularJS
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */

angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn= browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}]);

angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

/**
 * 泰山计划
 * @param uid
 * @constructor
 */

function yikeTaishan(url, uid) {
    this.url = url + '?i='+uid+'&c=entry&m=yike_ts_plan';
    this.uid = uid;
    // this.openid = openid;
}

yikeTaishan.prototype = {
    constructor: yikeTaishan,
    /**
     * 基础查询函数
     * @param controller
     * @param action
     * @param op
     * @returns {AV.Promise}
     */
    query: function (data) {
        var promise = new AV.Promise();
        var url = this.url;
        for (var key in data) {
            if (url != "") {
                url += "&";
            }
            url += key + "=" + encodeURIComponent(data[key]);
        }

        $.ajax({
            url: url,
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                promise.resolve(data);
            },
            error: function (i, data) {
                connectionTimeout();
                promise.reject(data);
            }
        });
        return promise;
    },

  /**
   * 获取消息标题
   * @param page
   * @returns {*|AV.Promise}
   */
    getMessageTitle:function(page,style){
      return this.query({
        do:"article",
        op:"list",
        page:page,
        style:style
      });
    },

    /**
     * 获取详细信息
     * @param id
     * @returns {*|AV.Promise}
     */
    getMessageDetail:function(id){
      return this.query({
        do:"article",
        op:"update",
        id:id
      });
    },
    /**
     * 注册
     * @param phone
     * @param mac
     * @param qq
     * @param nickname
     * @param password
     * @returns {*|AV.Promise}
     */
    register:function(phone,mac,qq,nickname,password){
        return this.query({
            do:'register',
            phone:phone,
            mac:mac,
            qq:qq,
            nickname:nickname,
            password:password
        });
    },
    /**
     * 发送手机验证码
     * @param phone
     * @param op
     * @returns {*|AV.Promise}
     */
    sendMsg:function(phone,op){
        return this.query({
            do:'sendmsg',
            op:op,
            phone:phone
        });
    },
    /**
     * 确认邮箱验证完成
     * @param uid
     * @returns {*|AV.Promise}
     */
    confirmEmail :function(uid){
        return this.query({
            do:'confirm',
            op:'ok',
            uid:uid
        });
    },
    /**
     * 登录
     * @param email
     * @param password
     * @param op
     * @returns {*|AV.Promise}
     */
    login :function(email,password,op){
        return this.query({
            do:'login',
            op:op,
            email:email,
            password:password
        });
    },
    /**
     * 获取账户是否到期
     * @param uid
     * @param token
     * @returns {*|AV.Promise}
     */
    expire :function(uid,token){
        return this.query({
            do:'user',
            uid:uid,
            token:token
        });
    },
    /**
     * 首页banner
     * @returns {*|AV.Promise}
     */
    banner :function(){
        return this.query({
            do:'banner'
        });
    },
    /**
     * 历史开奖
     * @param op
     * @param page
     * @returns {*|AV.Promise}
     */
    lottery :function(op,page){
        return this.query({
            do:'lottery',
            op:op,
            page:page
        });
    },
    /**
     * 开奖走势
     * @param op
     * @param ob
     * @param num
     * @returns {*|AV.Promise}
     */
    movements :function(op,ob,num){
        return this.query({
            do:'trend',
            op:op,
            ob:ob,
            num:num
        });
    },
    /**
     * 重庆时时彩方案列表
     * @returns {*|AV.Promise}
     */
    sscScheme :function(){
        return this.query({
            do:'plan',
            op:'list'
        });
    },
    /**
     * pk10方案列表
     * @returns {*|AV.Promise}
     */
    pkScheme :function(){
        return this.query({
            do:'pk10_plan',
            op:'list'
        });
    },
    /**
     * 重庆时时彩方案详情
     * @param plan_id
     * @returns {*|AV.Promise}
     */
    schemeDetails :function(plan_id){
        return this.query({
            do:'plan',
            op:'detail',
            plan_id:plan_id
        });
    },
    /**
     * pk10方案详情
     * @param plan_id
     * @returns {*|AV.Promise}
     */
    pkDetails :function(plan_id){
        return this.query({
            do:'pk10_plan',
            op:'detail',
            plan_id:plan_id
        });
    },
    /**
     * 收藏方案
     * @param ob
     * @param op
     * @param plan_id
     * @param uid
     * @returns {*|AV.Promise}
     */
    collect :function(op,ob,plan_id,uid){
        return this.query({
            do:'collection',
            op:op,
            ob:ob,
            plan_id:plan_id,
            uid:uid
        });
    },
    /**
     * 我收藏的方案
     * @param op
     * @param ob
     * @param uid
     * @returns {*|AV.Promise}
     */
    myCollect :function(op,ob,uid){
        return this.query({
            do:'collection',
            op:op,
            ob:ob,
            uid:uid
        });
    },
    /**
     * 删除我的收藏
     * @param op
     * @param ob
     * @param id
     * @returns {*|AV.Promise}
     */
    deleteCollect :function(op,ob,id){
        return this.query({
            do:'collection',
            op:op,
            ob:ob,
            id:id
        });
    },
    /**
     * 修改密码
     * @param op
     * @param phone
     * @param password
     * @param new_password
     * @param token
     * @returns {*|AV.Promise}
     */
    modificationPassword :function(op,phone,new_password,password,token){
        return this.query({
            do:'reset',
            op:op,
            phone:phone,
            new_password:new_password,
            password:password,
            token:token
        });
    },
    /**
     * 公告列表
     * @returns {*|AV.Promise}
     */
    notice :function(){
        return this.query({
            do:'notice'
        });
    },
    /**
     * 个人中心
     * @param uid
     * @param op
     * @returns {*|AV.Promise}
     */
    personalCenter :function(op,uid){
        return this.query({
            do:'personal_center',
            op:op,
            uid:uid
        });
    },
    /**
     * 充值
     * @param phone
     * @param password
     * @param token
     * @returns {*|AV.Promise}
     */
    recharge :function(phone,password,token){
        return this.query({
            do:'recharge',
            phone:phone,
            password:password,
            token:token
        });
    },
    /***
     * 退出登录
     * @param uid
     * @returns {*|AV.Promise}
     */
    logout :function(uid){
        return this.query({
            do:'login_out',
            uid:uid
        });
    },
    /**
     * 绑定手机号
     * @param phone
     * @param token
     * @returns {*|AV.Promise}
     */
    bindPhone :function(phone,token){
        return this.query({
            do:'binding',
            phone:phone,
            token:token
        });
    },
    /**
     * 是否显示充值按钮
     * @returns {*|AV.Promise}
     */
    isShowRecharge :function(){
        return this.query({
            do:'open'
        });
    }
};

//var openid = elocalStorage.get('openid') || '';
var yikeTaishan = new yikeTaishan(WX_API_URL, WX_ID);

/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('platform.module', ['platform.scheme.controller','platform.program.details.controller']);
})();

/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('platform.program.details.controller', [])
        .controller('PlatformProgramDetailsCtrl', PlatformProgramDetailsCtrl);
    PlatformProgramDetailsCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function PlatformProgramDetailsCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.user=localStorageService.get('user');
        var id=$state.params.id;
        $scope.data = {
            time: '00:00'
        };
        $scope.playStatus=0;
        $scope.type=$state.params.type;
        $scope.isShow=false;
        $scope.collect=collect;
        $scope.copy=copy;
        var sscsh;
        var pksh;
        var status=0;
        $scope.$on('$ionicView.afterLeave', function() {
            clearInterval(sscsh);
            clearInterval(pksh);
        });
        init();
        function init() {
            lottery();
            document.addEventListener("webkitvisibilitychange", onVisibilityChanged, false);
            //获取客服微信,qq
            yikeTaishan.personalCenter('platform','')
                .then(function (data) {
                    if(data.status == 1){
                        $scope.message=data.result;
                        $scope.$digest();
                    }
                });
        }
        function onVisibilityChanged() {
            lottery();
        }
        function details() {
            if(status == 0){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
            }
            status=1;
            if($scope.type == 1){
              schemeDetails();
            }else {
              pkDetails();
            }
            /*yikeTaishan.expire($scope.user.id,$scope.user.token)
                .then(function (data) {
                    if(data.status == 1){
                        if($scope.type == 1){
                            schemeDetails();
                        }else {
                            pkDetails();
                        }
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
        //重庆时时彩方案详情
        function schemeDetails() {
            yikeTaishan.schemeDetails(id)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status ==1 ){
                        if(data.result.win2){
                            data.result.win2.create_time=moment.unix(Number(data.result.win2.create_time)).format("YYYY年MM月DD日 HH:mm:ss");
                        }
                        $scope.schemeDetails=data.result;
                        $scope.$digest();
                    }
                })
        }
        //pk10方案详情
        function pkDetails() {
            yikeTaishan.pkDetails(id)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status ==1 ){
                        if(data.result.win2){
                            data.result.win2.create_time=moment.unix(Number(data.result.win2.create_time)).format("YYYY年MM月DD日 HH:mm:ss");
                        }
                        $scope.schemeDetails=data.result;
                        $scope.$digest();
                    }
                })
        }
        //收藏方案
        function collect() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            yikeTaishan.collect('add',$scope.schemeDetails.plan.type,id,$scope.user.id)
              .then(function (data) {
                $ionicLoading.hide();
                $yikeUtils.toast(data.result.result);
                if(data.status == 1){
                  $scope.isShow=false;
                }
              });
            /*yikeTaishan.expire($scope.user.id,$scope.user.token)
                .then(function (data) {
                    if(data.status == 1){
                        yikeTaishan.collect('add',$scope.schemeDetails.plan.type,id,$scope.user.id)
                            .then(function (data) {
                                $ionicLoading.hide();
                                $yikeUtils.toast(data.result.result);
                                if(data.status == 1){
                                    $scope.isShow=false;
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
                })*/
        }
        // 复制
        function copy() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            $ionicLoading.hide();
            $scope.isShow=false;
            cordova.plugins.clipboard.copy($scope.schemeDetails.win3);
            $yikeUtils.toast('复制成功');
            /*yikeTaishan.expire($scope.user.id,$scope.user.token )
                .then(function (data) {
                    if(data.status == 1){
                        $ionicLoading.hide();
                        $scope.isShow=false;
                        cordova.plugins.clipboard.copy($scope.schemeDetails.win3);
                        $yikeUtils.toast('复制成功');
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
                })*/
        }
        // function callLottery() {
        //     yikeTaishan.expire($scope.user.id,$scope.user.token)
        //         .then(function (data) {
        //             if(data.status == 1){
        //                 lottery();
        //             }else{
        //                 var alertPopup = $ionicPopup.alert({
        //                     title: '提示',
        //                     template: data.result.result,
        //                     buttons:[{
        //                         text:'确定',
        //                         type: 'button-positive'
        //                     }]
        //                 });
        //                 alertPopup.then(function() {
        //                     localStorageService.remove('user');
        //                     $state.go('login');
        //                 });
        //             }
        //         })
        // }
        //首页历史开奖
        function lottery() {
            yikeTaishan.lottery('index','')
                .then(function (lottery) {
                    if(lottery.status == 1){
                        $scope.pk=lottery.result.pk10;
                        $scope.ssc=lottery.result.ssc;
                        $scope.pkTime = parseInt($scope.pk.difference_time);//倒计时总秒数量
                        $scope.sscTime = parseInt($scope.ssc.difference_time);//倒计时总秒数量
                        if($scope.type == 1){
                            if(moment().hour() >=2 && moment().hour() <10){
                                $scope.playStatus=2;
                            }else{
                                if($scope.sscTime > 0){
                                    $scope.playStatus=1;
                                }else{
                                    $scope.playStatus=0;
                                }
                            }
                            sscTimer($scope.sscTime);
                        }else{
                            if(moment().hour() >=0 && moment().hour() <=8){
                                $scope.playStatus=2;
                            }else{
                                if($scope.pkTime > 0){
                                    $scope.playStatus=1;
                                }else{
                                    $scope.playStatus=0;
                                }
                            }
                            pkTimer($scope.pkTime);
                        }
                        details();
                        $scope.$digest();
                    }
                })
        }
        //pk倒计时
        var pkt=5;
        function pkTimer(intDiff){
            clearInterval(pksh);
            pksh=setInterval(function(){
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
                    clearInterval(pksh);
                    if(intDiff == 0){
                        lottery();
                    }else{
                        pkt--;
                        if(pkt == 0){
                            lottery();
                            pkt=5;
                        }else {
                            pkTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.data.time = hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
        //时时彩倒计时
        var t=5;
        function sscTimer(intDiff){
            clearInterval(sscsh);
            sscsh=setInterval(function(){
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
                    clearInterval(sscsh);
                    if(intDiff == 0){
                        lottery();
                    }else{
                        t--;
                        if(t == 0){
                            lottery();
                            t=5;
                        }else {
                            sscTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.data.time = hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
    }
})();

/**
 * Created by frank on 2016/9/7.
 */
(function () {
    'use strict';

    angular
        .module('platform.scheme.controller', [])
        .controller('PlatformSchemeCtrl', PlatformSchemeCtrl);

    PlatformSchemeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function PlatformSchemeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.user=localStorageService.get('user');
        $scope.oneStar=[];
        $scope.twoStar=[];
        $scope.threeStar=[];
        $scope.fourStar=[];
        $scope.fiveStar=[];
        $scope.status={
            status:1,
            oneStar:true,
            twoStar:false,
            threeStar:false,
            fourStar:false,
            fiveStar:false,
            playingMethod:$state.params.playType
        };
        $scope.selectStar=selectStar;
        $scope.playingMethod=playingMethod;
        init();
        function init() {
            playingMethod();
        }
        //重庆时时彩方案列表
        function sscList() {
            yikeTaishan.sscScheme()
                .then(function (data) {
                  console.log(data);
                    $ionicLoading.hide();
                    if(data.status == 1){
                        for(var i=0;i < data.result.plan.length;i++){
                            if(data.result.plan[i].address == 1){
                                $scope.oneStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 2){
                                $scope.twoStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 3){
                                $scope.threeStar.push(data.result.plan[i]);
                            }else if(data.result.plan[i].address == 4){
                                $scope.fourStar.push(data.result.plan[i]);
                            }else{
                                $scope.fiveStar.push(data.result.plan[i]);
                            }
                        }
                        $scope.$digest();
                    }
                })
        }
        //玩法
        function playingMethod() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
          $scope.oneStar=[];
          $scope.twoStar=[];
          $scope.threeStar=[];
          $scope.fourStar=[];
          $scope.fiveStar=[];
          if($scope.status.playingMethod == 'ssc'){
            sscList();
          }
        }
        //选择星级
        function selectStar(status) {
            $scope.status.status=status;
            if($scope.status.status == 1){
                $scope.status.oneStar=true;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 2){
                $scope.status.oneStar=false;
                $scope.status.twoStar=true;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 3){
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=true;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=false;
            }else if($scope.status.status == 4){
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=true;
                $scope.status.fiveStar=false;
            }else{
                $scope.status.oneStar=false;
                $scope.status.twoStar=false;
                $scope.status.threeStar=false;
                $scope.status.fourStar=false;
                $scope.status.fiveStar=true;
            }
        }
    }
})();

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

/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('user.message.controller', [])
        .controller('UserMessageCtrl', UserMessageCtrl);

  UserMessageCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','localStorageService','$ionicLoading'];
    /* @ngInject */
    function UserMessageCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,localStorageService,$ionicLoading){
      var page = 1;
      $scope.loadMore = loadMore;
      $scope.refresh = refresh;
      $scope.messageTitleList = [];
      $scope.messageTitle = {
        state:0
      };
      function refresh(){
        page = 1;
        loadMoreTmeplate();
      }

      function loadMore(){
        loadMoreTmeplate();
      }
      function loadMoreTmeplate(){
        yikeTaishan.getMessageTitle(page,"releases")
          .then(function(res){
            if(res.status == 1){
              for(var i=0;i<res.result.list.length;i++){
                res.result.list[i].time = moment.unix(Number(res.result.list[i].time)).format("YYYY.MM.DD HH:mm");
              }
              if(page == 1){
                $scope.messageTitleList = res.result.list;
              }else{
                $scope.messageTitleList = $scope.messageTitleList.concat(res.result.list);
              }
            }
            $scope.is_loadMore=$scope.messageTitleList.length >= res.result.total;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
            page++;
            $scope.$digest();
          });
      }
    }
})();

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

/**
 * Created by frank on 2016/9/5.
 */
(function () {
    'use strict';

    angular
        .module('user.module', ['user.register.controller','user.verification.email.controller','user.login.controller','user.scheme.controller','user.modification.password.controller',
        'user.reset.password.controller','user.recharge.controller','user.bind.phone.controller','user.linked.phone.controller','user.message.controller','user.message.detail.controller']);
})();

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

/**
 * Created by frank on 2016/9/9.
 */
(function () {
    'use strict';

    angular
        .module('user.reset.password.controller', [])
        .controller('UserResetPasswordCtrl', UserResetPasswordCtrl);

    UserResetPasswordCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicLoading'];
    /* @ngInject */
    function UserResetPasswordCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicLoading){
        $scope.user={
            phone:'',
            code:'',
            password:'',
            passwordTwo:'',
            op:'reset',
            msg:''
        };
        $scope.reset=reset;
        $scope.sendMsg=sendMsg;
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
        //重置密码
        function reset() {
            var suc=formValidation();
            if(suc){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner>'
                });
                yikeTaishan.modificationPassword('reset',$scope.user.phone,$scope.user.password,'','')
                    .then(function (data) {
                        $yikeUtils.toast(data.result.result);
                        if(data.status == 1){
                            $state.go('login');
                        }
                    })
            }
        }
        //获取焦点隐藏other
        function focus() {
            document.getElementsByClassName('login_txt')[0].classList.add('keyboard-hide');
        }
        //失去焦点显示other
        function blur(){
            document.getElementsByClassName('login_txt')[0].classList.remove('keyboard-hide');
        }
    }
})();

/**
 * Created by frank on 2016/9/8.
 */
(function () {
    'use strict';

    angular
        .module('user.scheme.controller', [])
        .controller('UserSchemeCtrl', UserSchemeCtrl);

    UserSchemeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicModal','$ionicPopup','$ionicLoading','localStorageService'];
    /* @ngInject */
    function UserSchemeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicModal,$ionicPopup,$ionicLoading,localStorageService){
        $scope.user=localStorageService.get('user');
        $scope.playingMethod='ssc';
        $scope.deleteCollect=deleteCollect;
        init();
        function init() {
            myCollect();
        }
        //我收藏的方案
        function myCollect() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
          yikeTaishan.myCollect('my_collection',$scope.playingMethod,$scope.user.id)
            .then(function (data) {
              $ionicLoading.hide();
              if(data.status == 1){
                $scope.collect=data.result.collection;
                $scope.$digest();
              }else{
                $scope.collect=[];
                $yikeUtils.toast(data.result.collection);
              }
            });
        }
        //删除收藏
        function deleteCollect(id,index) {
          var comfirmPopup=$ionicPopup.confirm({
            title:'删除收藏方案',
            template:'确认要删除？',
            okText:'确定',
            cancelText:'取消'
          });
          comfirmPopup.then(function(res) {
            if (res) {
              $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
              });
              yikeTaishan.deleteCollect('delete',$scope.playingMethod,id)
                .then(function (data) {
                  $ionicLoading.hide();
                  $yikeUtils.toast(data.result.result);
                  if(data.status == 1){
                    $scope.collect.splice(index,1);
                  }
                  $scope.$digest();
                })
            }
          });
        }
    }
})();

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
"use strict";
angular.module("ionic-toast", ["ionic"]).run(["$templateCache", function (t) {
    var o = '<div class="ionic_toast" ng-class="ionicToast.toastClass" ng-style="ionicToast.toastStyle"><span class="ionic_toast_close" ng-click="hide()"><i class="ion-close-round toast_close_icon"></i></span><span ng-bind-html="ionicToast.toastMessage"></span></div>';
    t.put("ionic-toast/templates/ionic-toast.html", o)
}]).provider("ionicToast", function () {
    this.$get = ["$compile", "$document", "$interval", "$rootScope", "$templateCache", "$timeout", function (t, o, i, n, s, a) {
        var c, e = {
            toastClass: "",
            toastMessage: "",
            toastStyle: {display: "none", opacity: 0}
        }, l = {
            top: "ionic_toast_top",
            middle: "ionic_toast_middle",
            bottom: "ionic_toast_bottom"
        }, d = n.$new(), p = t(s.get("ionic-toast/templates/ionic-toast.html"))(d);
        d.ionicToast = e, o.find("body").append(p);
        var u = function (t, o, i) {
            d.ionicToast.toastStyle = {display: t, opacity: o}, d.ionicToast.toastStyle.opacity = o, i()
        };
        return d.hide = function () {
            u("none", 0, function () {
                console.log("toast hidden")
            })
        }, {
            show: function (t, o, i, n) {
                t && o && n && (a.cancel(c), n > 5e3 && (n = 5e3), angular.extend(d.ionicToast, {
                    toastClass: l[o] + " " + (i ? "ionic_toast_sticky" : ""),
                    toastMessage: t
                }), u("block", 1, function () {
                    i || (c = a(function () {
                        d.hide()
                    }, n))
                }))
            }, hide: function () {
                d.hide()
            }
        }
    }]
});

(function () {
  'use strict';

  angular
    .module('yike.back', [])
    .directive('yikeBack', YikeBack);

  YikeBack.$inject = ['$ionicHistory','$location'];

  function YikeBack($ionicHistory,$location) {
    var directive = {
      template: ' <button class="button button-clear ion-chevron-left white"></button>',
      link: link,
      replace: true,
      restrict: 'AE'
    };
    return directive;

    function link(scope, element, attrs) {
      element.bind('click', function(e) {
        $ionicHistory.goBack();
      })
    }
  }
})();

(function () {
    'use strict';

    angular
        .module('yike', ['yike.subMenu', 'yike.utils', 'ionic-toast', 'yike.back']);

})();

(function () {
  'use strict';

  angular
    .module('yike.subMenu', [])
    .directive('yikeSubMenu', yikeSubMenu);

  yikeSubMenu.$inject = [];
  function yikeSubMenu() {
    return {
      replace: false,
      restrict: 'AE',
      link: function (scope, elem, attrs) {
        scope.clickCategory = function (key) {
          scope.current.menu = key == scope.current.menu ? '' : key;
          scope.current.subMenu = [];
        };

        scope.clickMenu = function (menu) {
          if (menu.sub.length > 0) {
            scope.current.subMenu = menu.sub;
          } else {
            scope.condition[scope.current.menu] = menu;
            scope.current.menu = null;
            scope.page = 1;
            scope.query();
          }
          $('.sub').scrollTop(0);
        };

        scope.clickSubMenu = function (subMenu) {
          scope.condition[scope.current.menu] = subMenu;
          scope.current.menu = null;
          scope.page = 1;
          scope.query();
        }
      },
      templateUrl: 'templates/utils/sub-menu.html'
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('yike.utils', ['ionic'])
    .factory('$yikeUtils', $yikeUtils);

  $yikeUtils.$inject = ['$rootScope', '$state', '$ionicPopup', '$ionicModal', '$location', '$timeout', 'ionicToast', '$ionicLoading'];

  /* @ngInject */
  function $yikeUtils($rootScope, $state, $ionicPopup, $ionicModal, $location, $timeout, ionicToast, $ionicLoading) {
    return {
      go: go,
      alert: alert,
      confirm: confirm,
      show: show,
      toast: toast
    };

    ////////////////

    function go(target, params, options) {
      $state.go(target, params, options);
    }

    function toast(message, position, stick, time) {
      //position = position || 'middle';
      //stick = stick || false;
      //time = time || 3000;
      //ionicToast.show(message, position, stick, time);
      $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
    }

    function alert(title, template) {
      var _alert = $ionicPopup.alert({
        title: title,
        template: template,
        'okType': 'button-assertive'
      });

      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 1500);

      return _alert;
    }

    function confirm(title, template) {
      var _alert = $ionicPopup.confirm({
        'title': title,
        'template': template,
        'okType': 'button-assertive',
        'cancelText': '取消',
        'okText': '确认',
        cssClass:'red-confirm'
      });

      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 3000);

      return _alert;
    }

    function show(title, template, scope, buttons) {
      var _alert = $ionicPopup.show({
        title: title,
        template: template,
        scope: scope,
        buttons: buttons
      });
      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 3000);

      return _alert;
    }
  }
})();

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

/**
 * Created by frank on 2016/8/31.
 */
(function () {
    'use strict';

    angular
        .module('home.controller', [])
        .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicSlideBoxDelegate','$ionicLoading','$sce','$ionicViewSwitcher'];
    /* @ngInject */
    function HomeCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicSlideBoxDelegate,$ionicLoading,$sce,$ionicViewSwitcher){
        var sscsh;
        $scope.playStatus={
            sscStatus:0
        };
      yikeTaishan.getMessageTitle(1,"status")
        .then(function(res){
          console.log(res);
        });
        $scope.openLink=openLink;
        $scope.openBannerLink=openBannerLink;
        $scope.$on('$ionicView.afterLeave', function() {
            clearInterval(sscsh);
            /*clearInterval(pksh);*/
        });
        init();
        function init() {
            ipcRenderer.on("try_home",function(e,msg){
                console.log(e);
                console.log(msg);
            });
            ipcRenderer.send("try_home","ok");
            if(localStorageService.get('user')){
              $scope.user=localStorageService.get('user');
            }else{
              $ionicPopup.alert({
                title: '提示',
                template: '请先登录',
                buttons:[{
                  text:'确定',
                  type: 'button-positive'
                }]
              }).then(function(){
                $state.go("login");
                $ionicViewSwitcher.nextDirection('forward');
              });
              return;
            }
          $ionicTabsDelegate.showBar(true);//隐藏开奖走势导航栏
          banner();
          lottery();
          notice();
          note();
          document.addEventListener("visibilitychange", onVisibilityChanged, false);
        }
        //
        function onVisibilityChanged() {
            lottery();
        }
        $scope.noteContent = [];
        /*广播信息*/
        function note(){
          yikeTaishan.getMessageTitle(1,"status")
            .then(function(res){
              if(res.status == 1){
                $scope.noteContent = res.result.list;
                $scope.$digest();
                var noteSwiper = new Swiper(".container-note",{
                  autoplay:1500,
                  loop:true,
                  direction:"vertical"
                });
              }
            });
        }
        //banner
        function banner() {
            yikeTaishan.banner()
                .then(function (banner) {
                    if(banner.status == 1){
                        $scope.banners=banner.result.banner;
                        $scope.$digest();
                        var swiper = new Swiper('.swiper-container', {
                            pagination: '.swiper-pagination',
                            autoplay:2000,
                            paginationClickable: true,
                            observer: true,//修改swiper自己或子元素时，自动初始化swiper
                            observeParents: true//修改swiper的父元素时，自动初始化swiper
                        });
                    }
                });
        }
        //公告列表
        function notice() {
            yikeTaishan.notice()
                .then(function (data) {
                    if(data.status == 1){
                        var pattern1=/&lt;/gim;
                        var pattern2=/&gt;/gim;
                        var pattern3=/&quot;/gim;
                        for(var i=0;i<data.result.notice.length;i++){
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern1,'<');
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern2,'>');
                            data.result.notice[i].content=data.result.notice[i].content.replace(pattern3,'"');
                            data.result.notice[i].content =$sce.trustAsHtml(data.result.notice[i].content);
                        }
                        $scope.noticeList=data.result.notice;
                        $scope.$digest();
                        jQuery(".txtMarquee-left").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",vis:2,interTime:50});
                    }
                })
        }

        var clearInter = '';
        var interFun = function(){
          $(".ssc_number").animateNumber({number:9});
        };
        //首页历史开奖
        function lottery() {
            yikeTaishan.lottery('index','')
                .then(function (lottery) {
                    if(lottery.status == 1){
                        /*$scope.pk=lottery.result.pk10;*/
                        $scope.ssc=lottery.result.ssc;
                        /*$scope.pkTime = parseInt($scope.pk.difference_time);//倒计时总秒数量*/
                        $scope.sscTime = parseInt($scope.ssc.difference_time);
                        if(moment().hour() >=2 && moment().hour() <10){
                            clearInterval(interFun);
                            $scope.playStatus.sscStatus=2;
                        }else{
                            if($scope.sscTime > 0){
                                clearInterval(interFun);
                                $scope.playStatus.sscStatus=1;
                            }else{
                                clearInterval(interFun);
                                $scope.playStatus.sscStatus=0;
                                $scope.$apply(function () {
                                  clearInter=setInterval(interFun,100);
                                });
                            }
                        }
                        sscTimer($scope.sscTime);
                        /*pkTimer($scope.pkTime);*/
                        $scope.$digest();
                    }
                })
        }
        //时时彩倒计时
        var ssct=5;
        function sscTimer(intDiff){
            clearInterval(sscsh);
            sscsh=setInterval(function(){
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
                    clearInterval(sscsh);
                    if(intDiff == 0){
                        lottery();
                    }else{
                        ssct--;
                        if(ssct == 0){
                            lottery();
                            ssct=5;
                        }else {
                            sscTimer(-1);
                        }
                    }
                }
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                $scope.ssctime=hour + ':' + minute + ':' + second;
                $scope.$digest();
                intDiff--;
            }, 1000);
        }
        //跳自定义链接
        function openBannerLink(link) {
            window.open(link,'_system');
        }
        //跳转官方网站
        function openLink() {
            window.open('http://036767.com/','_blank');
        }
    }
})();

/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('lottery.controller', [])
        .controller('LotteryCtrl', LotteryCtrl);

    LotteryCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','localStorageService','$ionicPopup','$ionicLoading'];
    /* @ngInject */
    function LotteryCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,localStorageService,$ionicPopup,$ionicLoading){
        $scope.refresh=refresh;
        $scope.loadMore=loadMore;
        $scope.screen=screen;
        var page=1;
        $scope.lotteryList=[];
        $scope.op='ssc';
        var user=localStorageService.get('user');
        init();
        function init() {
            $ionicTabsDelegate.showBar(true);//隐藏开奖走势导航栏
        }
        //下拉刷新
        function refresh() {
          page=1;
          lottery();
        }
        //上拉加载
        function loadMore() {
          lottery();
            /*yikeTaishan.expire(user.id,user.token)
                .then(function (data) {
                    if(data.status == 1){
                        lottery();
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
                            localStorageService.remove('user');
                            $state.go('login')
                        });
                    }
                })*/
        }
        function lottery() {
            yikeTaishan.lottery($scope.op,page)
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status== 1 && data.result.total > 0){
                        for(var i=0;i<data.result.list.length;i++){
                            data.result.list[i].time=moment.unix(Number(data.result.list[i].time)).format("YYYY.MM.DD HH:mm");
                        }
                        if(page == 1){
                            $scope.lotteryList=data.result.list;
                        }else{
                            $scope.lotteryList=$scope.lotteryList.concat(data.result.list);
                        }
                    }else{
                        $scope.lotteryList=[];
                    };
                    $scope.noMoreItemsAvailable = $scope.lotteryList.length >= Number(data.result.total);
                    $scope.$digest();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    page++;
                });
        }
        //分类筛选
        function screen() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
          page=1;
          loadMore();
        }
    }
})();

/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('movements.controller', [])
        .controller('MovementsCtrl', MovementsCtrl);

    MovementsCtrl.$inject = ['$scope','$yikeUtils','$state','$ionicHistory','$ionicTabsDelegate','$timeout','localStorageService','$ionicLoading','$ionicScrollDelegate','$ionicPopup'];
    /* @ngInject */
    function MovementsCtrl($scope,$yikeUtils,$state,$ionicHistory,$ionicTabsDelegate,$timeout,localStorageService,$ionicLoading,$ionicScrollDelegate,$ionicPopup){
        var user=localStorageService.get('user');
        $scope.num='30';
        $scope.movements={
            num:'30',
            op:'ssc',
            ob:'one',
            digit:'个位走势'
        };
        $scope.sscScreen=[{ob:'one',content:'个位走势'},{ob:'ten',content:'十位走势'},{ob:'hundred',content:'百位走势'},{ob:'thousand',content:'千位走势'},
            {ob:'ten_thousand',content:'万位走势'}];
        $scope.movementsNum=[0,1,2,3,4,5,6,7,8,9];
        $scope.digitMovements=digitMovements;
        $scope.periods=periods;
        init();
        function init() {

            $ionicTabsDelegate.showBar(false);//隐藏开奖走势导航栏
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            movements();
        }

        //走势数据
        function movements() {
            yikeTaishan.movements($scope.movements.op,$scope.movements.ob,Number($scope.movements.num))
                .then(function (data) {
                    $ionicLoading.hide();
                    if(data.status == 1){
                        $scope.datas=data.result.list;
                        $scope.analysis=data.result.analysis;
                        $timeout(function() {
                            pageLoad();
                        });
                        $scope.$digest();
                    }
                })
        }
        //位数走势
        function digitMovements(ob,content) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            $scope.movements.ob=ob;
            $scope.movements.digit=content;
            movements();
        }
        //期数筛选
        function periods() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>'
            });
            movements();
        }

        //走势线条
        function pageLoad(){
            var span=document.getElementsByClassName('span-active');
            var ul=document.getElementById('ul');
            var container=document.getElementById('container');
            var mycanvas=document.getElementById('mycanvas');
            mycanvas.style.display='none';
            mycanvas.style.display='block';
            mycanvas.width=container.offsetWidth;
            mycanvas.height=container.offsetHeight-88;
            var cans=mycanvas.getContext('2d');
                var u = navigator.userAgent;
                var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
                // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+token OS X/); //ios终端
            if(isAndroid){
                for(var i=0;i<span.length;i++){
                    var x=span[i].getBoundingClientRect().left+document.documentElement.scrollLeft+9;
                    var y=span[i].getBoundingClientRect().top+document.documentElement.scrollTop+$ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top-123;
                    if(i == 0){
                        cans.moveTo(x,y);
                    }else{
                        cans.lineTo(x,y);
                    }
                }
            }else{
                for(var i=0;i<span.length;i++){
                    var x=span[i].getBoundingClientRect().left+document.documentElement.scrollLeft+9;
                    var y=span[i].getBoundingClientRect().top+document.documentElement.scrollTop+$ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top-143;
                    if(i == 0){
                        cans.moveTo(x,y);
                    }else{
                        cans.lineTo(x,y);
                    }
                }
            }
            cans.lineWidth=1;
            cans.strokeStyle = '#E3B56E';
            cans.stroke();
            cans.save();
        }
    }
})();

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
/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('tab.module', ['lottery.controller','movements.controller','program.details.controller','account.controller','home.controller']);
})();
