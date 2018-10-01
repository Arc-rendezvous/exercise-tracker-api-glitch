const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('./model/db');
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true})
// mongoose.connect(process.env.MLAB_URI, {useNewUrlParser: true})
app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/exercise/users', (req, res, next) => {
  User.getAllUsers((err, data) => {
    if (err) {
      return next(err)
    } else {
      res.send(data)
    } 
  })
})

app.post('/api/exercise/new-user', (req, res, next) => {
  // req.body = {username: String}
  const newUsername = req.body.username;
  User.createNew(newUsername, (err, id) => {
    if (err) {
      return next(err)
    } else if (id == null) {
      res.send('username already taken')
    } else {
      res.send({username: newUsername, id: id})
    }
  })
})

app.post('/api/exercise/add', (req, res, next) => {
  // req.body = {userId: String, description: String, duration: Number, date: yyyy-mm-dd}
  const userId = req.body.userId;
  const newDesc = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  User.addExercise(userId, newDesc, duration, date, (err, log) => {
    if (err) {
      return next(err)
    } else if (log == null) {
      res.send('username with id ' + userId + ' was not found')
    } else {
      res.send(log)
    }
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
