// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
var eventIdNum = 1
// include the express modules
var express = require("express");

// create an express application
var app = express();
const url = require('url');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser'); // this has been depricated, is now part of express...

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// include the mysql module
var mysql = require("mysql");

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// A possible library to help reading uploaded file.
// var formidable = require('formidable')

const pug = require("pug");
const path = require("path");

console.log(__dirname)

app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'html')]);
app.set('view engine', 'pug');

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}
));

const dbCon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "secretWebsite",                  
  database: "website"           
});

dbCon.connect();

// server listens on port 9007 for incoming connections
app.listen(5872, () => console.log('Listening on port 5872!'));


// function to return the welcome page
app.get('/',function(req, res) {
  res.render('login');
});

app.get('/login',function(req, res) { // returns login page
  if (req.session.loggedin) {
    res.render('schedule');
  } else {
    res.render('login');
  }
});

app.post('/login', function(req, res) {
  username = req.body.username;
  password = req.body.password;

  validateLogin(username, password,function(err, user) {
    if (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }

    if (!user) {
      return res.status(401).redirect('/login');
    }
    req.session.loggedin = true;
    req.session.username = username;
    res.json({status:'success'});
  });
});

function validateLogin(username, password, callbackFunc) {
  dbCon.query('SELECT * FROM tbl_accounts WHERE acc_login = ?', [username], function(err, results) {
    if (err) {
      return callbackFunc(err, null);
    }
    if (results.length === 0) {
      return callbackFunc(null, false);
    }

    user = results[0];

    bcrypt.compare(password, user.acc_password, function(err, result) {
      if (err) {
        return callbackFunc(err, null);
      }
      if (result) { // passwords match!
        return callbackFunc(null, user);
      } else {
        return callbackFunc(null, false);
      }
    });
  });
}

app.get('/schedule',function(req, res) { // returns schedule page
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    res.render('schedule');
  }
});

app.post('/create', function(req, res) {
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    let day = req.body.d;
    console.log("Attempting to create table");
    dbCon.query('SELECT * FROM tbl_events WHERE event_day = ? ORDER BY event_start', day, function(err, rows, fields) {
      if (err) {
        console.error(err);
      }
      if (rows.length === 0) {
        console.log("No events for this day");
      } else {
        const formattedData = rows.map(row => ({
          event_id: row.event_id,
          event_event: row.event_event,
          event_start: row.event_start,
          event_end: row.event_end,
          event_location: row.event_location,
          event_phone: row.event_phone,
          event_info: row.event_info,
          event_url: row.event_url
        }));
        res.json({ data: formattedData });
      }
    });
  }
});

app.post('/postEventEntry', (req, res) => {
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    eventToAdd = {
    event_day: req.body.day,
    event_event: req.body.event,
    event_start: req.body.start,
    event_end: req.body.end,
    event_location: req.body.location,
    event_phone: req.body.phone,
    event_info: req.body.info,
    event_url: req.body.url
  };

  console.log("Attempting to insert record into tbl_accounts");
  dbCon.query('INSERT tbl_events SET ?', eventToAdd, function (err, result) {
      if (err) {
          throw err;
      }
      console.log("Table record inserted!");
  });
  res.render('schedule');
  }
});

app.get('/addEvent',function(req, res) { // returns addEvent page
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    res.render('addEvent');
  }
});

app.get('/index',function(req, res) { // returns addEvent page
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    res.render('index');
  }
});

app.get('/logout',function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
    } else {
      res.render('login');
    }
  });
});

app.get('/editEvent', function(req, res) {
  if (!req.session.loggedin) {
    res.render('login');
  } else {
    res.render('editEvent');
  }
});

app.get('/deleteEvent/:event_id', (req, res) => {
  eventId = req.params.event_id;
  console.log("Deleting ID: " + eventId);

  dbCon.query('DELETE FROM tbl_events WHERE event_id = ?', req.params.event_id, function(err, rows, fields) {
    if (err) {
      console.error(err);
    } else {
      console.log("Successful delete!");
    }
  })

  res.sendStatus(200);
});

app.get('/editEvent/:event_id', (req, res) => {
  eventId = req.params.event_id;
  console.log("Editing ID: " + eventId);

  dbCon.query('SELECT * FROM tbl_events WHERE event_id = ?', req.params.event_id, function(err, results) {
    if (err) {
      console.error(err);
    } else {
      if (results.length === 0) {
        res.sendStatus(404);
      } else {
        eventToEdit = {
          event_id: results[0].event_id,
          event_day: results[0].event_day,
          event_event: results[0].event_event,
          event_start: results[0].event_start,
          event_end: results[0].event_end,
          event_location: results[0].event_location,
          event_phone: results[0].event_phone,
          event_info: results[0].event_info,
          event_url: results[0].event_url
        };

        res.render('updateEvent', {msgCopy: eventToEdit});
      }
    }
  })
});
  
app.post('/updateEvent/:event_id', (req, res) => {
  eventId = req.params.event_id;
  data = req.body;
  console.log("Updating ID: " + eventId);
  console.log(data)

  dbCon.query('UPDATE tbl_events SET event_day = ?, event_event = ?, event_start = ?, event_end = ?, event_location = ?, event_phone = ?, event_info = ?, event_url = ? WHERE event_id = ?', [req.body.event_day, req.body.event_event, req.body.event_start, req.body.event_end, req.body.event_location, req.body.event_phone, req.body.event_info, req.body.event_url, eventId], function(err, rows) {
    if (err) {
      console.log(err);
      res.status(422);
    } else {
      console.log("Update complete");
      res.redirect(302, '/schedule');
    }
  })
});

const htmlRoutes = ['403', '404', 'AboutMe', 'Coffman_N_OuttaSpace', 'Coffman', 'MyForm', 'MySchedule', 'MyServer', 'OuttaSpace', 'private', 'stockQuotes'];

htmlRoutes.forEach(route => {
  app.get(`/${route}`, function(req, res) {
    if (req.session.loggedin) {
      res.sendFile(path.join(__dirname, 'html', `${route}.html`));
    } else {
      res.render('login');
    }
  });
});

const cssRoutes = ['AboutMe', 'MyForm', 'MySchedule', 'stockQuotes'];

cssRoutes.forEach(route => {
  app.get(`/css/${route}.css`, function(req, res) {
    res.sendFile(path.join(__dirname, 'css', `${route}.css`));
  });
});

const jsRoutes = ['AboutMe', 'formMap', 'map', 'MySchedule', 'stocks', 'stocksKey'];

jsRoutes.forEach(route => {
  app.get(`/js/${route}.js`, function(req, res) {
    res.sendFile(path.join(__dirname, 'js', `${route}.js`));
  });
});

const audioRoutes = ['OuttaSpace'];

audioRoutes.forEach(route => {
  app.get(`/audio/${route}.mp3`, function(req, res) {
    res.sendFile(path.join(__dirname, 'audio', `${route}.mp3`));
  });
});

const jpgimgRoutes = ['anderson', 'blegen', 'breakfast', 'cell-blue', 'coffman', 'freetime', 'keller', 'lab', 'Lind', 'rec', 'shepherd', 'swim', 'track', 'vanCleve', 'walter', 'zoom'];

jpgimgRoutes.forEach(route => {
  app.get(`/img/${route}.jpg`, function(req, res) {
    res.sendFile(path.join(__dirname, 'img', `${route}.jpg`));
  });
});

const jpegimgRoutes = ['akerman', 'berg', 'tairrie'];

jpegimgRoutes.forEach(route => {
  app.get(`/img/${route}.jpeg`, function(req, res) {
    res.sendFile(path.join(__dirname, 'img', `${route}.jpeg`));
  });
});

const pngimgRoutes = ['Coffman', 'direction', 'Goldy', 'Goldy2', 'gophers-mascot', 'search', 'Tate'];

pngimgRoutes.forEach(route => {
  app.get(`/img/${route}.png`, function(req, res) {
    res.sendFile(path.join(__dirname, 'img', `${route}.png`));
  });
});

app.get('/calculator', function(req, res) {
  const params = req.query;

  const num1 = parseFloat(params.firstnum);
  const num2 = parseFloat(params.secondnum);
  const op = params.operator;

  if (isNaN(num1) || isNaN(num2) || !op) {
    return res.status(400).send('Invalid input');
  }

  let answer;

  switch (op) {
    case '*':
      answer = num1 * num2;
      break;
    case '/':
      if (num2 === 0) {
        return res.status(400).send('Divide by zero');
      }
      answer = num1 / num2;
      break;
    case '-':
      answer = num1 - num2;
      break;
    case '+':
      answer = num1 + num2;
      break;
    default:
      return res.status(400).send('Invalid operator');
  }

  res.status(200).send(answer.toString());
});

app.get('/redirect', function(req, res) {
  const params = req.query;

  const input = params.input;
  const source = params.source;

  if (!input || !source) {
    return res.status(400).send('Missing input or source parameter');
  }

  let newUrl;

  if (source === 'google') {
    newUrl = `https://www.google.com/search?q=${input}`;
  } else if (source === 'youtube') {
    newUrl = `https://www.youtube.com/results?search_query=${input}`;
  } else {
    return res.status(400).send('Invalid source parameter');
  }

  res.redirect(307, newUrl);
});

// middle ware to serve static files
app.use('/static', express.static(__dirname + '/static'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});