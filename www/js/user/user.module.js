/**
 * Created by frank on 2016/9/5.
 */
(function () {
    'use strict';

    angular
        .module('user.module', ['user.register.controller','user.verification.email.controller','user.login.controller','user.scheme.controller','user.modification.password.controller',
        'user.reset.password.controller','user.recharge.controller','user.bind.phone.controller','user.linked.phone.controller','user.message.controller','user.message.detail.controller']);
})();
