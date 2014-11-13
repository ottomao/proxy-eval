'use strict'

var REQ_TIMEOUT = 5000;

var url = require('url'),
	async           = require("async"),
	color           = require('colorful'),
	http            = require('http'),
	https           = require('https'),
	HttpProxyAgent  = require('http-proxy-agent'),
	HttpsProxyAgent = require('https-proxy-agent');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function testProxy(proxy,userCallback){
	console.log('using proxy server %j', proxy);

	async.parallel([

		//HTTP GET
		function(callback){
			testSingle({
				url    :"http://www.taobao.com",
				proxy  :"http://127.0.0.1:8001",
				method :"GET"
			},callback);
		},

		//HTTP POST
		function(callback){
			testSingle({
				url    :"http://www.taobao.com",
				proxy  :"http://127.0.0.1:8001",
				method :"POST",
				body   :"test body"
			},callback);
		},

		//HTTPS GET
		function(callback){
			testSingle({
				url    :"https://developer.apple.com",
				proxy  :"http://127.0.0.1:8001",
				method :"GET"
			},callback);
		},

		//HTTPS POST
		function(callback){
			testSingle({
				url    :"https://developer.apple.com",
				proxy  :"http://127.0.0.1:8001",
				method :"POST",
				body   :"test body"
			},callback);
		}
	],function(err,results){

		var successCount = 0,
			totalCount   = results.length;

		results.map(function(record, index){
			if(!record) return;

			var ifSuccess = ((record.statusCode == 200) && (record.length > 500) && record.resHeader);
			record.success = ifSuccess;

			printData(record);
			ifSuccess && ++successCount; 
		});

		console.log(color.bold("======summary========"));
		console.log(color.bold("success : %d / %d"),successCount, totalCount);
		console.log(color.bold("====================="));

		userCallback && userCallback(results);
	});
}

//TODO :time out

//option.url
//option.proxy
//option.method
//option.body (when post)
function testSingle(option, callback){

	var endpoint = option.url,
		proxy    = option.proxy;
	if(!endpoint || !proxy) throw(new Error("option.url is required!"));
	
	var opts = url.parse(endpoint);
	var proxyModule = /https/.test(opts.protocol) ? HttpsProxyAgent : HttpProxyAgent,
		reqModule   = /https/.test(opts.protocol) ? https : http;

	opts.rejectUnauthorized = false;
	opts.agent = new proxyModule(proxy);
	opts.method = option.method || "GET";
	
	var singleRecord = {
		url       : endpoint,
		method    : opts.method,
		desc      : opts.protocol +  " " + opts.method + " " + endpoint,
		start     : Date.now(),
		end       : null,
		resHeader : null,
		length    : 0,
		finish    : false,
		error     : null,
		statusCode: null
	}

	console.log('attempting to test [%j]...', singleRecord.desc);

	var req = reqModule.request(opts,function(res){
		var length = 0;
		singleRecord.statusCode = res.statusCode;

		res.on("data",function(data){
			length += data.length;
		});

		res.on("end",function(){
			singleRecord.end       = Date.now();
			singleRecord.resHeader = res.headers;
			singleRecord.length    = length;
			singleRecord.finish    = true;
			callback(null,singleRecord);
		});
	}).on("error",function(e){
		console.log("err" + e);
	});

	option.body && req.write(option.body);
	req.end();
}

function printData(record){
	console.log("");

	if(record.success){
		console.log(color.green( color.bold("success - " + record.desc) ));
	}else{
		console.log(color.red( color.bold("failed - " + record.desc) ));
		console.log(record.error);
	}

	try{
		console.log("statusCode - %j",record.statusCode);
		console.log("content-type - %j", record.resHeader['content-type']);
		console.log("length - %j byte",record.length);
		console.log("duration - %j ms",(record.end - record.start));
		console.log("");
	}catch(e){}
}

module.exports = testProxy;