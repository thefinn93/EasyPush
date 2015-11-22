self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  var notificationPromise = fetch('/notifications/unread', {credentials: 'include'}).then(function(response) {
    if(response.status == 200) {
      response.json().then(function(data) {makeNotification(data, self.registration);});
    } else {
      console.error("Failed to fetch unread notifications! This is proly bad!");
    }
  });
  event.waitUntil(notificationPromise);
});

function makeNotification(data, registration) {
  if (data.error) {
    console.error('The API returned an error.', data.error);
    throw new Error();
  }
  data.forEach(function(notification) {
    console.log(notification);
    if(!notification.title) {
      new Error("No title for notification!");
    }
    registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      data: notification
    });
  });
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url).then(function() {
    return fetch('/notifications/read/' + event.notification.data.id, {credentials: 'include'});
  }));
});
