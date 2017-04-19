var mongoose = require('mongoose')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  //console.log('connected')
});
db.close()
var Schema = mongoose.Schema

var ShortUrlSchema = new Schema({
  short_url: String,
  full_url: String,
  created_date: Date,
  modified_date: Date
})

ShortUrlSchema.pre('save', function(next){
  var timestamp = new Date();
  
  this.modified_date = timestamp;
  if (!this.created_date) this.created_date = timestamp;
  
  next()
})

var shortURL = mongoose.model("URL", ShortUrlSchema )

module.exports = shortURL