var express = require('express');
var router = express.Router();
var reddit = require('./reddit');

router.get('/reddit', reddit.preauth);
router.get('/reddit_callback', reddit.postauth);

module.exports = router;
