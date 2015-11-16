self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  var notificationPromise = fetchNotifications(self.registration);
  event.waitUntil(notificationPromise);
});


function get(registration) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', "/notifications/unread");
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();
  });
}
