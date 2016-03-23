function renderPushes(response) {
  var pushlist = $(".pushlist");
  if(response.status == 200) {
    response.json().then(function(data) {
      data.notifications.forEach(function(notification) {
        var item = $("<div>").addClass('item');
        var img = $("<img>").attr('src', notification.icon).addClass('ui').addClass('image').addClass('icon');
        if(notification.icon === null) {
          img.attr('src', '/images/no-icon.png');
        }
        var content = $("<div>").addClass('content');
        var header = $("<a>").addClass("header").text(notification.title).attr('href', notification.url);
        var description = $("<div>").addClass("description").text(notification.body);
        var timestamp = $("<span>").text(notification.createdAt).addClass('timestamp').livestamp(notification.createdAt);
        description.append(" ").append(timestamp);
        content.append(header).append(description);
        item.append(img).append(content);
        pushlist.append(item);
      });
      if(data.notifications.length > 0) {
        $("<div>").waypoint({
          handler: function() {
            var page = parseInt(data.page)+1;
            if(window.currentPage < page) {
              fetch('/notifications/list/' + page, {credentials: 'include'}).then(renderPushes);
              window.currentPage++;
              console.log(this);
            }
          }
        });
      }
    });
  } else {
    console.log("Something's wrong with the response:", response);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.currentPage = 0;
  var pushlist = $(".pushlist");
  fetch('/notifications/list', {credentials: 'include'}).then(renderPushes);
});
