 window.setInterval(function() {
   setRepositoriesProgress();
   setOutdatedCount();
   setActionsCount();
 }, 1000);


 window.onload = function() {
   setRepositoriesList();
   setRepositoriesCount();
 };


/**
 * Set the repositories count.
 */
function setRepositoriesCount() {
  var repositoriesCount = $("#repositoriesCount");
  $.get("/api/repos", function(json) {
    count = Number(json["repositories"].length);
    if (count > 0)
      repositoriesCount.html(count + " repositories");
    else
      repositoriesCount.html(count + " repository");
  });
}


/**
 * Set the outdated repositories count.
 */
function setOutdatedCount() {
  var outdatedCount = $("#outdatedCount");
  var currents = $("#repositoriesList").find("tr");
  var count = 0;
  currents.each(function(row) {
    if (row > 0) {
      var count_str = $(currents[row]).find("#status #new").html();
      var count_num = Number(count_str.split(' ')[0]);
      if (! isNaN(count_num) && count_num > 0)
        count++;
      }
    });
  if (count > 0)
    outdatedCount.html(count + " repositories outdated");
  else
    outdatedCount.html(count + " repository outdated");
}


/**
 * Set the actions count.
 */
function setActionsCount() {
  var actionsCount = $("#actionsCount");
  var stopAllButton = $("#stopAllButton");
  var currents = $("#repositoriesList").find("tr");
  var count = 0;
  currents.each(function(row) {
    if (row > 0) {
      isDisable = Boolean($(currents[row]).find("#actions #stop").attr("disabled"));
      if (!isDisable)
        count++
    }
  });
  if (count > 0) {
    actionsCount.html(count + " actions in progress");
    stopAllButton.removeAttr("disabled");
  }
  else {
    actionsCount.html(count + " action in progress");
    stopAllButton.attr("disabled", "");
  }
}


/**
 * Set the list of available repositories.
 */
function setRepositoriesList() {
  var repositoriesList = $("#repositoriesList");
  var rowTemplate = $($($("#repositoriesList #rowTemplate").html().trim()).last());
  $.get("/api/repos", function(response) {
    for (var i in response["repositories"]) {
      var repository = response["repositories"][i];
      // Skip if item already exists.
      if (repositoriesList.find("#" + repository).length < 1) {
        var row = $(rowTemplate).clone();
        // ID and name.
        row.attr("id", repository);
        //row.find("#name #link").attr("href", "/repos/" + repository);
        row.find("#name #link").attr("href", "#");
        row.find("#name #link").html(repository);
        //row.find("#site").html(repository["site"]);
        // Actions.
        row.find("#actions #update").attr("onclick", "updateRepository(\"" + repository + "\");");
        row.find("#actions #refresh").attr("onclick", "setRepositoryStatus(\"" + repository + "\");");
        row.find("#actions #stop").attr("onclick", "stopRepository(\"" + repository + "\");");
        // Insert new row.
        repositoriesList.append(row);
      };
    }
  });
}

/**
 * Remove the respositories which doesn't exists anymore.
 */
function unsetRepositoriesList() {
  $.get("/api/repos", function(response){
    var currents = $("#repositoriesList").find("tr");
    //console.log(response);
    currents.each(function(row) {
      if (row > 0) {
        if (! currents[row].id in response["repositories"]){
          currents[row].remove();
        }
      }
    });
  });
}


/**
 * Set all repositories status.
 */
function setRepositoriesStatus(name=null) {
  var currentsRepositories = $("#repositoriesList").find("tr");
  currentsRepositories.each(function(row){
    if (row > 0) {
      repository = $(currentsRepositories[row]);
      setRepositoryStatus(repository.attr("id"));
    }
  });
}

/**
 * Set a repository status.
 */
function setRepositoryStatus(name) {
  $.getJSON("/api/repos/" + name + "/status", function(response) {
    if (name in response) {
      var repository = $("#repositoriesList #" + name)
      var site = repository.find("#site");
      var reachable = repository.find("#status #reachable");
      var indexed = repository.find("#status #indexed");
      var newcount = repository.find("#status #new");
      // Update site.
      site.html(response[name]["site"])
      // Update reachability.
      if (response[name]["reachable"]) {
        reachable.attr("class", "label label-success");
        reachable.html("Online");
      }
      else {
        reachable.attr("class", "label label-warning");
        reachable.html("Offline");
      }
      // Update indexed count.
      indexed.attr("class", "label label-primary");
      indexed.html(response[name]["indexed"] + " indexed");
      // Update new count.
      newcount.html(response[name]["new"] + " new");
      if (response[name]["new"] > 0)
        newcount.attr("class", "label label-success");
      else
        newcount.attr("class", "label label-primary");
    }
  });
}


/**
 * Set all repositories progress and actions buttons state.
 */
function setRepositoriesProgress(name=null) {
  var currentsRepositories = $("#repositoriesList").find("tr");
  currentsRepositories.each(function(row){
    if (row > 0) {
      repository = $(currentsRepositories[row]);
      setRepositoryProgress(repository.attr("id"));
    }
  });
}


/**
 * Set a repository progress and action buttons state.
 */
function setRepositoryProgress(name) {
  $.getJSON("/api/repos/" + name + "/progress", function(response) {
    if (name in response) {
      var repository = $("#repositoriesList #" + name);
      var progressbar = repository.find("#progressbar");
      var actionUpdate = repository.find("#actions #update");
      var actionRefresh = repository.find("#actions #refresh");
      var actionStop = repository.find("#actions #stop");
      // Set progress bar and refresh status after action completion.
      if (response[name]["name"])
        progressbar.attr("aria-valuenow", response[name]["percentage"]).css("width", response[name]["percentage"] + '%');
      else {
        if (progressbar.attr("aria-valuenow") > 0)
          setRepositoryStatus(name);
        progressbar.attr("aria-valuenow", 0).css("width", '0' + '%');
      }
      // Set action buttons.
      if (response[name]["name"]) {
        actionUpdate.attr("disabled", "");
        actionRefresh.attr("disabled", "");
        actionStop.removeAttr("disabled");
      }
      else {
        actionUpdate.removeAttr("disabled");
        actionRefresh.removeAttr("disabled");
        actionStop.attr("disabled", "");
      }
    }
  });
}


/**
 * Update a repository.
 */
function updateRepository(name) {
  $.getJSON("/api/repos/" + name + "/update");
}


/**
 * Stop all actions.
 */
function stopRepositories() {
  var actionsCount = $("#actionsCount");
  var currents = $("#repositoriesList").find("tr");
  var count = 0;
  currents.each(function(row) {
    if (row > 0) {
      isDisable = Boolean($(currents[row]).find("#actions #stop").attr("disabled"));
      if (!isDisable)
        stopRepository($(currents[row]).attr("id"));
    }
  });
}


/**
 * Stop a repository action.
 */
function stopRepository(name) {
  $.getJSON("/api/repos/" + name + "/stop");
}
