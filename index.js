'use strict';

var DEFAULT_REQ_TIMEOUT = 5000,
	DEFAULT_HTTP_GET_URL    = "http://www.taobao.com",
	DEFAULT_HTTP_POST_URL   = "http://www.taobao.com",
	DEFAULT_HTTP_POST_BODY  = "post body",
	DEFAULT_HTTPS_GET_URL   = "https://login.taobao.com",
	DEFAULT_HTTPS_POST_URL  = "https://developer.apple.com",
	DEFAULT_HTTPS_POST_BODY = "post body";

var url = require('url'),
	async           = require("async"),
	color           = require('colorful'),
	http            = require('http'),
	https           = require('https'),
	HttpProxyAgent  = require('http-proxy-agent'),
	HttpsProxyAgent = require('https-proxy-agent');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function test(option,userCallback){

	var defaultOption = {
		httpGetUrl    : DEFAULT_HTTP_GET_URL,
		httpPostUrl   : DEFAULT_HTTP_POST_URL,
		httpPostBody  : DEFAULT_HTTP_POST_BODY,
		httpsGetUrl   : DEFAULT_HTTPS_GET_URL,
		httpsPostUrl  : DEFAULT_HTTPS_POST_URL,
		httpsPostBody : DEFAULT_HTTPS_POST_BODY,
		reqTimeout    : DEFAULT_REQ_TIMEOUT,
		proxy         : null
	}

	option = merge(defaultOption,option);
	if(!option.proxy) throw('please assign a proxy server!');

	async.parallel([

		//HTTP GET
		function(callback){
			testSingle({
				url    :option.httpGetUrl,
				proxy  :option.proxy,
				method :"GET",
				timeout:option.reqTimeout
			},callback);
		},

		//HTTP POST
		function(callback){ //TODO : post target
			testSingle({
				url    :option.httpPostUrl,
				proxy  :option.proxy,
				method :"POST",
				body   :option.httpPostBody,
				timeout:option.reqTimeout
			},callback);
		},

		//HTTPS GET
		function(callback){
			testSingle({
				url    :option.httpsGetUrl,
				proxy  :option.proxy,
				method :"GET",
				timeout:option.reqTimeout
			},callback);
		},

		//HTTPS POST
		function(callback){
			testSingle({
				url    :option.httpsPostUrl,
				proxy  :option.proxy,
				method :"POST",
				body   :option.httpsPostBody,
				timeout:option.reqTimeout
			},callback);
		}
	],function(err,results){

		results.map(function(record, index){
			record.success = !!((record.statusCode == 200) && (record.length > 500) && record.resHeader);
		});

		userCallback && userCallback(results);
	});
}

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
		reqModule   = /https/.test(opts.protocol) ? https : http,
		desc;

	opts.rejectUnauthorized = false;
	opts.agent = new proxyModule(proxy);
	opts.method = option.method || "GET";
	desc = opts.protocol +  " " + opts.method + " " + endpoint;
	
	var singleRecord = {
		url       : endpoint,
		method    : opts.method,
		desc      : desc,
		start     : Date.now(),
		end       : null,
		resHeader : null,
		length    : 0,
		finish    : false,
		error     : null,
		statusCode: null,
		_ended    : false //whether callback has been dealed
	}

	var req = reqModule.request(opts,function(res){
		var length = 0;
		singleRecord.statusCode = res.statusCode;

		res.on("data",function(data){
			if(singleRecord._ended) return;
			length += data.length;
		});

		res.on("end",function(){
			if(singleRecord._ended) return;

			singleRecord.end       = Date.now();
			singleRecord.resHeader = res.headers;
			singleRecord.length    = length;
			singleRecord.finish    = true;
			singleRecord._ended    = true;
			callback(null,singleRecord);
		});
	}).on("error",function(e){
		if(singleRecord._ended) return;

		singleRecord.error = e;
		singleRecord._ended    = true;
		callback(null,singleRecord);
	});

	option.body && req.write(option.body);
	req.end();

	setTimeout(function(){
		if(singleRecord._ended) return;

		singleRecord._ended = true;
		singleRecord.error = new Error("request time out (" + option.timeout + " ms)");
		callback(null,singleRecord);
		req.abort();

	},option.timeout);
}

function merge(baseObj, extendObj){
	for(var key in extendObj){
		baseObj[key] = extendObj[key];
	}

	return baseObj;
}

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


module.exports.test = test;
module.exports.printResult = printResult;