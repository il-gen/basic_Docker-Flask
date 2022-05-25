from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from .config import DevConfig,ProdConfig
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
        

    
    #############SQLAcademy INIT#############
    ##First init db and create Tables if you want
    db.init_app(app)

    
    #############LSESSION INIT#############
    
    sess.init_app(app)
    
    
     #############BLUEPRINTS REGISTER#############     
    
    # blueprint for non-auth routes of app
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

        
    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)
    
    return app



