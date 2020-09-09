var Express = require('express');
var Tags = require('../Validator.js').Tags;
var { Session, router } = require('../Session.js');
var router = Express.Router({ caseSensitive: true });
var async = require('async');

router.baseURL = '/Cnvs';

const secToMs = '1000';
const maxTitleLength = 80;
const maxContentLength = 5000;

/***************************************** 
Cnvs -- GET owner=<ownerId>
******************************************/
router.get('/', function (req, res) {
   var owner = req.query.owner;
   var cnn = req.cnn;

   var handler = function (err, cnvs, fields) {
      res.json(cnvs);
      req.cnn.release();
   };

   if (owner)
      req.cnn.chkQry('select id, title, ownerId, ' + 
       'UNIX_TIMESTAMP(lastMessage)*? as lastMessage from Conversation ' +
       'where ownerId like ?', [secToMs, owner], handler);
   else
      req.cnn.chkQry('select id, title, ownerId, ' +
       'UNIX_TIMESTAMP(lastMessage)*? as lastMessage from Conversation', 
       [secToMs], handler);
});

/***************************************** 
Cnvs -- POST
******************************************/
router.post('/', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["title"], cb) &&
       vld.check(body.title.length <= maxTitleLength,
       Tags.badValue, ["title"], cb)) {
         cnn.chkQry('select * from Conversation where title = ?', 
          body.title, cb);
      }
   },
   function (existingCnv, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb)) {
         body.ownerId = req.session.prsId;
         cnn.chkQry("insert into Conversation set ?", body, cb);
      }
   },
   function (insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function (err) {
      cnn.release();
   });
});

/***************************************** 
Cnvs/{cnvId} -- GET
******************************************/
router.get('/:id', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select id, title, ownerId, ' +
       'UNIX_TIMESTAMP(lastMessage)*? as lastMessage from ' + 
       'Conversation where id = ?', [secToMs, req.params.id], cb);
   },
   function (cnv, fields, cb) {
      if (vld.check(cnv.length, Tags.notFound, null, cb)) {
         res.json(cnv[0]);
         cb();
      }
   }],
   function (err) {
      cnn.release();
   });
});


/***************************************** 
Cnvs/{cnvId} -- PUT
******************************************/
router.put('/:cnvId', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;

   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["title"], cb) &&
       vld.check(body.title.length <= maxTitleLength)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function (cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry("select * from Conversation where id <> ? && title = ?",
          [cnvId, body.title], cb);
   },
   function (sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry("update Conversation set title = ? where id = ?", 
          [body.title, cnvId], cb);
      }
   },
   function (updateCnv, fields, cb) {
      res.end();
      cb();
   }],
   function (err) {
      cnn.release();
   });
});

/***************************************** 
Cnvs/{cnvId} -- DELETE
******************************************/
router.delete('/:cnvId', function (req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function (cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
   }],
   function (err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

/***********************************************************
Cnvs/{cnvId}/Msgs -- GET dateTime = {dateTime} num = {num}
************************************************************/
router.get('/:id/Msgs', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var dateTime = req.query.dateTime;
   var num = req.query.num;

   async.waterfall([
   function (cb) {
      if (dateTime && num) {
         cnn.chkQry('select Message.id as id, UNIX_TIMESTAMP(whenMade)*? ' +
          'as whenMade, email, content, numLikes from Message join Person ' +
          'on Message.prsId = Person.id where cnvId = ? and whenMade >= ' +
          'FROM_UNIXTIME(?/?) ORDER BY whenMade ASC, id ASC LIMIT ?', [secToMs,
          req.params.id, dateTime.toString(), secToMs, parseInt(num)], cb);
      } else if (dateTime) {
         cnn.chkQry('select Message.id as id, UNIX_TIMESTAMP(whenMade)*? ' +
          'as whenMade, email, content, numLikes from Message join Person ' +
          'on Message.prsId = Person.id where cnvId = ? and whenMade >= ' +
          'FROM_UNIXTIME(?/?) ORDER BY whenMade ASC, id ASC ', [secToMs, 
          req.params.id, dateTime.toString(), secToMs], cb);
      } else if (num) {
         cnn.chkQry('select Message.id as id, UNIX_TIMESTAMP(whenMade)*? ' +
          'as whenMade, email, content, numLikes from Message join Person ' +
          'on Message.prsId = Person.id where cnvId = ? ORDER BY whenMade '+ 
          'ASC, id ASC LIMIT ?', [secToMs, req.params.id, parseInt(num)], cb);
      } else {
         cnn.chkQry('select Message.id as id, UNIX_TIMESTAMP(whenMade)*? ' +
          'as whenMade, email, content, numLikes from Message join Person ' + 
          'on Message.prsId = Person.id where cnvId = ? ORDER BY whenMade ' + 
          'ASC, id ASC', [secToMs, req.params.id], cb);
      }
   },
   function (msgs, fields, cb) {
      res.json(msgs);
      cb();
   }],
   function (err) {
      cnn.release();
   });
});


/***************************************** 
Cnvs/{cnvId}/Msgs -- POST
******************************************/
router.post('/:id/Msgs', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var msgId;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select * from Conversation where id = ?', 
       [req.params.id], cb);
   },
   function (cnvs, fields, cb) {
      if (vld.hasFields(body, ["content"], cb) &&
       vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.check(body.content.length <= maxContentLength, 
       Tags.badValue, ["content"], cb)) {
         body.cnvId = Number(req.params.id);
         body.prsId = req.session.prsId;
         body.whenMade = new Date();
         body.numLikes = 0;
         cnn.chkQry("insert into Message set ?", body, cb);
     }
   },
   function (insRes, fields, cb) {
      msgId = insRes.insertId;
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [body.whenMade, body.cnvId], cb)
   },
   function (insRes, fields, cb) {
      res.location('/Msgs/' + msgId).end();
      cb();
   }],
   function (err) {
      cnn.release();
   });
});

module.exports = router;
