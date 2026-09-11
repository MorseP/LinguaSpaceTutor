"""
The flask application package.
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

app = Flask(__name__)
app.secret_key = '7835A3B101A3BA927A911EC77D2330621842989DD47EC9169B13525B76EA15B2'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///LSTutor.db'
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = 'login'
login_manager.login_message_category = 'info'


import LinguaSpaceTutor.views
import LinguaSpaceTutor.dbModule
import LinguaSpaceTutor.forms

with app.app_context():  
        db.create_all()

