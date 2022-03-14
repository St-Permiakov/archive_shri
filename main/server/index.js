const express = require('express');
const events = require('../app/resources/data/events.json');

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }

const app = express();
const port = 8000;

const serverStartTime = Date.now();

let responseBody;
let status;

app.use('/api/events', (request, response, next) => {
    if (request.query.type) {
        const types = request.query.type.split(':');
        let filteredEvents;
        responseBody = {"events": []};

        if (types.length === 0) {
            status = 400;
            responseBody = '<p>Вы не указали ни одного типа событий.</p>';
            return;
        }

        status = 200;

        types.forEach(type => {
            switch (type) {
                case 'info':
                    events.events.forEach(item => {
                        if (item.type === 'info') responseBody.events.push(item);
                    });
                    break;
                    case 'critical':
                    events.events.forEach(item => {
                        if (item.type === 'critical') responseBody.events.push(item);
                    });
                    break;
                default:
                    status = 400;
                    responseBody = 'Неверный тип события';
                    return;
            }
        });
    } else {
        status = 400;
        responseBody = 'Вы не указали ни одного типа событий!';
    }
    next();
})

app.get('/', (request, response) => {
    response.status(200).sendFile('./index.html', {"root": __dirname});
});

app.get('/status',function(request, response, next){
    const duration = Date.now() - serverStartTime;
    const date = new Date(serverStartTime);
    const day = date.getDate();
    const month = date.getMonth() > 9 ? date.getMonth() + 1 : '0' + date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    const minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    response.send('<p>Сервер работает с ' + day + '.' + month + '.' + year + ', ' + hours + ':' + minutes + ', а это уже целых ' + msToTime(duration) + '!</p><p>Пожалуйста, не напрягайте сервер! Он ещё молодой...</p>')
});

app.get('/api/events', (request, response) => {
    status = status ? status : 200;
    response.status(status).json(responseBody);
});

app.get('/*', (request, response) => {
    response.status(404).send('<h1>Page not found</h1>');
});

app.use((err, request, response, next) => {
    // логирование ошибки, пока просто console.log
    console.log(err);
    response.status(500).send('Something broke!');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Error', err);
    }
    console.log(`server is listening on ${port}`);
})