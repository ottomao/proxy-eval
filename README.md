proxy-eval
=====================

Feature
---------------------
* a tool written in Node.js to figure out the availibility of a proxy server.
* will test these kinds of requests : http-get/http-post/https-get/https-post.

Guide
---------------------
* ``npm install proxy-eval --save``
* 

```javascript
var testProxy = require("proxy-eval");

testProxy( {proxy : 'http://127.0.0.1:8001',reqTimeout:3000} ,function(results){
	//results will contain four objects, which are the test result for http-get/http-post/https-get/https-post
	console.log(results); 
});
```


* sample result

```json
[
  {
    "url": "http://www.taobao.com",
    "method": "GET",
    "desc": "http: GET http://www.taobao.com",
    "start": 1415937919621,
    "end": 1415937919705,
    "resHeader": {
   		"foo":"bar"
    },
    "length": 45188,
    "finish": true,
    "error": null,
    "statusCode": 200,
    "_ended": true,
    "success": true
  },
  {
    "url": "http://www.taobao.com",
    "method": "POST",
    "desc": "http: POST http://www.taobao.com",
    "start": 1415937919625,
    "end": 1415937919716,
    "resHeader": {
   		"foo":"bar"
    },
    "length": 45188,
    "finish": true,
    "error": null,
    "statusCode": 200,
    "_ended": true,
    "success": true
  },
  ...
]
```

