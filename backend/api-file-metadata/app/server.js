// server.js
// where your node app starts

// init project
var bodyParser = require('body-parser');
var express = require('express');
var handlers = require('./utils/handlers.js')
var exercise = require('./utils/exercise.js')
var app = express();
var Promise = require('bluebird')
var mongoose = require( 'mongoose')
mongoose.Promise = Promise
mongoose.createConnection('mongodb://' + process.env.DBUSER + ":" + process.env.DBPASSWORD + "@" + process.env.DBHOST + ":" + process.env.DBPORT + "/" + process.env.DBINSTANCE)

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('views'));
app.use('/api/FRED', bodyParser.urlencoded({extended: false}))
app.use('/api/url/*', bodyParser.urlencoded({extended: false}))
app.use('/api/meta/*', bodyParser.urlencoded({extended: false}))
app.use('/name', bodyParser.urlencoded({extended: false}))
app.use(['/api/exercise/add-user/', '/api/exercise/add-activity/'], bodyParser.urlencoded({extended: false}))
// middleware logger
app.use('/', function(request, response, next){
  console.log(request.method, ' ', request.path, '-', '192.168.0.1' )
  next()
})


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //response.send('Hello Express')
  response.sendFile(__dirname + '/views/index.html');
});

//handler to return a JSON object, dependent on env variable
app.get("/json", handlers.jsonChallenge)

//handler to return the current time
app.get("/now", handlers.timeChallenge)

// handler to echo from the request.params object
app.get("/:word/echo", handlers.echo)

//handler to return a name object from query string
app.route('/name')
   .get(handlers.nameChallenge)
   .post(handlers.nameChallenge)

// Landing page for FRED api
app.route("/FRED.html")
   .get(function(request, response){
     response.sendFile(__dirname + '/views/fred.html');
   })
  .post(function(request, response){
     console.log('posting', request)
  })
// API for FRED requests (used for D3 GDP project)
app.route('/api/FRED/')
   .get(handlers.apiFREDget)
   .post(handlers.apiFREDpost)
app.route('/api/FRED/*')
   .get(handlers.apiFREDget)

// Landing page for Timestamp api
app.route("/timestamp.html")
   .get(function(request, response){
     response.sendFile(__dirname + '/views/timestamp.html');
   })
// API for TimeServer requests
app.route('/api/timestamp/:date_string')
   .get(handlers.apiTime)

// API for TimeServer requests with no params
app.route('/api/timestamp/')
   .get(handlers.apiTimeNow)

// Landing page for HTTP Headers api
app.route("/whoami.html")
   .get(function(request, response){
     response.sendFile(__dirname + '/views/whoami.html');
   })
// API for HTTP Headers 
app.route('/api/whoami')
   .get(handlers.apiWho)

// Landing page for URL Shortener api
app.route("/short.html")
   .get(function(request, response){
     response.sendFile(__dirname + '/views/short.html');
   })
// API for URL shortener
app.route(["/api/url/", "/api/url/:url", "/api/url/*"])
   .get(handlers.apiUrlGet)
   .post(handlers.apiUrlPost)
// URL shortener proxy route
app.route("/xfr/:route")
   .get(handlers.redirect)

// Landing page for File Metadata api
app.route("/meta.html")
   .get(function(request, response){
     response.sendFile(__dirname + '/views/meta.html');
   })

// API for file metadata 
app.route("/api/meta")
   .post(handlers.metaHandler)

// Landing page for exercise tracker
app.route("/exercise.html")
   .get(function(req, res){
     res.sendFile(__dirname + '/views/exercise.html')
   })
// API endpoint to add user for exercise tracker
app.route("/api/exercise/add-user/")
   .post(function(req, res){
     var uid = req.body.userId
     exercise.addUser(uid, function(err, data){
       if (err) console.log(err)
       else{
         var output = JSON.stringify(data)
         res.json(output)
       }
     })
   })
// API endpoint to add activity for exercise tracker
app.route("/api/exercise/add-activity/")
   .post(function(req, res){
     exercise.addActivity(req.body, function(err, data){
       if (err) res.json(err)
       else{
         var output = JSON.stringify(data)
         res.json(output)
       }
     })
   })
app.route("/api/exercise")
   .get(function(req, res){
     exercise.getActivity(req.query, function(err, data){
       if (err) res.json(err)
       else res.json(data)
     })
})

//Landing page for Image Search Abstraction Layer
app.route("/image.html")
   .get(function(req,res){
     res.sendFile(__dirname + "/views/image.html")
   })
//API endpoint for Image Search
app.route("/api/image")
   .get(handlers.imageHandler)
//API endpoint for Recent Image Searches
app.route("/api/image/recent")
   .get(handlers.recentImages)

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  //console.log('Your app is listening on port ' + listener.address().port);
}); 
