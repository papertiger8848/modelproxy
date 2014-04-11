// instrument by jscoverage, do not modifly this file
(function () {
  var BASE;
  if (typeof global === 'object') {
    BASE = global;
  } else if (typeof window === 'object') {
    BASE = window;
  } else {
    throw new Error('[jscoverage] unknow ENV!');
  }
  if (!BASE._$jscoverage) {
    BASE._$jscoverage = {};
    BASE._$jscoverage_cond = {};
    BASE._$jscoverage_done = function (file, line, express) {
      if (arguments.length === 2) {
        BASE._$jscoverage[file][line] ++;
      } else {
        BASE._$jscoverage_cond[file][line] ++;
        return express;
      }
    };
    BASE._$jscoverage_init = function (base, file, lines) {
      var tmp = [];
      for (var i = 0; i < lines.length; i ++) {
        tmp[lines[i]] = 0;
      }
      base[file] = tmp;
    };
  }
})();
_$jscoverage_init(_$jscoverage, "lib/proxyfactory.js",[9,16,19,21,22,23,30,31,32,33,35,37,38,41,42,43,44,45,53,55,56,58,61,63,66,67,68,70,73,74,78,79,84,88,89,90,92,93,94,96,99,105,106,109,110,113,115,116,118,119,126,132,133,134,136,137,139,140,141,144,146,147,149,150,151,152,158,159,160,162,163,168,169,170,173,176,179,180,181,182,184,185,186,189,191,194,195,196,197,199,200,203,207,208,209,212,217,221,223,224,227,228,230,232,233,241,246,248,249,251,252,254,255,256,257,258,263,264,265,267,268,271,275,276,277,279,280,282,283,289,291,292,293,294,295,296,299,300,301,302,305,306,307,309,312]);
_$jscoverage_init(_$jscoverage_cond, "lib/proxyfactory.js",[32,32,37,55,67,89,93,105,105,113,113,132,136,179,179,181,196,199,207,221,221,293,301]);
_$jscoverage["lib/proxyfactory.js"].source = ["/** "," * ProxyFactory, Proxy"," * This class is provided to create proxy objects following the configuration"," * @author ShanFan"," * @created 24-3-2014"," */","","// Dependencies","var fs = require( 'fs' )","  , http = require( 'http' )","  , url = require( 'url' )","  , querystring = require( 'querystring' )","  , iconv = require( 'iconv-lite' )","  , BufferHelper = require( 'bufferhelper' );","","var InterfacefManager = require( './interfacemanager' );","","// Instance of InterfaceManager, will be intialized when the proxy.use() is called.","var interfaceManager;","","var STATUS_MOCK = 'mock';","var STATUS_MOCK_ERR = 'mockerr';","var ENCODING_RAW = 'raw';","","// Current Proxy Status","// var CurrentStatus;","","// Proxy constructor","function Proxy( options ) {","    this._opt = options || {};","    this._urls = this._opt.urls || {};","    if ( this._opt.status === STATUS_MOCK || this._opt.status === STATUS_MOCK_ERR ) {","        return;","    }","    var currUrl = this._urls[ this._opt.status ];","","    if ( !currUrl ) {","        throw new Error( 'No url can be proxied!' );","    };","","    var urlObj = url.parse( currUrl );","    this._opt.hostname = urlObj.hostname;","    this._opt.port = urlObj.port || 80;","    this._opt.path = urlObj.path;","    this._opt.method = (this._opt.method || 'GET').toUpperCase();","}","","/**"," * use"," * @param {InterfaceManager} ifmgr"," * @throws errors"," */","Proxy.use = function( ifmgr ) {","","    if ( ifmgr instanceof InterfacefManager ) {","        interfaceManager = ifmgr;","    } else {","        throw new Error( 'Proxy can only use instance of InterfacefManager!' );","    }","","    this._engineName = interfaceManager.getEngine();","","    return this;","};","","Proxy.getMockEngine = function() {","    if ( this._mockEngine ) {","        return this._mockEngine;","    }","    return this._mockEngine = require( this._engineName );","};","","Proxy.getInterfaceIdsByPrefix = function( pattern ) {","    return interfaceManager.getInterfaceIdsByPrefix( pattern );","};","","// @throws errors","Proxy.getRule = function( interfaceId ) {","    return interfaceManager.getRule( interfaceId );","};","","// {Object} An object map to store created proxies. The key is interface id","// and the value is the proxy instance. ","Proxy.objects = {};","","// Proxy factory","// @throws errors","Proxy.create = function( interfaceId ) {","    if ( !!this.objects[ interfaceId ] ) {","        return this.objects[ interfaceId ];","    }","    var opt = interfaceManager.getProfile( interfaceId );","    if ( !opt ) {","        throw new Error( 'Invalid interface id: ' + interfaceId );","    }","    return this.objects[ interfaceId ] = new this( opt );","};","","Proxy.prototype = {","    request: function( params, callback, errCallback, cookie ) {","        // if ( typeof callback !== 'function' ) {","        //     console.error( 'No callback function for request = ', this._opt );","        //     return;","        // }","        if ( this._opt.isCookieNeeded === true && cookie === undefined ) {","            throw new Error( 'This request is cookie needed, you must set a cookie for it before request. id = ' + this._opt.id );","        }","","        errCallback = typeof errCallback !== 'function' ","                    ? function( e ) { console.error( e ); }","                    : errCallback;","","        if ( this._opt.status === STATUS_MOCK ","                || this._opt.status === STATUS_MOCK_ERR ) {","            this._mockRequest( params, callback, errCallback );","            return;","        }","        var self = this;","        var options = {","            hostname: self._opt.hostname,","            port: self._opt.port,","            path: self._opt.path,","            method: self._opt.method,","            headers: { 'Cookie': cookie }","        };","        var querystring = self._queryStringify( params );","","        // // Set cookie","        // options.headers = {","        //     'Cookie': cookie","        // }","        if ( self._opt.method === 'POST' ) {","            options.headers[ 'Content-Type' ] = 'application/x-www-form-urlencoded';","            options.headers[ 'Content-Length' ] = querystring.length;","","        } else if ( self._opt.method === 'GET' ) {","            options.path += '?' + querystring;","        }","        var req = http.request( options, function( res ) {","            var timer = setTimeout( function() {","                errCallback( new Error( 'timeout' ) );","            }, self._opt.timeout || 5000 );","","            var bufferHelper = new BufferHelper();","            ","            res.on( 'data', function( chunk ) {","                bufferHelper.concat( chunk );","            } );","            res.on( 'end', function() {","                var buffer = bufferHelper.toBuffer();","                try {","                    var result = self._opt.encoding === ENCODING_RAW ","                        ? buffer","                        : ( self._opt.dataType !== 'json' ","                            ? iconv.fromEncoding( buffer, self._opt.encoding )","                            : JSON.parse( iconv.fromEncoding( buffer, self._opt.encoding ) ) );","                } catch ( e ) {","                    clearTimeout( timer );","                    errCallback( new Error( \"The result has syntax error. \" + e ) );","                    return;","                }","                clearTimeout( timer );","                callback( result, res.headers['set-cookie'] );","            } );","","        } );","","        self._opt.method !== 'POST' || req.write( querystring );","        req.on( 'error', function( e ) {","            errCallback( e );","        } );","","        req.end();","    },","    getOption: function( name ) {","        return this._opt[ name ];","    },","    _queryStringify: function( params ) {","        if ( !params || typeof params === 'string' ) {","            return params || '';","        } else if ( params instanceof Array ) {","            return params.join( '&' );","        }","        var qs = [], val;","        for ( var i in params ) {","            val = typeof params[i] === 'object' ","                ? JSON.stringify( params[ i ] )","                : params[ i ];","            qs.push( i + '=' + encodeURIComponent(val) );","        }","        return qs.join( '&' );","    },","    _mockRequest: function( params, callback, errCallback ) {","        try {","            var engine = Proxy.getMockEngine();","            if ( !this._rule ) {","                this._rule = Proxy.getRule( this._opt.id );","            }","            if ( this._opt.isRuleStatic ) {","                callback( this._opt.status === STATUS_MOCK","                    ? this._rule.response ","                    : this._rule.responseError );","                return;","            }","","            // special code for river-mock","            if ( Proxy._engineName === 'river-mock' ) {","                callback( engine.spec2mock( this._rule ) );","                return;","            }","            // special code for mockjs","            callback( this._opt.status === STATUS_MOCK","                ? engine.mock( this._rule.response )","                : engine.mock( this._rule.responseError )","            );","        } catch ( e ) {","            errCallback( e );","        }","    },","    interceptRequest: function( req, res ) {","        if ( this._opt.status === STATUS_MOCK","                || this._opt.status === STATUS_MOCK_ERR ) {","            this._mockRequest( {}, function( data ) {","                res.end( typeof data  === 'string' ? data : JSON.stringify( data ) );","            }, function( e ) {","                // console.error( 'Error ocurred when mocking data', e );","                res.statusCode = 500;","                res.end( 'Error orccured when mocking data' );","            } );","            return;","        }","        var self = this;","        var options = {","            hostname: self._opt.hostname,","            port: self._opt.port,","            path: self._opt.path + '?' + req.url.replace( /^[^\\?]*\\?/, '' ),","            method: self._opt.method,","            headers: req.headers","        };","","        options.headers.host = self._opt.hostname;","        // delete options.headers.referer;","        // delete options.headers['x-requested-with'];","        // delete options.headers['connection'];","        // delete options.headers['accept'];","        delete options.headers['accept-encoding'];","        ","        var req2 = http.request( options, function( res2 ) {","            var bufferHelper = new BufferHelper();","","            res2.on( 'data', function( chunk ) {","                bufferHelper.concat( chunk );","            } );","            res2.on( 'end', function() {","                var buffer = bufferHelper.toBuffer();","                var result;","                try {","                    result = self._opt.encoding === ENCODING_RAW ","                        ? buffer","                        : iconv.fromEncoding( buffer, self._opt.encoding );","","                } catch ( e ) {","                    res.statusCode = 500;","                    res.end( e + '' );","                    return;","                }","                res.setHeader( 'Set-Cookie', res2.headers['set-cookie'] );","                res.setHeader( 'Content-Type'","                    , ( self._opt.dataType === 'json' ? 'application/json' : 'text/html' )","                        + ';charset=UTF-8' );","                res.end( result );","            } );","        } );","","        req2.on( 'error', function( e ) {","            res.statusCode = 500;","            res.end( e + '' );","        } );","        req.on( 'data', function( chunck ) {","            req2.write( chunck );","        } );","        req.on( 'end', function() {","            req2.end();","        } );","        ","    }","};","","var ProxyFactory = Proxy;","","ProxyFactory.Interceptor = function( req, res ) {","    var interfaceId = req.url.split( /\\?|\\// )[1];","    if ( interfaceId === '$interfaces' ) {","        var interfaces = interfaceManager.getClientInterfaces();","        res.end( JSON.stringify( interfaces ) );","        return;","    }","","    try {","        proxy = this.create( interfaceId );","        if ( proxy.getOption( 'intercepted' ) === false ) {","            throw new Error( 'This url is not intercepted by proxy.' );","        }","    } catch ( e ) {","        res.statusCode = 404;","        res.end( 'Invalid url: ' + req.url + '\\n' + e );","        return;","    }","    proxy.interceptRequest( req, res );","};","","module.exports = ProxyFactory;","",""];
_$jscoverage_done("lib/proxyfactory.js", 9);
var fs = require("fs"), http = require("http"), url = require("url"), querystring = require("querystring"), iconv = require("iconv-lite"), BufferHelper = require("bufferhelper");

_$jscoverage_done("lib/proxyfactory.js", 16);
var InterfacefManager = require("./interfacemanager");

_$jscoverage_done("lib/proxyfactory.js", 19);
var interfaceManager;

_$jscoverage_done("lib/proxyfactory.js", 21);
var STATUS_MOCK = "mock";

_$jscoverage_done("lib/proxyfactory.js", 22);
var STATUS_MOCK_ERR = "mockerr";

_$jscoverage_done("lib/proxyfactory.js", 23);
var ENCODING_RAW = "raw";

function Proxy(options) {
    _$jscoverage_done("lib/proxyfactory.js", 30);
    this._opt = options || {};
    _$jscoverage_done("lib/proxyfactory.js", 31);
    this._urls = this._opt.urls || {};
    _$jscoverage_done("lib/proxyfactory.js", 32);
    if (_$jscoverage_done("lib/proxyfactory.js", 32, this._opt.status === STATUS_MOCK) || _$jscoverage_done("lib/proxyfactory.js", 32, this._opt.status === STATUS_MOCK_ERR)) {
        _$jscoverage_done("lib/proxyfactory.js", 33);
        return;
    }
    _$jscoverage_done("lib/proxyfactory.js", 35);
    var currUrl = this._urls[this._opt.status];
    _$jscoverage_done("lib/proxyfactory.js", 37);
    if (_$jscoverage_done("lib/proxyfactory.js", 37, !currUrl)) {
        _$jscoverage_done("lib/proxyfactory.js", 38);
        throw new Error("No url can be proxied!");
    }
    _$jscoverage_done("lib/proxyfactory.js", 41);
    var urlObj = url.parse(currUrl);
    _$jscoverage_done("lib/proxyfactory.js", 42);
    this._opt.hostname = urlObj.hostname;
    _$jscoverage_done("lib/proxyfactory.js", 43);
    this._opt.port = urlObj.port || 80;
    _$jscoverage_done("lib/proxyfactory.js", 44);
    this._opt.path = urlObj.path;
    _$jscoverage_done("lib/proxyfactory.js", 45);
    this._opt.method = (this._opt.method || "GET").toUpperCase();
}

_$jscoverage_done("lib/proxyfactory.js", 53);
Proxy.use = function(ifmgr) {
    _$jscoverage_done("lib/proxyfactory.js", 55);
    if (_$jscoverage_done("lib/proxyfactory.js", 55, ifmgr instanceof InterfacefManager)) {
        _$jscoverage_done("lib/proxyfactory.js", 56);
        interfaceManager = ifmgr;
    } else {
        _$jscoverage_done("lib/proxyfactory.js", 58);
        throw new Error("Proxy can only use instance of InterfacefManager!");
    }
    _$jscoverage_done("lib/proxyfactory.js", 61);
    this._engineName = interfaceManager.getEngine();
    _$jscoverage_done("lib/proxyfactory.js", 63);
    return this;
};

_$jscoverage_done("lib/proxyfactory.js", 66);
Proxy.getMockEngine = function() {
    _$jscoverage_done("lib/proxyfactory.js", 67);
    if (_$jscoverage_done("lib/proxyfactory.js", 67, this._mockEngine)) {
        _$jscoverage_done("lib/proxyfactory.js", 68);
        return this._mockEngine;
    }
    _$jscoverage_done("lib/proxyfactory.js", 70);
    return this._mockEngine = require(this._engineName);
};

_$jscoverage_done("lib/proxyfactory.js", 73);
Proxy.getInterfaceIdsByPrefix = function(pattern) {
    _$jscoverage_done("lib/proxyfactory.js", 74);
    return interfaceManager.getInterfaceIdsByPrefix(pattern);
};

_$jscoverage_done("lib/proxyfactory.js", 78);
Proxy.getRule = function(interfaceId) {
    _$jscoverage_done("lib/proxyfactory.js", 79);
    return interfaceManager.getRule(interfaceId);
};

_$jscoverage_done("lib/proxyfactory.js", 84);
Proxy.objects = {};

_$jscoverage_done("lib/proxyfactory.js", 88);
Proxy.create = function(interfaceId) {
    _$jscoverage_done("lib/proxyfactory.js", 89);
    if (_$jscoverage_done("lib/proxyfactory.js", 89, !!this.objects[interfaceId])) {
        _$jscoverage_done("lib/proxyfactory.js", 90);
        return this.objects[interfaceId];
    }
    _$jscoverage_done("lib/proxyfactory.js", 92);
    var opt = interfaceManager.getProfile(interfaceId);
    _$jscoverage_done("lib/proxyfactory.js", 93);
    if (_$jscoverage_done("lib/proxyfactory.js", 93, !opt)) {
        _$jscoverage_done("lib/proxyfactory.js", 94);
        throw new Error("Invalid interface id: " + interfaceId);
    }
    _$jscoverage_done("lib/proxyfactory.js", 96);
    return this.objects[interfaceId] = new this(opt);
};

_$jscoverage_done("lib/proxyfactory.js", 99);
Proxy.prototype = {
    request: function(params, callback, errCallback, cookie) {
        _$jscoverage_done("lib/proxyfactory.js", 105);
        if (_$jscoverage_done("lib/proxyfactory.js", 105, this._opt.isCookieNeeded === true) && _$jscoverage_done("lib/proxyfactory.js", 105, cookie === undefined)) {
            _$jscoverage_done("lib/proxyfactory.js", 106);
            throw new Error("This request is cookie needed, you must set a cookie for it before request. id = " + this._opt.id);
        }
        _$jscoverage_done("lib/proxyfactory.js", 109);
        errCallback = typeof errCallback !== "function" ? function(e) {
            _$jscoverage_done("lib/proxyfactory.js", 110);
            console.error(e);
        } : errCallback;
        _$jscoverage_done("lib/proxyfactory.js", 113);
        if (_$jscoverage_done("lib/proxyfactory.js", 113, this._opt.status === STATUS_MOCK) || _$jscoverage_done("lib/proxyfactory.js", 113, this._opt.status === STATUS_MOCK_ERR)) {
            _$jscoverage_done("lib/proxyfactory.js", 115);
            this._mockRequest(params, callback, errCallback);
            _$jscoverage_done("lib/proxyfactory.js", 116);
            return;
        }
        _$jscoverage_done("lib/proxyfactory.js", 118);
        var self = this;
        _$jscoverage_done("lib/proxyfactory.js", 119);
        var options = {
            hostname: self._opt.hostname,
            port: self._opt.port,
            path: self._opt.path,
            method: self._opt.method,
            headers: {
                Cookie: cookie
            }
        };
        _$jscoverage_done("lib/proxyfactory.js", 126);
        var querystring = self._queryStringify(params);
        _$jscoverage_done("lib/proxyfactory.js", 132);
        if (_$jscoverage_done("lib/proxyfactory.js", 132, self._opt.method === "POST")) {
            _$jscoverage_done("lib/proxyfactory.js", 133);
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
            _$jscoverage_done("lib/proxyfactory.js", 134);
            options.headers["Content-Length"] = querystring.length;
        } else {
            _$jscoverage_done("lib/proxyfactory.js", 136);
            if (_$jscoverage_done("lib/proxyfactory.js", 136, self._opt.method === "GET")) {
                _$jscoverage_done("lib/proxyfactory.js", 137);
                options.path += "?" + querystring;
            }
        }
        _$jscoverage_done("lib/proxyfactory.js", 139);
        var req = http.request(options, function(res) {
            _$jscoverage_done("lib/proxyfactory.js", 140);
            var timer = setTimeout(function() {
                _$jscoverage_done("lib/proxyfactory.js", 141);
                errCallback(new Error("timeout"));
            }, self._opt.timeout || 5e3);
            _$jscoverage_done("lib/proxyfactory.js", 144);
            var bufferHelper = new BufferHelper;
            _$jscoverage_done("lib/proxyfactory.js", 146);
            res.on("data", function(chunk) {
                _$jscoverage_done("lib/proxyfactory.js", 147);
                bufferHelper.concat(chunk);
            });
            _$jscoverage_done("lib/proxyfactory.js", 149);
            res.on("end", function() {
                _$jscoverage_done("lib/proxyfactory.js", 150);
                var buffer = bufferHelper.toBuffer();
                _$jscoverage_done("lib/proxyfactory.js", 151);
                try {
                    _$jscoverage_done("lib/proxyfactory.js", 152);
                    var result = self._opt.encoding === ENCODING_RAW ? buffer : self._opt.dataType !== "json" ? iconv.fromEncoding(buffer, self._opt.encoding) : JSON.parse(iconv.fromEncoding(buffer, self._opt.encoding));
                } catch (e) {
                    _$jscoverage_done("lib/proxyfactory.js", 158);
                    clearTimeout(timer);
                    _$jscoverage_done("lib/proxyfactory.js", 159);
                    errCallback(new Error("The result has syntax error. " + e));
                    _$jscoverage_done("lib/proxyfactory.js", 160);
                    return;
                }
                _$jscoverage_done("lib/proxyfactory.js", 162);
                clearTimeout(timer);
                _$jscoverage_done("lib/proxyfactory.js", 163);
                callback(result, res.headers["set-cookie"]);
            });
        });
        _$jscoverage_done("lib/proxyfactory.js", 168);
        self._opt.method !== "POST" || req.write(querystring);
        _$jscoverage_done("lib/proxyfactory.js", 169);
        req.on("error", function(e) {
            _$jscoverage_done("lib/proxyfactory.js", 170);
            errCallback(e);
        });
        _$jscoverage_done("lib/proxyfactory.js", 173);
        req.end();
    },
    getOption: function(name) {
        _$jscoverage_done("lib/proxyfactory.js", 176);
        return this._opt[name];
    },
    _queryStringify: function(params) {
        _$jscoverage_done("lib/proxyfactory.js", 179);
        if (_$jscoverage_done("lib/proxyfactory.js", 179, !params) || _$jscoverage_done("lib/proxyfactory.js", 179, typeof params === "string")) {
            _$jscoverage_done("lib/proxyfactory.js", 180);
            return params || "";
        } else {
            _$jscoverage_done("lib/proxyfactory.js", 181);
            if (_$jscoverage_done("lib/proxyfactory.js", 181, params instanceof Array)) {
                _$jscoverage_done("lib/proxyfactory.js", 182);
                return params.join("&");
            }
        }
        _$jscoverage_done("lib/proxyfactory.js", 184);
        var qs = [], val;
        _$jscoverage_done("lib/proxyfactory.js", 185);
        for (var i in params) {
            _$jscoverage_done("lib/proxyfactory.js", 186);
            val = typeof params[i] === "object" ? JSON.stringify(params[i]) : params[i];
            _$jscoverage_done("lib/proxyfactory.js", 189);
            qs.push(i + "=" + encodeURIComponent(val));
        }
        _$jscoverage_done("lib/proxyfactory.js", 191);
        return qs.join("&");
    },
    _mockRequest: function(params, callback, errCallback) {
        _$jscoverage_done("lib/proxyfactory.js", 194);
        try {
            _$jscoverage_done("lib/proxyfactory.js", 195);
            var engine = Proxy.getMockEngine();
            _$jscoverage_done("lib/proxyfactory.js", 196);
            if (_$jscoverage_done("lib/proxyfactory.js", 196, !this._rule)) {
                _$jscoverage_done("lib/proxyfactory.js", 197);
                this._rule = Proxy.getRule(this._opt.id);
            }
            _$jscoverage_done("lib/proxyfactory.js", 199);
            if (_$jscoverage_done("lib/proxyfactory.js", 199, this._opt.isRuleStatic)) {
                _$jscoverage_done("lib/proxyfactory.js", 200);
                callback(this._opt.status === STATUS_MOCK ? this._rule.response : this._rule.responseError);
                _$jscoverage_done("lib/proxyfactory.js", 203);
                return;
            }
            _$jscoverage_done("lib/proxyfactory.js", 207);
            if (_$jscoverage_done("lib/proxyfactory.js", 207, Proxy._engineName === "river-mock")) {
                _$jscoverage_done("lib/proxyfactory.js", 208);
                callback(engine.spec2mock(this._rule));
                _$jscoverage_done("lib/proxyfactory.js", 209);
                return;
            }
            _$jscoverage_done("lib/proxyfactory.js", 212);
            callback(this._opt.status === STATUS_MOCK ? engine.mock(this._rule.response) : engine.mock(this._rule.responseError));
        } catch (e) {
            _$jscoverage_done("lib/proxyfactory.js", 217);
            errCallback(e);
        }
    },
    interceptRequest: function(req, res) {
        _$jscoverage_done("lib/proxyfactory.js", 221);
        if (_$jscoverage_done("lib/proxyfactory.js", 221, this._opt.status === STATUS_MOCK) || _$jscoverage_done("lib/proxyfactory.js", 221, this._opt.status === STATUS_MOCK_ERR)) {
            _$jscoverage_done("lib/proxyfactory.js", 223);
            this._mockRequest({}, function(data) {
                _$jscoverage_done("lib/proxyfactory.js", 224);
                res.end(typeof data === "string" ? data : JSON.stringify(data));
            }, function(e) {
                _$jscoverage_done("lib/proxyfactory.js", 227);
                res.statusCode = 500;
                _$jscoverage_done("lib/proxyfactory.js", 228);
                res.end("Error orccured when mocking data");
            });
            _$jscoverage_done("lib/proxyfactory.js", 230);
            return;
        }
        _$jscoverage_done("lib/proxyfactory.js", 232);
        var self = this;
        _$jscoverage_done("lib/proxyfactory.js", 233);
        var options = {
            hostname: self._opt.hostname,
            port: self._opt.port,
            path: self._opt.path + "?" + req.url.replace(/^[^\?]*\?/, ""),
            method: self._opt.method,
            headers: req.headers
        };
        _$jscoverage_done("lib/proxyfactory.js", 241);
        options.headers.host = self._opt.hostname;
        _$jscoverage_done("lib/proxyfactory.js", 246);
        delete options.headers["accept-encoding"];
        _$jscoverage_done("lib/proxyfactory.js", 248);
        var req2 = http.request(options, function(res2) {
            _$jscoverage_done("lib/proxyfactory.js", 249);
            var bufferHelper = new BufferHelper;
            _$jscoverage_done("lib/proxyfactory.js", 251);
            res2.on("data", function(chunk) {
                _$jscoverage_done("lib/proxyfactory.js", 252);
                bufferHelper.concat(chunk);
            });
            _$jscoverage_done("lib/proxyfactory.js", 254);
            res2.on("end", function() {
                _$jscoverage_done("lib/proxyfactory.js", 255);
                var buffer = bufferHelper.toBuffer();
                _$jscoverage_done("lib/proxyfactory.js", 256);
                var result;
                _$jscoverage_done("lib/proxyfactory.js", 257);
                try {
                    _$jscoverage_done("lib/proxyfactory.js", 258);
                    result = self._opt.encoding === ENCODING_RAW ? buffer : iconv.fromEncoding(buffer, self._opt.encoding);
                } catch (e) {
                    _$jscoverage_done("lib/proxyfactory.js", 263);
                    res.statusCode = 500;
                    _$jscoverage_done("lib/proxyfactory.js", 264);
                    res.end(e + "");
                    _$jscoverage_done("lib/proxyfactory.js", 265);
                    return;
                }
                _$jscoverage_done("lib/proxyfactory.js", 267);
                res.setHeader("Set-Cookie", res2.headers["set-cookie"]);
                _$jscoverage_done("lib/proxyfactory.js", 268);
                res.setHeader("Content-Type", (self._opt.dataType === "json" ? "application/json" : "text/html") + ";charset=UTF-8");
                _$jscoverage_done("lib/proxyfactory.js", 271);
                res.end(result);
            });
        });
        _$jscoverage_done("lib/proxyfactory.js", 275);
        req2.on("error", function(e) {
            _$jscoverage_done("lib/proxyfactory.js", 276);
            res.statusCode = 500;
            _$jscoverage_done("lib/proxyfactory.js", 277);
            res.end(e + "");
        });
        _$jscoverage_done("lib/proxyfactory.js", 279);
        req.on("data", function(chunck) {
            _$jscoverage_done("lib/proxyfactory.js", 280);
            req2.write(chunck);
        });
        _$jscoverage_done("lib/proxyfactory.js", 282);
        req.on("end", function() {
            _$jscoverage_done("lib/proxyfactory.js", 283);
            req2.end();
        });
    }
};

_$jscoverage_done("lib/proxyfactory.js", 289);
var ProxyFactory = Proxy;

_$jscoverage_done("lib/proxyfactory.js", 291);
ProxyFactory.Interceptor = function(req, res) {
    _$jscoverage_done("lib/proxyfactory.js", 292);
    var interfaceId = req.url.split(/\?|\//)[1];
    _$jscoverage_done("lib/proxyfactory.js", 293);
    if (_$jscoverage_done("lib/proxyfactory.js", 293, interfaceId === "$interfaces")) {
        _$jscoverage_done("lib/proxyfactory.js", 294);
        var interfaces = interfaceManager.getClientInterfaces();
        _$jscoverage_done("lib/proxyfactory.js", 295);
        res.end(JSON.stringify(interfaces));
        _$jscoverage_done("lib/proxyfactory.js", 296);
        return;
    }
    _$jscoverage_done("lib/proxyfactory.js", 299);
    try {
        _$jscoverage_done("lib/proxyfactory.js", 300);
        proxy = this.create(interfaceId);
        _$jscoverage_done("lib/proxyfactory.js", 301);
        if (_$jscoverage_done("lib/proxyfactory.js", 301, proxy.getOption("intercepted") === false)) {
            _$jscoverage_done("lib/proxyfactory.js", 302);
            throw new Error("This url is not intercepted by proxy.");
        }
    } catch (e) {
        _$jscoverage_done("lib/proxyfactory.js", 305);
        res.statusCode = 404;
        _$jscoverage_done("lib/proxyfactory.js", 306);
        res.end("Invalid url: " + req.url + "\n" + e);
        _$jscoverage_done("lib/proxyfactory.js", 307);
        return;
    }
    _$jscoverage_done("lib/proxyfactory.js", 309);
    proxy.interceptRequest(req, res);
};

_$jscoverage_done("lib/proxyfactory.js", 312);
module.exports = ProxyFactory;