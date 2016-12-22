/**
 * Set a repository status.
 * @param {repoName} Repository name.
 */
function setRepositoryStatus(repoName) {
  var repository = $("#" + repoName);
  var reachable = repository.find("#status #reachable");
  var indexed = repository.find("#status #indexed");
  var newcount = repository.find("#status #new");
  $.getJSON("api/status", {"name": repoName}, function(status) {
      // Set reachability
      if (status[repoName].reachable) {
        reachable.attr("class", "label label-success");
        reachable.html("Online");
      }
      else {
        reachable.attr("class", "label label-warning");
        reachable.html("Offline");
      }
      // Set indexed count
      indexed.attr("class", "label label-primary");
      indexed.html(status[repoName].indexed + " indexed");
      // Set new count
      newcount.html(status[repoName].new + " new");
      if (status[repoName].new > 0)
        newcount.attr("class", "label label-success");
      else
        newcount.attr("class", "label label-primary");
  });
}


/**
 * Set a repository progress.
 * @param {repoName} Repository name.
 */
function setRepositoryProgress(repoName) {
  var repository = $("#" + repoName);
  var progressValue = repository.find("#progress #progressbar");
  $.getJSON("api/progress", {"name": repoName}, function(progress) {
    progressValue.attr("aria-valuenow", progress[repoName].percentage);
    var text="";
    if (progress[repoName].name)
      text += progress[repoName].name;
    text += "(" + progress[repoName].percentage + "%)";
    progressValue.html(progress[repoName].name);
  });
}


/**
 * Update a repository.
 * @param {repoName} Repository name.
 */
function updateRepository(repoName) {
  var repository = $("#" + repoName);
  $.getJSON("api/update", {"name": repoName});
}
