import os
import json
import glob
import time
import threading
import queue
import bdl


class Task:
    def __init__(self, context, name):
        self.context = context
        self.name = name

    def run(self):
        pass


class UpdateTask(Task):
    def __init__(self, context, name, repo_name):
        super().__init__(context, name)
        self.__repo_name = repo_name

    def run(self):
        repository = self.context.repositories[self.__repo_name]
        repository.load()
        repository.update()
        repository.unload()


class ConnectTask(Task):
    def __init__(self, context, name, repo_url, repo_name, repo_path, repo_template):
        super().__init__(context, name)
        self.__repo_url = repo_url
        self.__repo_name = repo_name
        self.__repo_path = reop_path
        self.__repo_template = repo_template

    def run(self):
        repository = bdl.repository.connect(url=self.__repo_url, name=self.__repo_name, path=self.__repo_path)
        repository.load()
        if self.__repo_template is not None and len(self.__repo_template) > 0:
            repository.rename(template=self.__repo_template)
        repo.unload()


class Context:

    def __init__(self, cfgfile="config.json"):
        self.__lock = threading.Lock()
        # Notifications.
        self.__notifications = {"errors": [], "warnings": [], "infos": []}
        self.__notif_id = 0
        # Configuration.
        self.__config = {}
        self.__cfgfile = cfgfile
        self.__load_config()
        # Tasks.
        self.__tasks_thread = None
        self.__tasks_current = ""
        self.__tasks_queue = queue.Queue()
        self.__tasks_names = []
        # Repositories.
        self.__repositories = {}
        bdl.engine.preload()
        # Start tasks manager.
        self.__tasks_thread = threading.Thread(target=self.__tasks_manager,
                                               name="tasks_manager")
        self.__tasks_thread.start()


    def __load_config(self):
        with open(self.__cfgfile, 'r') as fd:
            self.__config = json.load(fd)
        for key, test in [("path", os.path.isdir), ]:
            if key not in self.__config:
                self.notify("errors", "Missing configuration key: {}".format(key))
            elif test(self.__config[key]) is not True:
                self.notify("errors", "Invalid configuration key: {}".format(key))

    def __refresh_repositories(function):
        def wrapper(self, *args, **kwargs):
            self.load_repositories()
            return function(self, *args, **kwargs)
        return wrapper

    def __tasks_manager(self):
        while True:
            task = self.__tasks_queue.get(block=True)
            with self.__lock:
                self.__tasks_current = task.name
                self.notify("infos", "starting task for repository: {}".format(task.name))
            try:
                notify_level = "infos"
                notify_message = "task finished for repository: {}".format(task.name)
                task.run()
            except Exception as error:
                notify_level = "errors"
                notify_message = "task failed for repository: {}: {}".format(task.name, str(error))
            finally:
                with self.__lock:
                    self.notify(notify_level, notify_message)
                    self.__tasks_names.remove(task.name)

    # =========================================================================
    # NOTIFICATIONS API
    # =========================================================================

    def notify(self, level, message):
        self.__notif_id += 1
        level = level.lower()
        if level in self.__notifications:
            self.__notifications[level].append({
                "id": self.__notif_id,
                "time": time.strftime("%d/%m/%y - %H:%M:%S"),
                "message": message
            })

    def delete_notification(self, notification_id):
        for category, notifications in self.__notifications.items():
            for notif in notifications:
                if notif["id"] == int(notification_id):
                    notifications.remove(notif)
                    return

    @property
    def errors(self):
        return self.__notifications["errors"]

    @property
    def warnings(self):
        return self.__notifications["warnings"]

    @property
    def infos(self):
        return self.__notifications["infos"]

    # =========================================================================
    # REPOSITORIES API
    # =========================================================================

    def load_repositories(self):
        if "path" not in self.__config:
            return
        # Find repositories.
        paths = []
        for path in glob.glob(os.path.join(self.__config["path"], '*')):
            if os.path.isdir(os.path.join(path, ".bdl")):
                paths.append(path)
        # Load repositories.
        for path in paths:
            name = os.path.basename(path)
            if name not in self.__repositories:
                try:
                    repo = bdl.repository.Repository(path=path)
                    self.__repositories[name] = repo
                except Exception:
                    raise

    def update_repository(self, name):
        if name in self.__repositories:
            with self.__lock:
                if name not in self.__tasks_names:
                    self.__tasks_names.append(name)
                    self.__tasks_queue.put(UpdateTask(name=name,
                                                      context=self,
                                                      repo_name=name))

    def stop_repository(self, name):
        with self.__lock:
            if name in self.__repositories:
                if self.__tasks_current == name:
                    self.__repositories[name].stop()
                else:
                    self.__tasks_names.remove(name)

    @property
    @__refresh_repositories
    def repositories(self):
        """Return all exisintg repositories.
        """
        return self.__repositories

    @property
    @__refresh_repositories
    def not_running(self):
        repositories = {}
        for name, repository in self.__repositories.items():
            if name not in self.__tasks_names:
                repositories[name] = repository
        return repositories

    @property
    def running(self):
        """Return all repository marked as 'running'.
        """
        repositories = {}
        for name in self.__tasks_names:
            repositories[name] = self.__repositories[name]
        return repositories
