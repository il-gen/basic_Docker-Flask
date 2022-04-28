import os
import redis
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))


    
class Config(object):
    """Base config vars."""
    ROOT_PATH = basedir
    SECRET_KEY = '9OLWxND4o83j4Kty567pO'
    ADM_USERNAME = 'admin'
    ADM_PASSWORD = 'default'
    #SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite?check_same_thread=False')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STATIC_FOLDER = f"{os.getenv('APP_FOLDER')}/project/static"
    
   
    SESSION_TYPE='redis'
    SESSION_KEY_PREFIX = "flask_"
    PERMANENT_SESSION_LIFETIME= timedelta(days=1)
    SESSION_PERMANENT=False
    SESSION_USE_SIGNER=True
    #not use localhost or 0.0.0.0 in container
    SESSION_REDIS = redis.from_url(f"{os.environ.get('REDIS_URL')}")
    
   

class ProdConfig(Config):
    DEBUG = False
    TESTING = False
    LOGIN_DISABLED = False
class DevConfig(Config):
    DEBUG = True
    TESTING = True
    LOGIN_DISABLED = False 
#    SESSION_TYPE = environ.get('SESSION_TYPE')
