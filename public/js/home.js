function renderPushes(response) {
  var pushlist = $(".pushlist");
  if(response.status == 200) {
    response.json().then(function(data) {
      data.forEach(function(notification) {
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
    });
  } else {
    console.log("Something's wrong with the response:", response);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var pushlist = $(".pushlist");
  fetch('/notifications/list', {credentials: 'include'}).then(renderPushes);
});
