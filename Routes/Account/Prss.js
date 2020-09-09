var Express = require('express');
var Tags = require('../Validator.js').Tags;
var async = require('async');
var mysql = require('mysql');
var { Session, router } = require('../Session.js');

var router = Express.Router({caseSensitive: true});

router.baseURL = '/Prss';

const secToMs = '1000';
const maxEmailLength = 150;
const maxFNameLength = 30;
const maxLNameLength = 50;
const maxPasswordLength = 50;

/***************************************** 
Prss -- GET email={email or email prefix}
******************************************/
router.get('/', function(req, res) {
   var admin = req.session && req.session.isAdmin();
   var student = req.session && req.session.isStudent();
   var email = req.query.email;

   var handler = function(err, prsArr, fields) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (admin) {
      if (email)
         req.cnn.chkQry('select email, id from Person where email like ?',
          email+'%', handler);
      else
         req.cnn.chkQry('select email, id from Person', null, handler);
   }
   if (student) {
      if (email) {
         if (req.session.email.startsWith(email)) {
            req.cnn.chkQry('select email, id from Person where email like ?',
             req.session.email, handler);
         } else {
            req.cnn.chkQry('select email, id from Person where email like ?',
             'nonExistent', handler);
         }
      } else {
         req.cnn.chkQry('select email, id from Person where email like ?',
          req.session.email, handler);
      }
   }  
});

/***************************************** 
Prss -- POST
******************************************/
router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
   
   if (admin && !body.password)
      body.password = "*";  // Blocking password

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb) &&
       vld.chain(body.role === 0 || admin, Tags.forbiddenRole, null)
       .chain(body.termsAccepted || admin, Tags.noTerms, null)
       .chain(typeof body.email == 'string' && 
       body.email.length <= maxEmailLength, Tags.badValue, ["email"])
       .chain(!("firstName" in body) || typeof body.firstName == 'string' && 
       body.firstName.length <= maxFNameLength, Tags.badValue, ["firstName"])
       .chain(typeof body.lastName == 'string' && 
       body.lastName.length <= maxLNameLength, Tags.badValue, ["lastName"])
       .chain(typeof body.password == 'string' && 
       body.password.length <= maxPasswordLength, Tags.badValue, ["password"])
       .check(body.role === 1 || body.role === 0, 
       Tags.badValue, ["role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb)
      }
   },
   function(existingPrss, fields, cb) {  
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted = (body.termsAccepted && new Date()) || null;
         body.whenRegistered = new Date();
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { 
      res.location(router.baseURL + '/' + result.insertId).end();
      cb(); 
   }],
   function(err) {
      cnn.release();
   });
});

/***************************************** 
Prss/{prsId} -- GET
******************************************/
router.get('/:id', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb))
         req.cnn.chkQry('select email, firstName, lastName, role, ' +
          'UNIX_TIMESTAMP(termsAccepted)*? as termsAccepted, ' +
          'UNIX_TIMESTAMP(whenRegistered)*? as whenRegistered ' +
          'from Person where id = ?', [secToMs, secToMs, req.params.id], cb);
   },
   function(prsArr, fields, cb) { 
      if (vld.check(prsArr.length, Tags.notFound, null, cb)) {
         res.json(prsArr);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

/***************************************** 
Prss/{prsId} -- PUT
******************************************/
router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session && req.session.isAdmin(); 
   var cnn = req.cnn;

   async.waterfall([
   cb => {
      if (vld.checkPrsOK(req.params.id, cb) && 
       vld.checkForbidden(body, 
       ["email", "termsAccepted", "whenRegistered"], cb) &&
       vld.chain(!("password" in body) || ("oldPassword" in body) || admin,
       Tags.noOldPwd, null)
       .chain(!("password" in body) || body.password && 
       typeof body.password == 'string' && 
       body.password.length <= maxPasswordLength &&
       body.password.length > 0, Tags.badValue, ["password"])
       .chain(!("firstName" in body) || typeof body.firstName == 'string' && 
       body.firstName.length <= maxFNameLength, Tags.badValue, ["firstName"])
       .chain(!("lastName" in body) || typeof body.lastName == 'string' && 
       body.lastName.length <= maxLNameLength &&
       body.lastName.length > 0, Tags.badValue, ["lastName"])
       .check(!("role" in body) || (admin && (body.role === 0 ||
       body.role === 1)), Tags.badValue, ["role"], cb)) { 
         cnn.chkQry('select * from Person where id = ?', [req.params.id], cb);
      }
   },
   (prs, fields, cb) => {
      if (vld.check(prs.length, Tags.notFound, null, cb) && 
       vld.check((!('password' in body) || admin || 
       prs[0].password === body.oldPassword), 
       Tags.oldPwdMismatch, null, cb)) {
         delete(body.oldPassword);
         
         if (Object.keys(body).length) {
            cnn.chkQry('update Person set ? where id = ?', 
             [body, req.params.id], cb);
         } else {
            cb(false, null, null);
         }
      }
   },
   (updateRes, fields, cb) => {
      res.end();
      cb();
   }],
   err => {
      cnn.release()
   });
});

/***************************************** 
Prss/{prsId} -- DELETE
******************************************/
router.delete('/:id', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkAdmin(cb)) {
         console.log("gettign messages");
         req.cnn.chkQry('select msgId from Likes where prsId = ?', 
          [req.params.id], cb);
      }
   },
   function(ids, fields, cb) {
      if (ids.length) {
         ids.forEach(id => {
            req.cnn.chkQry('update Message set numLikes = ' + 
             'numLikes - 1 where id = ?', 
             [id.msgId], cb);
         })
      }
      else {
         cb(false, null, null);
      }
   },
   function(newMsg, fields, cb) {
      req.cnn.chkQry('delete from Person where id = ?', 
       [req.params.id], cb);
   },
   function(result, fields, cb) {
      if (vld.check(result.affectedRows, Tags.notFound, null, cb)) {
         var pId = parseInt(req.params.id);
         Session.getAllIds().forEach(id => {
            if (Session.findById(id).getPrsId() === pId)
               Session.findById(id).logOut();
         });
         cb(false, null, null);
      }
   },
   function(result, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
