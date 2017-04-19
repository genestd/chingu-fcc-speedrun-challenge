var request = require('request')
var Promise = require('bluebird')
var shortUrl = require('../data/shortUrl')
var mongoose = require('mongoose')
var dns = require('dns')
var imageSearch = require('../data/image')
Promise.promisifyAll(dns)

const handlers = {
  
  /*------------------------------*/
  /* freecodecamp JSON challenge */
  /*------------------------------*/
  jsonChallenge: function(req, res){
    var msg = "Hello json"
    if (process.env.MESSAGE_STYLE === 'uppercase'){
      msg = msg.toUpperCase()
    }
    res.json( { "message": msg})
  },
  /*-----------------------------------*/
  /* freecodecamp timestamp challenge  */
  /*-----------------------------------*/
  timeChallenge: function(req,res){
    req.time = new Date().toString()
    res.json({"time": request.time}) 
  },
  
  /*------------------------------*/
  /* freecodecamp echo challenge  */
  /*------------------------------*/
  echo: function(req, res, next){
    res.json({"echo": req.params.word})
  },
  
  /*------------------------------*/
  /* freecodecamp name challenge  */
  /*------------------------------*/
  nameChallenge: function(req, res){
   res.json({"name": req.query.first + ' ' + req.query.last})
  },
  
  /*--------------------------------------*/
  /* API to proxy FRED (st louis fed API) */
  /*--------------------------------------*/
  apiFREDget: function(req, res){
    var qry = req.originalUrl.substr(10, req.originalUrl.length)

    if (qry===""){ 
      res.json({"error": "empty query string"}) 
    } else {
      request.get(qry).pipe(res)
    }
  },
  
  /*--------------------------------------*/
  /* API to proxy FRED (st louis fed API) */
  /*--------------------------------------*/
  apiFREDpost: function(req, res){
    var qry = req.body.fredUrl

    var options = {
     url: qry,
     headers: {
       'User-Agent': 'request'
     }
   };
   request.get(options).pipe(res)
  },
  
  /*--------------------------------------*/
  /* API for timestamp microservice (fcc) */
  /* function called when URL param exists*/
  /*--------------------------------------*/
  apiTime: function(req, res){
     var input = req.params
     var error = {"error": "Invalid Date"}     
     var candidate = new Date(input.date_string*1000)
     var output

     if (candidate == 'Invalid Date'){
       candidate = new Date(input.date_string)
       if (candidate == 'Invalid Date'){
         output = error
       } else {
         output = {
           "unix": Math.round(candidate.getTime()/1000),
           "utc": candidate.toUTCString()
         }
       }
     } else {
       output = {
         "unix": Math.round(candidate.getTime()/1000),
         "utc": candidate.toUTCString()
       }
     }
     res.json(output)
  },
  
  /*-----------------------------------------*/
  /* API for timestamp microservice (fcc)    */
  /* function called when no URL params exist*/
  /*-----------------------------------------*/
  apiTimeNow: function(req, res){
     var date = new Date()
     var output = {
           "unix": date.getTime(),
           "utc": date.toUTCString()
         }

     res.json(output)
  },
  
  /*--------------------------------------*/
  /* API for HTTP hdrs microservice (fcc) */
  /*--------------------------------------*/
  apiWho: function(req, res){
     var ip = req.headers["x-forwarded-for"]
     var agent = req.headers["user-agent"]
     var lang = req.headers["accept-language"]
     var output = {
       "ipaddress": ip[0],
       "language": lang,
       "software": agent
     }
     res.json(output)
  },
  
  /*--------------------------------------*/
  /* API for URL Shortener microservice   */
  /* GET Method                           */
  /*--------------------------------------*/
  apiUrlGet: function(req, res, next){
    var output={}
    var qry = req.params["0"]
    if( ! qry){
      output = {"error": "No URL provided"}
      res.json(output)
    } else {
        var domain = ''
        var error = {"error": "invalid URL"}
        var start = qry.indexOf('//') > 0 ? qry.indexOf('//')+2 : 0
        var end = qry.indexOf( '/', qry.indexOf('//')+2) > 0 ? qry.indexOf( '/', qry.indexOf('//')+2) : qry.length
        domain = qry.slice( start, end)

        dns.resolveAsync(domain)
        //domain is valid - store URL
        .then( function(address){         
          //1. check if full URL exists
          shortUrl.find({full_url: qry})
                  .then( function(record){
          //2. if yes, then retrieve record, send back object
                    if(record.length > 0){
                      output={original_url: record[0].full_url,
                              short_url: record[0].short_url + record[0]._id}
                      res.json(output)
                    } else {                      
          //3. if no, then store new record, send back object
                      var newUrl = "https://accidental-snowman.gomix.me/xfr/"
                      var myUrl = new shortUrl({
                        short_url: newUrl,
                        full_url: qry,
                      })
                      console.log(myUrl)
                      myUrl.save(function(err){
                        if(err){ 
                          console.log("save error", err)
                          res.json(error)
                        }
                        console.log(myUrl)
                        output = {original_url: myUrl.full_url ,
                                  short_url: myUrl.short_url+ myUrl._id}
                        res.json(output)
                      })
                             
                    }
                  })
                  .error( function(err){
                    console.log('find', err)
                  })
        })
        //error - return error JSON
        .error( function(err){
          console.log('.error', err)
          res.json( error )
        })
    }
  
  },
  
  /*--------------------------------------*/
  /* API for URL Shortener microservice   */
  /* POST Method                          */
  /*--------------------------------------*/
  apiUrlPost: function(req, res, next){
    var qry = req.body.longUrl
    var output = {}
    var error = {"error": "invalid URL"}
    if( ! qry){
      res.json(error)
    } else {
        var domain = ''
        var start = qry.indexOf('//') > 0 ? qry.indexOf('//')+2 : 0
        var end = qry.indexOf( '/', qry.indexOf('//')+2) > 0 ? qry.indexOf( '/', qry.indexOf('//')+2) : qry.length
        domain = qry.slice( start, end)
        dns.resolveAsync(domain)
        //domain is valid - store URL
        .then( function(address){
          
          //1. check if full URL exists
          shortUrl.find({full_url: qry})
                  .then( function(record){
          //2. if yes, then retrieve record, send back object
                    if(record.length > 0){
                      output={original_url: record[0].full_url,
                              short_url: record[0].short_url + record[0]._id}
                      res.json(output)
                    } else {                      
          //3. if no, then store new record, send back object
                      var newUrl = "https://dg-api.glitch.me/xfr/"
                      var myUrl = new shortUrl({
                        short_url: newUrl,
                        full_url: qry,
                      })
                      console.log(myUrl)
                      myUrl.save(function(err){
                        if(err){ 
                          console.log("save error", err)
                          res.json(error)
                        }
                        console.log(myUrl)
                        output = {original_url: myUrl.full_url ,
                                  short_url: myUrl.short_url+ myUrl._id}
                        res.json(output)
                      })
                             
                    }
                  })
                  .error( function(err){
                    console.log('find', err)
                  })
        })
        //error - return error JSON
        .error( function(err){
          console.log('.error', err)
          res.json( error )
        })
    }
  },
  
  /*----------------------------------------------------*/
  /* Redirect handler for  URL Shortener microservice   */
  /*----------------------------------------------------*/
  redirect: function(req,res){
    var qry = new mongoose.Types.ObjectId(req.originalUrl.substr(5, req.originalUrl.length))
    var error = {"error": "invalid shortened URL"}
    shortUrl.findOne({_id: qry})
            .then( function(record){
              if(record.full_url.substr(1,4) != 'http'){
                record.full_url = 'http://' + record.full_url
              }
              res.set('location', record.full_url);
              res.status(302).send()
            })
            .error( function(err){
              console.log('find error', err)
              res.json(error)
            })
  },
  
  metaHandler: function(req, res){
    console.log(req.body)
    res.json({name: req.body.filename,
              size: req.body.filesize,
              type: req.body.filetype
             })
  },
  
  //Handler for the Image Search API
  //Call the pixabay image api, then log the search request in mongo
  imageHandler: function(req, res){
    var search = req.query.search
    if( search === undefined) return res.json({error: "search query not defined"})
    var offset = req.query.offset || 1
    if (offset > 25) offset=1
    //build a bing image search query string
    //user request to pipe to res object
    request.get('https://pixabay.com/api/?key=' + process.env.PIXABAY_API_KEY + '&q=' + search + '&page=' + offset, function(err,response,body){
      if(err) return res.json(err)
      var results = JSON.parse(response.body)
      res.json(JSON.stringify(results.hits))
      
      var mySearch = new imageSearch({
        searchString: search,
        pageOffset: offset
      })
      mySearch.save( function(err,result){
        if (err) console.log(err)
      })     
    })   
  },
  
  recentImages: function(req,res){
    imageSearch.find( )
    .limit(10)
    .select({searchString: 1, offset: 1, modified_date: 1})
    .sort({modified_date: -1})
    .exec( function(err,results){
      if(err) return res.send({error: err})
      res.json(results)
    })    
  }
}
      


module.exports = handlers