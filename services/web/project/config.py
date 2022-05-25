import os
import redis
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))


    
class Config(object):
    """Base config vars."""
    ROOT_PATH = basedir
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STATIC_FOLDER = f"{os.getenv('APP_FOLDER')}/project/static"
    
   
    SESSION_TYPE='redis'
    SESSION_KEY_PREFIX = "flask_"
    PERMANENT_SESSION_LIFETIME= timedelta(days=1)
    SESSION_PERMANENT=False
    SESSION_USE_SIGNER=True
    SESSION_REDIS = redis.from_url(f"{os.environ.get('REDIS_URL')}")
    
   

class ProdConfig(Config):
    DEBUG = False
    TESTING = False
    LOGIN_DISABLED = False
class DevConfig(Config):
    DEBUG = True
    TESTING = True
    LOGIN_DISABLED = False 
