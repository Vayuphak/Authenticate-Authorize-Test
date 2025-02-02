const express = require('express');
const router =  express.Router();
const api = require('./api');

router.route('/register')
.post(api.register)

router.route('/login')
.post(api.login)

router.route('/userapi')
.get(api.authen,api.userapi)

router.route('/refreshtoken')
.post(api.refreshToken)

router.route('/logout')
.post(api.authen,api.logout)

router.route('/admin')
.get(api.authen,api.authorize(['admin']),api.admin)


module.exports = router;