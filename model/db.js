// const shortid = require('shortid');
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true})

const userSchema = new Schema ({
  // _id: { type: String, 'default': shortid.generate },
  username: String,
  count: Number,
  log: [{ description: String, duration: Number, date: Date }]
});
const User = mongoose.model('User', userSchema);

module.exports.createNew = function(usernameToAdd, done) {
  User.count((err, count) => {
    if (err) {
      return done(err)
    } 
    else if (!err && count == 0) {
      const user = new User({ username: usernameToAdd, count: 0});
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
          const user = new User({ username: usernameToAdd, count: 0});
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
      { $push: {log: newExercise}, $inc: {count: 1}},// $set, $inc, ...
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

module.exports.getUserLog = function (id, from, to, limit, done) {
  if (id) {
    // find user and filter param by param
    User.findById({_id: mongoose.Types.ObjectId(id)}, (err, data) => {
      if (err) {
        return done(err)
      } else if (data) {
        const output = data;
        if (from) {
          output = output.log.filter(function(e, i) {
            return e.date >= from
          })
        }
        if (to) {
          output = output.log.filter(function(e, i) {
            return e.date <= to
          })
        }
        if (limit) {
          output = output.log.filter(function(e, i) {
            return  i < limit
          })
        }
        output.log = sortByKey(output.log, 'date');
        return done(null, output);
      } else {
        return done(err)
      }
    })
  } 
  else {
    return done(null, null)
  }
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        let x = a[key]; 
        let y = b[key];
        // sort ascending
        return ( (x < y) ? -1
               : (x > y) ? 1 
               : 0);
    });
}