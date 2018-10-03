// const shortid = require('shortid');
const moment = require('moment')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true})

const userSchema = new Schema ({
  // _id: { type: String, 'default': shortid.generate },
  username: String,
  log: [{ description: String, duration: Number, date: Date }]
});
const User = mongoose.model('User', userSchema);

module.exports.createNew = function(usernameToAdd, done) {
  User.count((err, count) => {
    if (err) {
      return done(err)
    } 
    else if (!err && count == 0) {
      const user = new User({ username: usernameToAdd });
      user.save((err, data) => {
        if (err) {
          return done(err)
        } else {
          return done(null, data._id)
        }
      })
    } 
    else {
      User.findOne({ username: usernameToAdd }, (err, data) => {
        if (err) {
          return done(err)
        } 
        else if (data) {
          return done(null, null)
        }
        else {
          const user = new User({ username: usernameToAdd });
          user.save((err, data) => {
            if (err) {
              return done(err)
            } else {
              return done(null, data._id)
            }
          })
        }
      })
    }
  })
}

module.exports.getAllUsers = function (done) {
  User.find({}, { username: 1, __v: 1 }).exec((err,data) => {
    if (err) {
      return done(err)
    } else {
      return done(null, data)
    }
  })
}

module.exports.addExercise = function (id, description, duration, date, done) {
  const dateToAdd = (date) ? moment().format("ddd MMM DD YYYY") : moment(date).format("ddd MMM DD YYYY");
  const newExercise = {description: description, duration: duration, date: dateToAdd};
  User.findById({_id: mongoose.Types.ObjectId(id)}, (err, data) => {
    if (err) {
      return done(err)
    } else if (data) {
      User.findOneAndUpdate( // mongodb equivalent findAndModify()
      { _id: id }, 
      { $push: {log: newExercise}}, // $set, $inc, ...
      (err, data) => {
        if (err) {
          return done(err)
        } 
        else {
          return done(null, {username: data.username, description: description, duration: duration, _id: id, date: dateToAdd})
        }
      })  
    } else {
      return done(null, null)
    }
  })
  
}