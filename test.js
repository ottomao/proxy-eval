var tester = require(__dirname + "/index"),
	color = require('colorful');

console.log("testing...");
tester.test( {proxy : 'http://127.0.0.1:8001',reqTimeout:3000} ,function(results){
	tester.printResult(results);
	process.exit();
});




