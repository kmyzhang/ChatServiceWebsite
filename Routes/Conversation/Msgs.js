var Express = require('express');
var Tags = require('../Validator.js').Tags;
var { Session, router } = require('../Session.js');
var router = Express.Router({ caseSensitive: true });
var async = require('async');

router.baseURL = '/Msgs';

const secToMs = '1000';

/***************************************** 
Msgs -- GET 
******************************************/
router.get('/:id', function (req, res) {
	var owner = req.query.owner;
	var cnn = req.cnn;
	var vld = req.validator;
	var msgId = req.params.id;

	async.waterfall([
	function (cb) {
		req.cnn.chkQry('select UNIX_TIMESTAMP(whenMade)*? as whenMade, ' +
		 'email, content, numLikes from Message join Person on ' +
		 'Message.prsId = Person.id where Message.id = ?', 
		 [secToMs, msgId], cb);
	},
	function (msgs, fields, cb) {
		if (vld.check(msgs.length, Tags.notFound, null, cb)) {
			res.json(msgs[0]);
			cb();
		}
	}],
	function (err) {
		cnn.release();
	});
});

/***************************************** 
Msgs/{msgId}/Likes -- GET 
******************************************/
router.get('/:id/Likes', function (req, res) {
	var vld = req.validator;
	var cnn = req.cnn;
	var nums = req.query.num;

	async.waterfall([
	function (cb) {
		cnn.chkQry('select * from Message where id = ?', [req.params.id], cb);
	},
	function (existingMsg, fields, cb) {
		if (vld.check(existingMsg.length, Tags.notFound, null, cb)) {
			if (nums) {
				cnn.chkQry('select lId as id, firstName, lastName from ' +
				 '(select whenPosted, Likes.id as lId, firstName, lastName ' +
				 'from Likes join Person on Likes.prsId = Person.id where ' + 
				 'msgId = ? ORDER BY lId DESC LIMIT ?) as firstSet ORDER BY ' +
				 'lastName ASC, firstName ASC', 
				 [req.params.id, parseInt(nums)], cb);
			} else {
				cnn.chkQry('select Likes.id as id, firstName, lastName from ' +
				 'Likes join Person on Likes.prsId = Person.id where ' +
				 'msgId = ? ORDER BY lastName ASC, firstName ASC', 
				 [req.params.id], cb);
			}
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
Msgs/{msgId}/Likes -- POST
******************************************/
router.post('/:id/Likes', function (req, res) {
	var vld = req.validator;
	var cnn = req.cnn;

	async.waterfall([
	function (cb) {
		cnn.chkQry('select * from Message where id = ?', [req.params.id], cb);
	},
	function (existingMsg, fields, cb) {
		if (vld.check(existingMsg.length, Tags.notFound, null, cb)) {
			cnn.chkQry('select * from Likes where prsId = ? && msgId = ?',
			 [req.session.prsId, req.params.id], cb);
		}
	},
	function (existingLike, fields, cb) {
		if (!existingLike.length) {
			cnn.chkQry('update Message set numLikes = numLikes + 1 where id = ?',
			 [req.params.id], cb);
		} else {
			async.waterfall([
			function (cb) {
				res.location(router.baseURL + '/' + req.params.id + '/Likes/' + 
				 (existingLike.id + 1)).end();
				cb();
			}],
			function (err) {
				cnn.release();
			});
		}
	},
	function (updateRes, fields, cb) {
		var whenLiked = new Date();
		cnn.chkQry('insert into Likes set ?', 
		 {prsId: req.session.prsId, msgId: req.params.id, 
		 whenPosted: whenLiked}, cb);
	},
	function (insRes, fields, cb) {
		res.location(router.baseURL + '/' + req.params.id + '/Likes/' + 
		 insRes.insertId).end();
		cb();
	}],
	function (err) {
		cnn.release();
	});
});

module.exports = router;
