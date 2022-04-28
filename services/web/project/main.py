from flask import Blueprint, render_template, redirect, url_for, request,current_app,flash,jsonify, session
from flask import jsonify, send_from_directory
from . import db


main = Blueprint('main', __name__)





@main.route("/")
def index():
    return redirect(url_for('main.dashboard'))



@main.route("/dashboard")
def dashboard():
    return render_template("dashboard.html",menu=True)



@main.route("/static/<path:filename>")
def staticfiles(filename):
    return send_from_directory(main.config["STATIC_FOLDER"], filename)


