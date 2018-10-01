const shortid = require('shortid');
const ObjectId = require('mongodb').ObjectID;
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

// module.exports.getAllUsers = function (done) {
//   User.find({}, { username: 1, __v: 1 }).exec((err,data) => {
//     if (err) {
//       return done(err)
//     } else {
//       return done(null, data)
//     }
//   })
// }

// module.exports.addExercise = function (userId, exerciseToAdd, duration, date, done) {
//   User.find({ _id: userId }, (err, data) => {
//     if (err) {
//       return done(err)
//     } 
//     else if (data) {
//       const newExercise = { description: exerciseToAdd, duration: duration, date: new Date(date) };
//       console.log(data);
//       data[0].log.concat([newExercise]);
//       data[0].save((err, user) => {
//         if (err) {
//           return done(err)
//         } else {
//           return done(null, user)  
//         }
//       })
//     } 
//     else {
//       return done(null, null)
//     }
//   })
// }