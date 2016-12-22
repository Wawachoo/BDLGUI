from flask import Flask
from . import context
import bdl


app = Flask(__name__)
context = context.Context()


import bdlgui.views_api
import bdlgui.views_gui
