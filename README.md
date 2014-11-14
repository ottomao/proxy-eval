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

```
var testProxy = require("proxy-eval");

testProxy( {proxy : 'http://127.0.0.1:8001',reqTimeout:3000} ,function(results){
	console.log(results);
});
```




