from tokenize import String

from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, PasswordField, DateTimeField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo, Length

class LoginForm(FlaskForm):
    login = StringField('Логін :', validators=[DataRequired()])
    pswd = PasswordField('Пароль:', validators=[DataRequired(), Length(min=8, max=100)])
    remember = BooleanField('Запам`ятати', default=False)
    submit = SubmitField('Увійти')

class RegistrForm(FlaskForm):
    email = StringField('Email :', validators=[Email(), DataRequired()])
    login = StringField('Логін :', validators=[DataRequired()])
    lastname = StringField('ПІБ :', validators=[DataRequired()])
    pswd = PasswordField('Пароль:', validators=[DataRequired(), Length(min=8, max=100)])
    pswd2 = PasswordField('Повторіть Пароль:', validators=[DataRequired(), Length(min=8, max=100), EqualTo('pswd')])
    submit = SubmitField('Зареєструватись')

class SheduleForm(FlaskForm):
    date = DateTimeField('Дата/Час :', validators=[DataRequired()])
    tutor = SelectField('Учень :', validators=[DataRequired()])
    comment = StringField('Коментар :', validators=[DataRequired()])