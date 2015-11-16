var express = require('express');
var router = express.Router();
var settings = require('../settings.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.username) {
    res.render('pushes', { title: 'Pushes', user: req.session.username });
  } else {
    res.render('index', { title: 'EasyPush', user: req.session.username });
  }
});

router.get('/manifest.json', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    name: "Easy Push",
    short_name: "Easy Push",
    icons: [{
          src: "images/icon-192x192.png",
          sizes: "192x192",
          type: "image/png"
        }],
    start_url: "/",
    display: "standalone",
    gcm_user_visible_only: true,
    gcm_sender_id: settings.GCM.id + ""
  }));
});

if(settings.enableGitHook) {
  router.post('/githook', function(req, res, next) {
    var pull = require('child_process').spawn('git', ['pull']);
    pull.on('close', function(code) {
      res.send("Pull'd");
    });
  });
}

module.exports = router;
