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
