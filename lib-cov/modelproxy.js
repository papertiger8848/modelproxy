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
_$jscoverage_init(_$jscoverage, "lib/modelproxy.js",[9,25,25,27,30,31,35,38,39,40,41,42,44,45,50,51,54,58,59,60,61,62,64,65,69,73,80,82,82,85,86,87,90,93,94,97,98,102,105,108,109,111,113,116,117,120,123,124,125,128,136,139,147,148,152,153,156,159,162]);
_$jscoverage_init(_$jscoverage_cond, "lib/modelproxy.js",[25,27,30,38,44,64,82,85,124]);
_$jscoverage["lib/modelproxy.js"].source = ["/** "," * ModelProxy"," * As named, this class is provided to model the proxy."," * @author ShanFan"," * @created 24-3-2014"," **/","","// Dependencies","var InterfaceManager = require( './interfacemanager' )","  , ProxyFactory = require( './proxyfactory' );","","/**"," * ModelProxy Constructor"," * @param {Object|Array|String} profile. This profile describes what the model looks"," * like. eg:"," * profile = {"," *    getItems: 'Search.getItems',"," *    getCart: 'Cart.getCart'"," * }"," * profile = ['Search.getItems', 'Cart.getCart']"," * profile = 'Search.getItems'"," * profile = 'Search.*'"," */","function ModelProxy( profile ) {","    if ( !profile ) return;","","    if ( typeof profile === 'string' ) {","","        // Get ids via prefix pattern like 'packageName.*'","        if ( /^(\\w+\\.)+\\*$/.test( profile ) ) {","            profile = ProxyFactory","                .getInterfaceIdsByPrefix( profile.replace( /\\*$/, '' ) );","","        } else {","            profile = [ profile ];","        }","    }","    if ( profile instanceof Array ) {","        var prof = {}, methodName;","        for ( var i = profile.length - 1; i >= 0; i-- ) {","            methodName = profile[ i ];","            methodName = methodName","                            .substring( methodName.lastIndexOf( '.' ) + 1 );","            if ( !prof[ methodName ] ) {","                prof[ methodName ] = profile[ i ];","","            // The method name is duplicated, so the full interface id is set","            // as the method name.","            } else {","                methodName = profile[ i ].replace( /\\./g, '_' );","                prof[ methodName ] = profile[ i ]; ","            }","        }","        profile = prof;","    }","    ","    // Construct the model following the profile","    for ( var method in profile ) {","        this[ method ] = ( function( methodName, interfaceId ) {","            var proxy = ProxyFactory.create( interfaceId );","            return function( params ) {","                params = params || {};","","                if ( !this._queue ) {","                    this._queue = [];","                }","                // Push this method call into request queue. Once the done method","                // is called, all requests in this queue will be sent.","                this._queue.push( {","                    params: params,","                    proxy: proxy","                } );","                return this;","            };","        } )( method, profile[ method ] );","        // this._addMethod( method, profile[ method ] );","    }","}","","ModelProxy.prototype = {","    done: function( f, ef ) {","        if ( typeof f !== 'function' ) return;","","        // No request pushed in _queue, so callback directly and return.","        if ( !this._queue ) {","            f.apply( this );","            return;","        }","        // Send requests parallel","        this._sendRequestsParallel( this._queue, f, ef );","","        // Clear queue","        this._queue = null;","        return this;","    },","    withCookie: function( cookie ) {","        this._cookies = cookie;","        return this;","    },","    _sendRequestsParallel: function( queue, callback, errCallback ) {","        // The final data array","        var args = [], setcookies = [], self = this;","","        // Count the number of callback;","        var cnt = queue.length;","","        // Send each request","        for ( var i = 0; i < queue.length; i++ ) {","            ( function( reqObj, k, cookie ) {","","                reqObj.proxy.request( reqObj.params, function( data, setcookie ) {","                    // fill data for callback","                    args[ k ] = data;","","                    // concat setcookie for cookie rewriting","                    setcookies = setcookies.concat( setcookie );","                    args.push( setcookies );","","                    // push the set-cookies as the last parameter for the callback function. ","                    --cnt || callback.apply( self, args.push( setcookies ) && args );","","                }, function( err ) {","                    errCallback = errCallback || self._errCallback;","                    if ( typeof errCallback === 'function' ) {","                        errCallback( err );","","                    } else {","                        console.error( 'Error occured when sending request ='","                            , reqObj.params, '\\nCaused by:\\n', err );","                    }","                }, cookie ); // request with cookie.","","            } )( queue[i], i, self._cookies );","        }","        // clear cookie of this request.","        self._cookies = undefined;","    },","    error: function( f ) {","        this._errCallback = f;","    }","};","","/**"," * ModelProxy.init"," * @param {String} path The path refers to the interface configuration file."," */","ModelProxy.init = function( path ) {","    ProxyFactory.use( new InterfaceManager( path ) );","};","","","ModelProxy.create = function( profile ) {","    return new this( profile );","};","","ModelProxy.Interceptor = function( req, res ) {","    // todo: need to handle the case that the request url is multiple ","    // interfaces combined which configured in interface.json.","    ProxyFactory.Interceptor( req, res );","};","","module.exports = ModelProxy;",""];
_$jscoverage_done("lib/modelproxy.js", 9);
var InterfaceManager = require("./interfacemanager"), ProxyFactory = require("./proxyfactory");

function ModelProxy(profile) {
    _$jscoverage_done("lib/modelproxy.js", 25);
    if (_$jscoverage_done("lib/modelproxy.js", 25, !profile)) {
        _$jscoverage_done("lib/modelproxy.js", 25);
        return;
    }
    _$jscoverage_done("lib/modelproxy.js", 27);
    if (_$jscoverage_done("lib/modelproxy.js", 27, typeof profile === "string")) {
        _$jscoverage_done("lib/modelproxy.js", 30);
        if (_$jscoverage_done("lib/modelproxy.js", 30, /^(\w+\.)+\*$/.test(profile))) {
            _$jscoverage_done("lib/modelproxy.js", 31);
            profile = ProxyFactory.getInterfaceIdsByPrefix(profile.replace(/\*$/, ""));
        } else {
            _$jscoverage_done("lib/modelproxy.js", 35);
            profile = [ profile ];
        }
    }
    _$jscoverage_done("lib/modelproxy.js", 38);
    if (_$jscoverage_done("lib/modelproxy.js", 38, profile instanceof Array)) {
        _$jscoverage_done("lib/modelproxy.js", 39);
        var prof = {}, methodName;
        _$jscoverage_done("lib/modelproxy.js", 40);
        for (var i = profile.length - 1; i >= 0; i--) {
            _$jscoverage_done("lib/modelproxy.js", 41);
            methodName = profile[i];
            _$jscoverage_done("lib/modelproxy.js", 42);
            methodName = methodName.substring(methodName.lastIndexOf(".") + 1);
            _$jscoverage_done("lib/modelproxy.js", 44);
            if (_$jscoverage_done("lib/modelproxy.js", 44, !prof[methodName])) {
                _$jscoverage_done("lib/modelproxy.js", 45);
                prof[methodName] = profile[i];
            } else {
                _$jscoverage_done("lib/modelproxy.js", 50);
                methodName = profile[i].replace(/\./g, "_");
                _$jscoverage_done("lib/modelproxy.js", 51);
                prof[methodName] = profile[i];
            }
        }
        _$jscoverage_done("lib/modelproxy.js", 54);
        profile = prof;
    }
    _$jscoverage_done("lib/modelproxy.js", 58);
    for (var method in profile) {
        _$jscoverage_done("lib/modelproxy.js", 59);
        this[method] = function(methodName, interfaceId) {
            _$jscoverage_done("lib/modelproxy.js", 60);
            var proxy = ProxyFactory.create(interfaceId);
            _$jscoverage_done("lib/modelproxy.js", 61);
            return function(params) {
                _$jscoverage_done("lib/modelproxy.js", 62);
                params = params || {};
                _$jscoverage_done("lib/modelproxy.js", 64);
                if (_$jscoverage_done("lib/modelproxy.js", 64, !this._queue)) {
                    _$jscoverage_done("lib/modelproxy.js", 65);
                    this._queue = [];
                }
                _$jscoverage_done("lib/modelproxy.js", 69);
                this._queue.push({
                    params: params,
                    proxy: proxy
                });
                _$jscoverage_done("lib/modelproxy.js", 73);
                return this;
            };
        }(method, profile[method]);
    }
}

_$jscoverage_done("lib/modelproxy.js", 80);
ModelProxy.prototype = {
    done: function(f, ef) {
        _$jscoverage_done("lib/modelproxy.js", 82);
        if (_$jscoverage_done("lib/modelproxy.js", 82, typeof f !== "function")) {
            _$jscoverage_done("lib/modelproxy.js", 82);
            return;
        }
        _$jscoverage_done("lib/modelproxy.js", 85);
        if (_$jscoverage_done("lib/modelproxy.js", 85, !this._queue)) {
            _$jscoverage_done("lib/modelproxy.js", 86);
            f.apply(this);
            _$jscoverage_done("lib/modelproxy.js", 87);
            return;
        }
        _$jscoverage_done("lib/modelproxy.js", 90);
        this._sendRequestsParallel(this._queue, f, ef);
        _$jscoverage_done("lib/modelproxy.js", 93);
        this._queue = null;
        _$jscoverage_done("lib/modelproxy.js", 94);
        return this;
    },
    withCookie: function(cookie) {
        _$jscoverage_done("lib/modelproxy.js", 97);
        this._cookies = cookie;
        _$jscoverage_done("lib/modelproxy.js", 98);
        return this;
    },
    _sendRequestsParallel: function(queue, callback, errCallback) {
        _$jscoverage_done("lib/modelproxy.js", 102);
        var args = [], setcookies = [], self = this;
        _$jscoverage_done("lib/modelproxy.js", 105);
        var cnt = queue.length;
        _$jscoverage_done("lib/modelproxy.js", 108);
        for (var i = 0; i < queue.length; i++) {
            _$jscoverage_done("lib/modelproxy.js", 109);
            (function(reqObj, k, cookie) {
                _$jscoverage_done("lib/modelproxy.js", 111);
                reqObj.proxy.request(reqObj.params, function(data, setcookie) {
                    _$jscoverage_done("lib/modelproxy.js", 113);
                    args[k] = data;
                    _$jscoverage_done("lib/modelproxy.js", 116);
                    setcookies = setcookies.concat(setcookie);
                    _$jscoverage_done("lib/modelproxy.js", 117);
                    args.push(setcookies);
                    _$jscoverage_done("lib/modelproxy.js", 120);
                    --cnt || callback.apply(self, args.push(setcookies) && args);
                }, function(err) {
                    _$jscoverage_done("lib/modelproxy.js", 123);
                    errCallback = errCallback || self._errCallback;
                    _$jscoverage_done("lib/modelproxy.js", 124);
                    if (_$jscoverage_done("lib/modelproxy.js", 124, typeof errCallback === "function")) {
                        _$jscoverage_done("lib/modelproxy.js", 125);
                        errCallback(err);
                    } else {
                        _$jscoverage_done("lib/modelproxy.js", 128);
                        console.error("Error occured when sending request =", reqObj.params, "\nCaused by:\n", err);
                    }
                }, cookie);
            })(queue[i], i, self._cookies);
        }
        _$jscoverage_done("lib/modelproxy.js", 136);
        self._cookies = undefined;
    },
    error: function(f) {
        _$jscoverage_done("lib/modelproxy.js", 139);
        this._errCallback = f;
    }
};

_$jscoverage_done("lib/modelproxy.js", 147);
ModelProxy.init = function(path) {
    _$jscoverage_done("lib/modelproxy.js", 148);
    ProxyFactory.use(new InterfaceManager(path));
};

_$jscoverage_done("lib/modelproxy.js", 152);
ModelProxy.create = function(profile) {
    _$jscoverage_done("lib/modelproxy.js", 153);
    return new this(profile);
};

_$jscoverage_done("lib/modelproxy.js", 156);
ModelProxy.Interceptor = function(req, res) {
    _$jscoverage_done("lib/modelproxy.js", 159);
    ProxyFactory.Interceptor(req, res);
};

_$jscoverage_done("lib/modelproxy.js", 162);
module.exports = ModelProxy;