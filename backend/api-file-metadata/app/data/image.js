var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ImageSearchSchema = new Schema({
  searchString: String,
  pageOffset: String,
  created_date: Date,
  modified_date: Date
})

ImageSearchSchema.pre('save', function(next){
  var timestamp = new Date();
  
  this.modified_date = timestamp;
  if (!this.created_date) this.created_date = timestamp;
  
  next()
})

var imageSearch = mongoose.model("image", ImageSearchSchema )

module.exports = imageSearch