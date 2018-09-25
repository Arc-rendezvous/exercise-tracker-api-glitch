const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MLAB_URI);

var personSchema = new Schema ({
  username: String,
  exercises: [Object]
});
var Person = mongoose.model('Person', personSchema);