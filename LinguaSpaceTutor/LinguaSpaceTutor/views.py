
from datetime import datetime, timedelta
from email import message
from time import strptime
from turtle import title
from typing import Required
from flask import redirect, render_template, request
from sqlalchemy import true
from sqlalchemy.sql.functions import user
from LinguaSpaceTutor import app, db, login_manager
from LinguaSpaceTutor.dbModule import Shedule, Student, User
from flask_login import LoginManager, UserMixin, login_required, current_user, login_user, logout_user
from LinguaSpaceTutor.forms import LoginForm, RegistrForm
from werkzeug.security import generate_password_hash,  check_password_hash

language = [{'name' : 'Англійська'},
            {'name' : 'Німецька'}]

tutors = []

@login_manager.user_loader
def load_user(user_id):
    return db.session.query(User).get(user_id)


# Форма реєстрації
@app.route('/registr', methods=['POST', 'GET'])
def registr():
    tp = 'registr' 
    form = RegistrForm()

    if form.validate_on_submit():

        us_add = User(username = form.login.data, userlastname = form.lastname.data, email = form.email.data, password_hash = generate_password_hash(form.pswd.data), role = 'tutor')

        try:
            db.session.add(us_add)
            db.session.commit()
            return redirect('/login')
        except:
            message('Oops! Something wrong')


    return render_template('login.html', 
                           form=form, 
                           tp=tp)

# Форма входа
@app.route('/login', methods=['POST', 'GET'])
def login():

  #  if current_user.is_autenticated:
  #     return redirect('/')

      tp = 'login'

      form = LoginForm()
      if form.validate_on_submit():
          us = db.session.query(User).filter(User.username == form.login.data).first()
          if us and User.check_password(us.password_hash, form.pswd.data):
              login_user(us, remember=form.remember.data)
              return redirect('/')

      return render_template('login.html', 
                             form=form,
                             tp=tp)

#LogOut
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/login')

      
# Формуємо сторінку розкладу

@app.route('/')
@app.route('/home')
@login_required
def home():
   
    if not tutors : 
        tutor = db.session.query(User).with_entities(User.id, User.userlastname).all()

        for t in tutor :
            tutors.append({'id' : t.id,
                           'name' : t.userlastname,
                           'active' : 'false'})

    # отримуємо аргументи з адреси
    tut = request.args.get('t')
    
    # Підготовка активного викладача

    if not tut or current_user.role == 'tutor' : 
        tut = current_user.id

    for t in tutors :
        if t['id'] == int(tut) :
            t['active'] = 'true'
        else : 
            t['active'] = 'false'

    # Запрос розладу з бази даних
    today = datetime.fromisoformat(datetime.now().strftime('%Y-%m-%d'))

    sh = db.session.query(Shedule).where(Shedule.date >= today, Shedule.teacher == int(tut))
    res = db.session.scalars(sh).all()

    st = db.session.query(Student).all()

    # Обробка результату запита, формування масива данних
    ress = []
    for re in res:
        if re.allows == False :
             ress.append({'date' : re.date.strftime('%A'),
                          'hour' : int(re.date.strftime('%H')),
                          'time' : re.date.strftime('%H:%M'),
                          'allow' : re.allows})
        else:
            for tt in st :
                if tt.id == re.student :
                    ress.append({'date' : re.date.strftime('%A'),
                                 'hour' : int(re.date.strftime('%H')),
                                 'time' : re.date.strftime('%H:%M'),
                                 'student' : tt.stname,
                                 'comm' : re.comment,
                                 'allow': re.allows})

    
    # Формування таблиці розкладу
    dates = []
    times = []
    for i in range(0, 7, +1):
        date = datetime.now() + timedelta(days=i)
        dates.append({'day' : date.strftime('%A'),
              'count' : date.strftime('%d.%m') })

    for i in range(0, 12, +1):
        times.append({'hour' : 9 + i})

    
        
    return render_template(
        'index.html',
        title='Lingua Space Tutor',
        year=datetime.now().year,
        dates = dates,
        times = times,
        tutors = tutors,
        active_tut = tut,
        ress = ress,
        role = current_user.role,
        name = current_user.userlastname
    )


# Додавання/Редагування записів розкладу
@app.route('/add', methods=['POST', 'GET'])
@login_required
def add():
    time = request.args.get('time')
    date = request.args.get('date')
    tut = request.args.get('t')

    comment = ''
    message =''
    disabled = True

    onestring = f"{date}.2026 {time}:00"
    date_object = datetime.strptime(onestring, "%d.%m.%Y %H:%M")

    ex = db.session.query(Shedule).where(Shedule.date >= date_object, Shedule.date <= date_object + timedelta(hours = 1), Shedule.teacher == int(tut)).first()

    if ex:
        comment = ex.comment
        disabled = ex.allows

    st = db.session.query(Student).all()

    if request.method == 'POST' :
        
        if not request.form.get('block')  :
            disabled = True
            if ex and current_user.role == 'tutor':
                db.session.delete(ex)
                db.session.commit()
                return redirect('/home?t=',tut)
            else:
                tim = request.form.get('date')
                stud = request.form.get('student')
                comm = request.form.get('message')
        else:
            disabled = False
            tim = request.form.get('date')
            if current_user.role == 'tutor' :
                stud = 1
                comm = ''
            else:
                stud = request.form.get('student')
                comm = request.form.get('message')
       

           
        dt = datetime.fromisoformat(tim)

         
        if ex:
             ex.date = dt
             ex.student = int(stud)
             for tutor in tutors :
                 if tutor['active'] == 'true' :
                     ex.teacher = int(tutor['id'])
             ex.comment = comm

             db.session.commit()

             return redirect('/home?t=',tut)

        else:
                       
            for tutor in tutors :
                if tutor['active'] == 'true' :
                    for studn in st :
                        if studn.id == int(stud) :
                            shed = Shedule(date = dt, student = int(studn.id), teacher = int(tutor['id']), comment = comm, allows = disabled)
                       
                    try:
                        db.session.add(shed)
                        db.session.commit()
                        return redirect('/home?t=',tut)
                    except:
                        message = 'Oops! Something wrong'


    return render_template('add.html',
                           title='Lingua Space Tutor',
                           year=datetime.now().year,
                           time=time,
                           date=date_object.isoformat(),
                           tutors=tutors,
                           students=st,
                           comment=comment,
                           message=message,
                           tut=tut,
                           exist=ex,
                           dis=disabled,
                           role = current_user.role
    )

# Сторінка Учнів
@app.route('/stud')
@login_required
def stud():

    message =''

    rem = request.args.get('rem')

    if rem:
        try:
            Student.query.filter_by(id=int(rem)).delete()
            db.session.commit()
            return redirect('/stud')
        except:
            message ='Oops! Something wrong'


    if current_user.role == 'admin' :
        res = db.session.query(Student).all()
    else:
        res = db.session.query(Student).where(Student.stteacher == current_user.id).all()


    ress = []
    t = ''
    for re in res:
        for tut in tutors:
            if int(tut['id']) == re.stteacher:
                t = tut['name']

        ress.append({'stid' : re.id,
                     'stname' : re.stname,
                     'stcontact' : re.stcontact,
                     'stlang' : re.stlang,
                     'teacher' : t})

    return render_template('stud.html',
                           title='Lingua Space Tutor',
                           year=datetime.now().year,
                           ress=ress,
                           message = message,
                           role = current_user.role)

# Додавання учнів
@app.route('/stadd', methods=['POST', 'GET'])
@login_required
def stadd():

    if request.method == 'POST' : 
        stname = request.form['stname']
        stcontact = request.form['stcontact']
        stlang = request.form['stlang']
        sttutor = request.form['stteacher']

        st = Student(stname = stname, stcontact = stcontact, stlang = stlang, stteacher = sttutor)

        try:
            db.session.add(st)
            db.session.commit()
            return redirect('/stud')
        except:
            message = 'Oops! Something wrong'
        

    return render_template('stadd.html',
                           title='Lingua Space Tutor',
                           year=datetime.now().year,
                           langu = language,
                           tut = tutors,
                           role=current_user.role)

#Вчителі
@app.route('/tuter')
@login_required
def tu():

    tu = db.session.query(User.id, User.userlastname, User.email, User.role).all()

    return render_template('tutors.html',
                           title='Lingua Space Tutor',
                           year=datetime.now().year,
                           role=current_user.role,
                           tu=tu)