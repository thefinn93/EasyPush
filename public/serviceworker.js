self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  var notificationPromise = fetch('/notifications/unread').then(function(response) {
    if(response.status == 200) {
      response.json().then(function(data) {makeNotification(data, self.registration);});
    } else {
      console.error("Failed to fetch unread notifications! This is proly bad!");
    }
  });
  event.waitUntil(notificationPromise);
});

function makeNotification(data, registration) {
  if (data.error || !data.notification || !data.notification.title) {
    console.error('The API returned an error.', data.error);
    throw new Error();
  }
  registration.showNotification(title, data.notification);
}

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
