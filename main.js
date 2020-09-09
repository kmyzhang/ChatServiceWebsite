var express = require('express');
var path = require('path');
//var cors = require('cors')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var {Session, router} = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');

var app = express();

var portNum;
var portNumStr;


// Get port num from commandline
if (process.argv[2] && process.argv[2] === '-p') {
   portNum = parseInt(process.argv[3]);
   portNumStr = process.argv[3];
} else {
   portNum = 4082;
   portNumStr = '4082';
}

// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
   console.log("Handling " + req.path + '/' + req.method);
   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
   res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Headers", "Content-Type");
   res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
   res.header("Access-Control-Expose-Headers", "Location");
   next();
});

// No further processing needed for options calls.
app.options("/*", function(req, res) {
   res.status(200).end();
});

// Static path to index.html and all clientside js
// Parse all request bodies using JSON
app.use(bodyParser.json()); //.json() returns a function with req,res,next

// No messing w/db ids
app.use(function(req, res, next) {delete req.body.id; next();}); 

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser()); //attaches cookies to the request

// Set up Session on req if available
app.use(router);

// Check general login. If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function(req, res, next) {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
      (req.path === '/Prss' || req.path === '/Ssns'))) {
      req.validator = new Validator(req, res);
      next();
   } else {
      res.status(401).end();
   }
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Prss', require('./Routes/Account/Prss.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Cnvs', require('./Routes/Conversation/Cnvs.js'));
app.use('/Msgs', require('./Routes/Conversation/Msgs.js'));

// Special debugging route for /DB DELETE.  Clears all table contents,
//resets all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function(req, res) {
   // Callbacks to clear tables
   var handler = function(err) {
      req.cnn.release();
   };

   if (req.validator.checkAdmin(handler)) {
      var cbs = ["Conversation", "Likes", "Message", "Person"].map(
         table => cb => {
            req.cnn.query("delete from " + table, cb);
         }
      );

      // Callbacks to reset increment bases
      cbs = cbs.concat(["Conversation", "Likes", "Message", "Person"].map(
         table => cb => {
            req.cnn.query("alter table " + table + " auto_increment = 1", cb)
         }
      ));

      // Callback to reinsert admin user
      cbs.push(cb => {
         req.cnn.query('INSERT INTO Person (firstName, lastName, email,' +
            ' password, whenRegistered, role) VALUES ' +
            '("Joe", "Admin", "adm@11.com","password", NOW(), 1);', cb);
      });

      // Callback to clear sessions, release connection and return result
      cbs.push(cb => {
         Session.getAllIds().forEach(id => {
            Session.findById(id).logOut();
         });
         Session.nuke();
         console.log("sessions length " + Session.getAllIds.length);
         cb();
      });

      async.series(cbs, err => {
         if (err)
            res.status(400).json(err);
         else
            res.status(200).end();
         req.cnn.release();
      });
   }
});

// Anchor handler for general 404 cases.
app.use(function(req, res) {
   res.status(404).end();
   req.cnn.release();
});

// Handler of last resort.  Send a 500 response with stacktrace as the body.
app.use(function(err, req, res, next) {
   console.log("big sad");
   res.status(500).json(err.stack);
   req.cnn && req.cnn.release();
});

app.listen(portNum, function() {
   console.log('App Listening on port ' + portNumStr);
});