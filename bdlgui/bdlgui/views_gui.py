from bdlgui import app, context
from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
import bdl


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/repos/")
def gui_repos(methods=["GET", ]):
    return render_template("repositories.html")


@app.route("/repos/<name>/")
def gui_repo(name, methods=["GET", ]):
    return render_template("repository.html", name=name)


@app.route("/add/")
def gui_add(methods=["GET", ]):
    engines = [(site, bdl.engine.by_name[[nrx.engine_name for nrx in names][0]]) for site, names in bdl.engine.by_netloc.items()]
    return render_template("add.html", engines=engines)


@app.route("/notifications/")
def gui_notifications(methods=["GET", ]):
    return render_template("notifications.html")
