var testProxy = require(__dirname + "/index"),
	color = require('colorful');

console.log("testing...");
testProxy( {proxy : 'http://127.0.0.1:8001',reqTimeout:3000} ,function(results){
	printResult(results);
	process.exit();
});

function printResult(results){

	//print all results data
	var successCount = 0,
		totalCount   = results.length;

	results.map(function(record, index){
		record.success && ++successCount; 
	});

	for(var index in results){
		printData(results[index]);
	}	

	console.log(color.bold("======summary========"));
	console.log(color.bold("success : %d / %d"),successCount, totalCount);
	console.log(color.bold("====================="));
}


function printData(record){
	console.log("");

	if(record.success){
		console.log(color.green( color.bold("success - " + record.desc) ));
		console.log("statusCode - %j",record.statusCode);
		console.log("content-type - %j", record.resHeader['content-type']);
		console.log("length - %j byte",record.length);
		console.log("duration - %j ms",(record.end - record.start));
	}else{
		console.log(color.red( color.bold("failed - " + record.desc) ));
		console.log(record.error);
	}

	console.log("");
}


