
from datetime import datetime, timedelta
from turtle import title
from flask import render_template, request
from LinguaSpaceTutor import app

@app.route('/')
@app.route('/home')
def home():
   
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
        times = times
    )

@app.route('/add')
def add():
    time = request.args.get('time')
    date = request.args.get('date')

    onestring = f"{date}.2026 {time}"
    print(onestring)
    date_object = datetime.strptime(onestring, "%d.%m.%Y")
    return render_template('add.html',
                           title='Lingua Space Tutor',
                           year=datetime.now().year,
                           time=time,
                           date=date_object.date())