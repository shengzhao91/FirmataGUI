var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	//console.log(server);
	//console.log(req.params, req.body, req.query);
	//res.sendfile('plain.html');
    res.render('index', { title: 'Express'});
});

/* GET Hello World page. */
router.post('/helloworld', function(req, res) {

	console.log(req.params, req.body, req.query);
    var json = JSON.stringify({ temperature: 0xff });
    res.setHeader('Content-Type', 'application/json');
    res.end(json);
});


module.exports = router;
