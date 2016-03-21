function renderPushes(response) {
  var pushlist = $(".pushlist");
  if(response.status == 200) {
    response.json().then(function(data) {
      data.forEach(function(notification) {
        var push = $("<li>")
          .append($("<h2>").text(notification.title))
          .append($("<p>").text(notification.body));
        pushlist.append(push);
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
