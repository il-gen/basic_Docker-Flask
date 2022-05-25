from flask.cli import FlaskGroup
from project import db,create_app
from project.models import User

app=create_app()
cli = FlaskGroup(app)
def drop_everything(db):
    """(On a live db) drops all foreign key constraints before dropping all tables.
    Workaround for SQLAlchemy not doing DROP ## CASCADE for drop_all()
    (https://github.com/pallets/flask-sqlalchemy/issues/722)
    """
    import sqlalchemy
    from sqlalchemy.schema import DropConstraint, DropTable, MetaData, Table

    con = db.engine.connect()
    trans = con.begin()
    inspector = sqlalchemy.inspect(db.engine)

    # We need to re-create a minimal metadata with only the required things to
    # successfully emit drop constraints and tables commands for postgres (based
    # on the actual schema of the running instance)
    meta = MetaData()
    tables = []
    all_fkeys = []

    for table_name in inspector.get_table_names():
        fkeys = []

        for fkey in inspector.get_foreign_keys(table_name):
            if not fkey["name"]:
                continue

            fkeys.append(db.ForeignKeyConstraint((), (), name=fkey["name"]))

        tables.append(Table(table_name, meta, *fkeys))
        all_fkeys.extend(fkeys)

    for fkey in all_fkeys:
        con.execute(DropConstraint(fkey))

    for table in tables:
        con.execute(DropTable(table))

    trans.commit()
@cli.command("create_db")
def create_db():
    drop_everything(db)
    db.drop_all(app=app)
    db.create_all(app=app)
    db.session.commit()

@cli.command("seed_db")
def seed_db():
    new_user1=User(email="a@a",name="Marcus",surname="Brutus")
    new_user1.set_password("a")
    new_user2=User(email="b@b",name="Elon",surname="Masks" )
    new_user2.set_password("b")
    new_user3=User(email="c@c",name="Bill",surname="Roads")
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

