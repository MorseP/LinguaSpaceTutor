import datetime
from tokenize import String
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from LinguaSpaceTutor import app, db
from werkzeug.security import generate_password_hash,  check_password_hash
from flask_login import LoginManager, UserMixin


class User(db.Model, UserMixin):

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    userlastname: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    role: so.Mapped[str] = so.mapped_column(sa.String(64))
  
    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
	    self.password_hash = generate_password_hash(password)

    def check_password(password_hash,  password):
	    return check_password_hash(password_hash, password)


class Student(db.Model):

    id : so.Mapped[int] = so.mapped_column(primary_key=True)
    stname : so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    stcontact : so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    stlang : so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    stteacher : so.Mapped[int] = so.mapped_column(index=True)

    def __repr__(self):
        return '<Student {}>'.format(self.stname)

class Shedule(db.Model):

    id : so.Mapped[int] = so.mapped_column(primary_key=True)
    date : so.Mapped[datetime.datetime] = so.mapped_column(index=True)
    teacher : so.Mapped[int] = so.mapped_column(index=True)
    student : so.Mapped[int] = so.mapped_column(index=True)
    comment : so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    allows : so.Mapped[bool] = so.mapped_column(sa.Boolean)

    def __repr__(self):
        return '<Shedule {}>'.format(self.date)
