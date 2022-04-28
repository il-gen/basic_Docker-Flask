from flask import Flask,session,flash, send_from_directory, \
    render_template, jsonify, request, redirect, Response,g, current_app,Blueprint, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from sqlalchemy import MetaData
from .config import DevConfig,ProdConfig
import json
import os


db = SQLAlchemy()
sess = Session() 


def create_app():

    # app = Flask(__name__,instance_relative_config=True)
    app = Flask(__name__,instance_relative_config=True)
    config=os.environ.get('FLASK_ENV')
    if config=="production":
        app.config.from_object(ProdConfig())
    elif config=="development":
        app.config.from_object(DevConfig())
    else:
        app.logger.info("FLASK_ENV is NUL!!!");
        
    # @app.before_request
    # def before_request():
    #     # session.sid="flask_111" 
    #     current_app.logger.info(">>>>before_request")
    #     # s=session.copy()
    #     r=request.get_json()
    #     # for attr in dir(session):
    #     #     current_app.logger.info("session.%s = %r" % (attr, getattr(session, attr)))
    #     current_app.logger.info(r)

    #CORS(app)  
    
    #############SQLAcademy INIT#############
    ##First init db and create Tables if you want
    db.init_app(app)

    
    #############LSESSION INIT#############
    
    sess.init_app(app)
    
    
     #############BLUEPRINTS REGISTER#############     
    
    # blueprint for non-auth parts of app
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

        
    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)
    
    return app



