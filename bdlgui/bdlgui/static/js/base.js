window.setInterval(function() {
  setNotificationsCount();
}, 2000);


/**
 * Set the notifications count.
 */
function setNotificationsCount() {
  notificationsCount = $("#navBar #notificationsCount");
  $.getJSON("/api/notifications/errors", function(response){
    count = response["notifications"].length;
    if (count == 1)
      notificationsCount.html(count + " error");
    else if (count > 1)
      notificationsCount.html(count + " errors");
  });
}
