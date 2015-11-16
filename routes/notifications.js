var express = require('express');

var router = express.Router();

router.get('/unread', function(req, res, next) {
  // magic to list only the unread notifications
});

router.get('/list', function(req, res, next) {
  // magic to list all notifications
});

router.post('/read', function(req, res, next) {
  // magic to mark a notification or multiple notifications as read
});

router.post('/create', function(req, res, next) {
  // magic to create a notification
});

module.exports = router;
