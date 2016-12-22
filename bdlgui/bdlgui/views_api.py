from bdlgui import app, context
from flask import Flask, render_template, request, jsonify
import glob
import os
import bdl


@app.route("/api/repos/")
def api_repos(methods=["GET", ]):
    response = {"repositories": []}
    for name, _ in context.repositories.items():
        response["repositories"].append(name)
    return jsonify(**response)


@app.route("/api/repos/<name>/")
@app.route("/api/repos/<name>/config/")
def api_repos_config(name, methods=["GET", ]):
    response = {}
    repository = context.repositories.get(name, None)
    if repository is not None:
        repository.load()
        response[name] = repository.get_config()
        repository.unload()
    return jsonify(**response)


@app.route("/api/repos/<name>/status/")
def api_repos_status(name, methods=["GET", ]):
    response = {}
    # repository = context.repositories.get(name, None)
    repository = context.not_running.get(name, None)
    if repository is not None:
        repository.load()
        response[name] = repository.get_status()
        repository.unload()
    return jsonify(**response)


@app.route("/api/repos/<name>/progress/")
def api_repos_progress(name, methods=["GET", ]):
    response = {}
    repository = context.repositories.get(name, None)
    if repository is not None:
        response[name] = repository.get_progress()
    return jsonify(**response)


@app.route("/api/repos/<name>/update/")
def api_repos_update(name, methods=["POST", "GET"]):
    context.update_repository(name)
    return jsonify(**{})


@app.route("/api/repos/<name>/stop/")
def api_repos_stop(name, methods=["POST", "GET"]):
    context.stop_repository(name)
    return jsonify(**{})


@app.route("/api/connect/")
def api_connect(methods=["POST", "GET"]):
    url = request.args.get("url", None)
    name = request.args.get("name", None)
    template = request.args.get("template", None)
    print("URL to connect: {}".format(url))
    print("Connect as: {}".format(name))
    print("Connect template: {}".format(template))
    return jsonify(**{})


@app.route("/api/engines/")
def api_engines(methds=["POST", "GET"]):
    return jsonify(**{"engines": bdl.engine.by_name})


@app.route("/api/notifications/<category>/")
def api_notifications(category, methods=["POST", "GET"]):
    response = {"notifications": []}
    notifications = getattr(context, category, None)
    if notifications is not None:
        for notif in notifications:
            response["notifications"].append(notif)
    return jsonify(**response)


@app.route("/api/notifications/<category>/<notif_id>/delete/")
def api_notifications_delete(category, notif_id, methods=["POST", "GET"]):
    context.delete_notification(notif_id)
    return jsonify(**{})
