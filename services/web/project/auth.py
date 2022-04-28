from flask import Blueprint, render_template,current_app, redirect, url_for, request, flash, session
from .models import User
from . import db

auth = Blueprint('auth', __name__)





@auth.route('/signup')
def signup():
    return render_template('signup.html')


@auth.route('/signup', methods=['POST'])
def signup_post():
    email = request.form.get('email')
    name = request.form.get('name')
    surname = request.form.get('surname')
    password = request.form.get('password')
    user = db.session.query(User).filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if user: # if a user is found, we want to redirect back to signup page so user can try again
        flash('Email address already exists')
        return redirect(url_for('auth.signup'))

    # create new user with the form data. Hash the password so plaintext version isn't saved.
    #Set name anf Email
    new_user = User(email=email, name=name,surname=surname)
    #Set password which is hash version
    new_user.set_password(password)

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('main.dashboard'))

