const shortid = require('shortid');
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true})

const userSchema = new Schema ({
  // shortId: { type: String, unique: true, 'default': shortid.generate },
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
          // return done(null, data.shortId)
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
              // return done(null, data.shortId)
            }
          })
        }
      })
    }
  })
}

module.exports.getAllUsers = function (done) {
  User.find({}, { username: 1, __v: 1 }).exec((err,data) => {
  // User.find({}, { _id: 0, username: 1, __v: 1 }).exec((err,data) => {
    if (err) {
      return done(err)
    } else {
      return done(null, data)
    }
  })
}

module.exports.addExercise = function (id, description, duration, date, done) {
  const dateToAdd = (date) ? moment(date).format("ddd MMM DD YYYY") : moment().format("ddd MMM DD YYYY");
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
  let qlimit = {};
  if (limit) {
    qlimit.limit = Number(limit);
  }
  
  User.findById({_id: mongoose.Types.ObjectId(id)})
      .populate({path: 'log', match: {}, select: '_id', options: qlimit})
      .exec((err, data) => {
      if (err) {
        return done(err)
      } else if (data) {
        const output = {id: data._id, username: data.username, count: data.count};
        output.from = (from) ? moment(from).format('ddd MMM DD YYYY') : 'NA';
        output.to = (to) ? moment(to).format('ddd MMM DD YYYY') : 'NA';
        output.log = data.log.filter(function(e){
          if (from && to) {
            return e.date <= moment(to) && e.date >= moment(from)
          } 
          if (from) {
            return e.date >= moment(from)
          } 
          if (to) {
            return e.date <= moment(to)
          } 
            return true
        })
        output.log = sortByKey(output.log, 'date');
        return done(null, output)
      } else {
        return done(null, null)
      }
  })
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