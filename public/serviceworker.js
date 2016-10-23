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
  } else if(data.signed_in === false) {
    registration.showNotification("You've been signed out of easy push!", {
      body: "Click here to sign back in.",
      tag: 'easypush-signout',
      data: {
        url: "/settings"
      }
    });
  } else {
    data.forEach(function(notification) {
      console.log(notification);
      if(!notification.title) {
        new Error("No title for notification!");
      }
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        data: notification,
        tag: 'easypush-' + notification.id
      });
    });
  }
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var windowOpen = new Promise(function(resolve, reject) { resolve(); });
  if(event.notification.data.url || event.notification.data.url !== null) {
    windowOpen = clients.openWindow(event.notification.data.url);
  } else {
    windowOpen = clients.openWindow('/notifications/' + event.notification.data.id);
  }
  event.waitUntil(windowOpen.then(function() {
    return fetch('/notifications/read/' + event.notification.data.id, {credentials: 'include'});
  }));
});
