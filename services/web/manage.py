from flask.cli import FlaskGroup
from project import db,create_app
from project.models import User

app=create_app()
cli = FlaskGroup(app)

@cli.command("create_db")
def create_db():
    db.drop_all(app=app)
    db.create_all(app=app)
    db.session.commit()

@cli.command("seed_db")
def seed_db():
    new_user1=User(email="a@a",name="ilyas",surname="Gnl")
    new_user1.set_password("a")
    new_user2=User(email="b@b",name="ali",surname="Genç" )
    new_user2.set_password("b")
    new_user3=User(email="c@c",name="ahmet",surname="Bilir")
    new_user3.set_password("c")
    db.session.add(new_user1)
    db.session.add(new_user2)
    db.session.add(new_user3)
    db.session.commit()

@cli.command("explore_data")
def explore_data():
    #############To explore the data in your application#############/$flask shell/ command used
    @app.shell_context_processor
    def make_shell_context():
        return {'db': db}
    
if __name__ == "__main__":
    cli()

