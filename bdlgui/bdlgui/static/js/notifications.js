window.onload = function() {
  setNotificationsAlerts();
};


function setNotificationsAlerts() {
  var errorBlock = $("#ErrorsPanel #panelContent");
  var warningBlock = $("#WarningsPanel #panelContent");
  var infoBlock = $("#InfosPanel #panelContent");
  var alertTemplate = $($($("#alertTemplate").html().trim()).last());

  function handle(response, alertClass, notifBlock) {
    for (var i in response["notifications"]) {
      var notification = response["notifications"][i];
      //var alertTemplate = $($($(notifTemplate).html().trim()).last());
      var newAlert = $(alertTemplate).clone();
      newAlert.attr("id", notification["id"]);
      newAlert.find("#time").html(notification["time"]);
      newAlert.find("#message").html(notification["message"]);
      newAlert.find("#closeButton").attr("onclick", "deleteNotification(" + notification["id"] + ");");
      newAlert.attr("class", alertClass);
      notifBlock.append(newAlert);
    }
  }

  // Set errors alerts.
  $.getJSON("/api/notifications/errors", {}, function(response){handle(response, "alert alert-danger alert-dismissible", errorBlock)});
  $.getJSON("/api/notifications/warnings", {}, function(response){handle(response, "alert alert-warning alert-dismissible", warningBlock)});
  $.getJSON("/api/notifications/infos", {}, function(response){handle(response, "alert alert-info alert-dismissible", infoBlock)});
}


function deleteNotification(notif_id) {
  $.getJSON("/api/notifications/_/" + notif_id + "/delete")
}
