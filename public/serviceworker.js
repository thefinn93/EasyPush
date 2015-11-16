self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var title = 'Cactus cactus cactus';
  var body = 'We have received a push message.';
  var icon = 'https://finn.io/cactus.png';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "icon",
      tag: tag
    })
  );
});
