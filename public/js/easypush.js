var isPushEnabled = false;

window.addEventListener('load', function() {
  var pushButton = document.querySelector('.enable-push');
  pushButton.addEventListener('click', function() {
    if (isPushEnabled) {
      unsubscribe();
    } else {
      subscribe();
    }
  });

  // Check that service workers are supported, if so, progressively
  // enhance and add push messaging support, otherwise continue without it.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js').then(initializeState);
  } else {
    console.warn('Service workers aren\'t supported in this browser.');
  }
  updateSubscriptionList();
});

// Once the service worker is registered set the initial state
function initializeState() {
  var pushButton = document.querySelector('.enable-push');
  // Are Notifications supported in the service worker?
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.warn('Notifications aren\'t supported.');
    return;
  } else {
    console.debug('Notifications are supported');
  }

  // Check the current Notification permission.
  // If its denied, it's a permanent block until the
  // user changes the permission
  if (Notification.permission === 'denied') {
    console.warn('The user has blocked notifications.');
    return;
  } else {
    console.debug('Notifications have not been blocked');
  }

  // Check if push messaging is supported
  if (!('PushManager' in window)) {
    console.warn('Push messaging isn\'t supported.');
    return;
  } else {
    console.debug('Push messaging is supported!');
    pushButton.textContent = "Loading...";
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription().then(function(subscription) {
        // Enable any UI which subscribes / unsubscribes from
        // push messages.
        pushButton.disabled = false;

        if (!subscription) {
          pushButton.textContent = "Enable";
          return;
        }

        // Keep your server in sync with the latest subscriptionId
        console.log(subscription);

        // Set your UI to show they have subscribed for
        // push messages
        pushButton.textContent = 'Disable';
        isPushEnabled = true;
      })
      .catch(function(err) {
        console.warn('Error during getSubscription()', err);
      });
  });
}


function subscribe() {
  // Disable the button so it can't be changed while
  // we process the permission request
  var pushButton = document.querySelector('.enable-push');
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
      .then(function(subscription) {
        // The subscription was successful
        isPushEnabled = true;
        pushButton.textContent = 'Disable';
        pushButton.disabled = false;

        // TODO: Send the subscription.endpoint to your server
        // and save it to send a push message at a later date
        return sendSubscriptionToServer(subscription);
      }).catch(function(e) {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          console.warn('Permission for Notifications was denied');
          pushButton.disabled = true;
        } else {
          // A problem occurred with the subscription; common reasons
          // include network errors, and lacking gcm_sender_id and/or
          // gcm_user_visible_only in the manifest.
          console.error('Unable to subscribe to push.', e);
          pushButton.disabled = false;
          pushButton.textContent = 'Enable';
        }
      });
  });
}

function unsubscribe() {
  var pushButton = document.querySelector('.enable-push');
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.getSubscription().then(
      function(pushSubscription) {
        // Check we have a subscription to unsubscribe
        if (!pushSubscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          isPushEnabled = false;
          pushButton.disabled = false;
          pushButton.textContent = 'Enable';
          return;
        }

        var subscriptionId = pushSubscription.subscriptionId;
        // TODO: Make a request to your server to remove
        // the subscriptionId from your data store so you
        // don't attempt to send them push messages anymore

        // We have a subscription, so call unsubscribe on it
        pushSubscription.unsubscribe().then(function(successful) {
          pushButton.disabled = false;
          pushButton.textContent = 'Enable';
          isPushEnabled = false;
        }).catch(function(e) {
          // We failed to unsubscribe, this can lead to
          // an unusual state, so may be best to remove
          // the users data from your data store and
          // inform the user that you have done so

          console.log('Unsubscription error: ', e);
          pushButton.disabled = false;
          pushButton.textContent = 'Enable';
        });
      }).catch(function(e) {
        console.error('Error thrown while unsubscribing from push messaging.', e);
      });
  });
}

function sendSubscriptionToServer(subscription) {
  console.log("sendSubscriptionToServer", subscription);
  $.post('/settings/subscribe', subscription.toJSON());
}

function updateSubscriptionList() {
  $.get('/settings/subscriptions', function(subscriptions) {
    $(".subscriptions").empty();
    subscriptions.forEach(function(subscription) {
      $(".subscriptions").append($("<tr>").append($("<td>").text(subscription.registration_id)));
    });
  });
}
