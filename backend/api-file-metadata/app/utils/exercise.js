var mongoose = require('mongoose')
var Promise = require('bluebird')
mongoose.Promise = Promise
mongoose.connect('mongodb://' + process.env.DBUSER + ":" + process.env.DBPASSWORD + "@" + process.env.DBHOST + ":" + process.env.DBPORT + "/" + process.env.DBINSTANCE)

var Schema = mongoose.Schema;
var exerciseUser = new Schema({
  userID: {
    type: String,
    unique: true
  }
})
var Exerciser = mongoose.model("exercisers", exerciseUser)
var exerciseActivity = new Schema({
  userID: String,
  activity: String,
  duration: Number,
  date: Date
})
var Activity = mongoose.model("activities", exerciseActivity)

const exercise = {
  
  addUser: function( newUser, done){
    Exerciser.find({userID: newUser}, function(err, doc){
      if (err) return done(err)
      else {
        if (doc.length === 0){
          var ex = new Exerciser({userID: newUser})
          ex.save(function(err, rec){
            if(err) return done(err)
            done(null, rec)
          })
        } else {
          doc = {"error": "User ID already exists"}
          done(null, doc)
        }
      }
    })
    
  },
  
  addActivity: function(form, done){
    var user = form.uid,
    activity = form.act,
    dur = form.dur,
    date = form.dt || Date.now()
    
    var input= new Activity()
    
    //1. validate user exists
    Exerciser.find({userID: form.uid}, function(err, doc){
      if(err) return done(err)
      else{
        if(doc.length === 0){
          { return done({error: "User ID does not exist"})}
        } else {
          input.userID = user
          input.activity = activity
          input.duration = dur
          input.date = date
          input.save( function(err, act){
            if (err) return done(err)
            else return done(null, act)
          })
        }
      }
    })
  },
  
  getActivity: function(qry, done){
    var lim = Number.parseInt(qry.limit)
    Activity.find({userID: qry.user})
            .sort({date: 1})
            .limit(lim)
            .exec( function(err, data){
      if (err) return done(err)
      else {
        done(null, data)
      }
    })
  }


}

module.exports = exercise