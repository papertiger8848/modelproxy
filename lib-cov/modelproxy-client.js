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
_$jscoverage_init(_$jscoverage, "lib/modelproxy-client.js",[1,3,5,7,17,21,23,24,25,27,28,29,32,36,36,37,38,40,46,49,54,55,58,59,59,60,61,62,63,66,70,70,72,73,74,78,81,82,83,84,85,87,88,91,92,95,98,99,100,101,102,103,104,106,110,116,118,118,120,121,122,124,126,127,130,132,134,135,136,137,138,140,141,142,145,153,157,158,161,162,165]);
_$jscoverage_init(_$jscoverage_cond, "lib/modelproxy-client.js",[24,28,36,59,62,70,72,73,81,87,103,118,120,141]);
_$jscoverage["lib/modelproxy-client.js"].source = ["KISSY.add( 'modelproxy', function ( S, IO ) {","    function Proxy( options ) {","        this._opt = options;","    }","    Proxy.prototype = {","        request: function( params, callback, errCallback ) {","            IO( {","                url: Proxy.base + '/' + this._opt.id,","                data: params,","                type: this._opt.method,","                dataType: this._opt.dataType,","                success: callback,","                error: errCallback","            } );","        },","        getOptions: function() {","            return this._opt;","        }","    };","","    Proxy.objects = {};","","    Proxy.create = function( id ) {","        if ( this.objects[ id ] ) {","            return this.objects[ id ];","        }","        var options = this._interfaces[ id ];","        if ( !options ) {","            throw new Error( 'No such interface id defined: '","                 + id + ', please check your interface configuration file' );","        }","        return this.objects[ id ] = new this( options );","    },","","    Proxy.configBase = function( base ) {","        if ( this.base ) return;","        this.base = ( base || '' ).replace( /\\/$/, '' );","        var self = this;","        // load interfaces definition.","        IO( {","            url: this.base + '/$interfaces',","            async: false,","            type: 'get',","            dataType: 'json',","            success: function( interfaces ) {","                self.config( interfaces );","            },","            error: function( err ) {","                throw err;","            }","        } );","    };","","    Proxy.config = function( interfaces ) {","        this._interfaces = interfaces;","    };","","    Proxy.getInterfaceIdsByPrefix = function( pattern ) {","        if ( !pattern ) return [];","        var ids = [], map = this._interfaces, len = pattern.length;","        for ( var id in map ) {","            if ( id.slice( 0, len ) == pattern ) {","                ids.push( id );","            }","        }","        return ids;","    };","","    function ModelProxy( profile ) {","        if ( !profile ) return;","","        if ( typeof profile === 'string' ) {","            if ( /^(\\w+\\.)+\\*$/.test( profile ) ) {","                profile = Proxy","                    .getInterfaceIdsByPrefix( profile.replace( /\\*$/, '' ) );","","            } else {","                profile = [ profile ];","            }","        }","        if ( profile instanceof Array ) {","            var prof = {}, methodName;","            for ( var i = profile.length - 1; i >= 0; i-- ) {","                methodName = profile[ i ];","                methodName = methodName","                                .substring( methodName.lastIndexOf( '.' ) + 1 );","                if ( !prof[ methodName ] ) {","                    prof[ methodName ] = profile[ i ];","","                } else {","                    methodName = profile[ i ].replace( /\\./g, '_' );","                    prof[ methodName ] = profile[ i ]; ","                }","            }","            profile = prof;","        }","        ","        for ( var method in profile ) {","            this[ method ] = ( function( methodName, interfaceId ) {","                var proxy = Proxy.create( interfaceId );","                return function( params ) {","                    params = params || {};","                    if ( !this._queue ) {","                        this._queue = [];","                    }","                    this._queue.push( {","                        params: params,","                        proxy: proxy","                    } );","                    return this;","                };","            } )( method, profile[ method ] );","        }","    }","","    ModelProxy.prototype = {","        done: function( f, ef ) {","            if ( typeof f !== 'function' ) return;","","            if ( !this._queue ) {","                f.apply( this );","                return;","            }","            this._sendRequestsParallel( this._queue, f, ef );","","            this._queue = null;","            return this;","        },","        _sendRequestsParallel: function( queue, callback, errCallback ) {","            var args = [], self = this;","","            var cnt = queue.length;","","            for ( var i = 0; i < queue.length; i++ ) {","                ( function( reqObj, k ) {","                    reqObj.proxy.request( reqObj.params, function( data ) {","                        args[ k ] = data;","                        --cnt || callback.apply( self, args );","                    }, function( err ) {","                        errCallback = errCallback || self._errCallback;","                        if ( typeof errCallback === 'function' ) {","                            errCallback( err );","","                        } else {","                            console.error( 'Error occured when sending request ='","                                , reqObj.proxy.getOptions(), '\\nCaused by:\\n', err );","                        }","                    } );","                } )( queue[i], i );","            }","        },","        error: function( f ) {","            this._errCallback = f;","        }","    };","","    ModelProxy.create = function( profile ) {","        return new this( profile );","    };","","    ModelProxy.configBase = function( path ) {","        Proxy.configBase( path );","    };","    ","    return ModelProxy;","","}, { requires: ['io'] } );"];
_$jscoverage_done("lib/modelproxy-client.js", 1);
KISSY.add("modelproxy", function(S, IO) {
    function Proxy(options) {
        _$jscoverage_done("lib/modelproxy-client.js", 3);
        this._opt = options;
    }
    _$jscoverage_done("lib/modelproxy-client.js", 5);
    Proxy.prototype = {
        request: function(params, callback, errCallback) {
            _$jscoverage_done("lib/modelproxy-client.js", 7);
            IO({
                url: Proxy.base + "/" + this._opt.id,
                data: params,
                type: this._opt.method,
                dataType: this._opt.dataType,
                success: callback,
                error: errCallback
            });
        },
        getOptions: function() {
            _$jscoverage_done("lib/modelproxy-client.js", 17);
            return this._opt;
        }
    };
    _$jscoverage_done("lib/modelproxy-client.js", 21);
    Proxy.objects = {};
    _$jscoverage_done("lib/modelproxy-client.js", 23);
    Proxy.create = function(id) {
        _$jscoverage_done("lib/modelproxy-client.js", 24);
        if (_$jscoverage_done("lib/modelproxy-client.js", 24, this.objects[id])) {
            _$jscoverage_done("lib/modelproxy-client.js", 25);
            return this.objects[id];
        }
        _$jscoverage_done("lib/modelproxy-client.js", 27);
        var options = this._interfaces[id];
        _$jscoverage_done("lib/modelproxy-client.js", 28);
        if (_$jscoverage_done("lib/modelproxy-client.js", 28, !options)) {
            _$jscoverage_done("lib/modelproxy-client.js", 29);
            throw new Error("No such interface id defined: " + id + ", please check your interface configuration file");
        }
        _$jscoverage_done("lib/modelproxy-client.js", 32);
        return this.objects[id] = new this(options);
    }, Proxy.configBase = function(base) {
        _$jscoverage_done("lib/modelproxy-client.js", 36);
        if (_$jscoverage_done("lib/modelproxy-client.js", 36, this.base)) {
            _$jscoverage_done("lib/modelproxy-client.js", 36);
            return;
        }
        _$jscoverage_done("lib/modelproxy-client.js", 37);
        this.base = (base || "").replace(/\/$/, "");
        _$jscoverage_done("lib/modelproxy-client.js", 38);
        var self = this;
        _$jscoverage_done("lib/modelproxy-client.js", 40);
        IO({
            url: this.base + "/$interfaces",
            async: false,
            type: "get",
            dataType: "json",
            success: function(interfaces) {
                _$jscoverage_done("lib/modelproxy-client.js", 46);
                self.config(interfaces);
            },
            error: function(err) {
                _$jscoverage_done("lib/modelproxy-client.js", 49);
                throw err;
            }
        });
    };
    _$jscoverage_done("lib/modelproxy-client.js", 54);
    Proxy.config = function(interfaces) {
        _$jscoverage_done("lib/modelproxy-client.js", 55);
        this._interfaces = interfaces;
    };
    _$jscoverage_done("lib/modelproxy-client.js", 58);
    Proxy.getInterfaceIdsByPrefix = function(pattern) {
        _$jscoverage_done("lib/modelproxy-client.js", 59);
        if (_$jscoverage_done("lib/modelproxy-client.js", 59, !pattern)) {
            _$jscoverage_done("lib/modelproxy-client.js", 59);
            return [];
        }
        _$jscoverage_done("lib/modelproxy-client.js", 60);
        var ids = [], map = this._interfaces, len = pattern.length;
        _$jscoverage_done("lib/modelproxy-client.js", 61);
        for (var id in map) {
            _$jscoverage_done("lib/modelproxy-client.js", 62);
            if (_$jscoverage_done("lib/modelproxy-client.js", 62, id.slice(0, len) == pattern)) {
                _$jscoverage_done("lib/modelproxy-client.js", 63);
                ids.push(id);
            }
        }
        _$jscoverage_done("lib/modelproxy-client.js", 66);
        return ids;
    };
    function ModelProxy(profile) {
        _$jscoverage_done("lib/modelproxy-client.js", 70);
        if (_$jscoverage_done("lib/modelproxy-client.js", 70, !profile)) {
            _$jscoverage_done("lib/modelproxy-client.js", 70);
            return;
        }
        _$jscoverage_done("lib/modelproxy-client.js", 72);
        if (_$jscoverage_done("lib/modelproxy-client.js", 72, typeof profile === "string")) {
            _$jscoverage_done("lib/modelproxy-client.js", 73);
            if (_$jscoverage_done("lib/modelproxy-client.js", 73, /^(\w+\.)+\*$/.test(profile))) {
                _$jscoverage_done("lib/modelproxy-client.js", 74);
                profile = Proxy.getInterfaceIdsByPrefix(profile.replace(/\*$/, ""));
            } else {
                _$jscoverage_done("lib/modelproxy-client.js", 78);
                profile = [ profile ];
            }
        }
        _$jscoverage_done("lib/modelproxy-client.js", 81);
        if (_$jscoverage_done("lib/modelproxy-client.js", 81, profile instanceof Array)) {
            _$jscoverage_done("lib/modelproxy-client.js", 82);
            var prof = {}, methodName;
            _$jscoverage_done("lib/modelproxy-client.js", 83);
            for (var i = profile.length - 1; i >= 0; i--) {
                _$jscoverage_done("lib/modelproxy-client.js", 84);
                methodName = profile[i];
                _$jscoverage_done("lib/modelproxy-client.js", 85);
                methodName = methodName.substring(methodName.lastIndexOf(".") + 1);
                _$jscoverage_done("lib/modelproxy-client.js", 87);
                if (_$jscoverage_done("lib/modelproxy-client.js", 87, !prof[methodName])) {
                    _$jscoverage_done("lib/modelproxy-client.js", 88);
                    prof[methodName] = profile[i];
                } else {
                    _$jscoverage_done("lib/modelproxy-client.js", 91);
                    methodName = profile[i].replace(/\./g, "_");
                    _$jscoverage_done("lib/modelproxy-client.js", 92);
                    prof[methodName] = profile[i];
                }
            }
            _$jscoverage_done("lib/modelproxy-client.js", 95);
            profile = prof;
        }
        _$jscoverage_done("lib/modelproxy-client.js", 98);
        for (var method in profile) {
            _$jscoverage_done("lib/modelproxy-client.js", 99);
            this[method] = function(methodName, interfaceId) {
                _$jscoverage_done("lib/modelproxy-client.js", 100);
                var proxy = Proxy.create(interfaceId);
                _$jscoverage_done("lib/modelproxy-client.js", 101);
                return function(params) {
                    _$jscoverage_done("lib/modelproxy-client.js", 102);
                    params = params || {};
                    _$jscoverage_done("lib/modelproxy-client.js", 103);
                    if (_$jscoverage_done("lib/modelproxy-client.js", 103, !this._queue)) {
                        _$jscoverage_done("lib/modelproxy-client.js", 104);
                        this._queue = [];
                    }
                    _$jscoverage_done("lib/modelproxy-client.js", 106);
                    this._queue.push({
                        params: params,
                        proxy: proxy
                    });
                    _$jscoverage_done("lib/modelproxy-client.js", 110);
                    return this;
                };
            }(method, profile[method]);
        }
    }
    _$jscoverage_done("lib/modelproxy-client.js", 116);
    ModelProxy.prototype = {
        done: function(f, ef) {
            _$jscoverage_done("lib/modelproxy-client.js", 118);
            if (_$jscoverage_done("lib/modelproxy-client.js", 118, typeof f !== "function")) {
                _$jscoverage_done("lib/modelproxy-client.js", 118);
                return;
            }
            _$jscoverage_done("lib/modelproxy-client.js", 120);
            if (_$jscoverage_done("lib/modelproxy-client.js", 120, !this._queue)) {
                _$jscoverage_done("lib/modelproxy-client.js", 121);
                f.apply(this);
                _$jscoverage_done("lib/modelproxy-client.js", 122);
                return;
            }
            _$jscoverage_done("lib/modelproxy-client.js", 124);
            this._sendRequestsParallel(this._queue, f, ef);
            _$jscoverage_done("lib/modelproxy-client.js", 126);
            this._queue = null;
            _$jscoverage_done("lib/modelproxy-client.js", 127);
            return this;
        },
        _sendRequestsParallel: function(queue, callback, errCallback) {
            _$jscoverage_done("lib/modelproxy-client.js", 130);
            var args = [], self = this;
            _$jscoverage_done("lib/modelproxy-client.js", 132);
            var cnt = queue.length;
            _$jscoverage_done("lib/modelproxy-client.js", 134);
            for (var i = 0; i < queue.length; i++) {
                _$jscoverage_done("lib/modelproxy-client.js", 135);
                (function(reqObj, k) {
                    _$jscoverage_done("lib/modelproxy-client.js", 136);
                    reqObj.proxy.request(reqObj.params, function(data) {
                        _$jscoverage_done("lib/modelproxy-client.js", 137);
                        args[k] = data;
                        _$jscoverage_done("lib/modelproxy-client.js", 138);
                        --cnt || callback.apply(self, args);
                    }, function(err) {
                        _$jscoverage_done("lib/modelproxy-client.js", 140);
                        errCallback = errCallback || self._errCallback;
                        _$jscoverage_done("lib/modelproxy-client.js", 141);
                        if (_$jscoverage_done("lib/modelproxy-client.js", 141, typeof errCallback === "function")) {
                            _$jscoverage_done("lib/modelproxy-client.js", 142);
                            errCallback(err);
                        } else {
                            _$jscoverage_done("lib/modelproxy-client.js", 145);
                            console.error("Error occured when sending request =", reqObj.proxy.getOptions(), "\nCaused by:\n", err);
                        }
                    });
                })(queue[i], i);
            }
        },
        error: function(f) {
            _$jscoverage_done("lib/modelproxy-client.js", 153);
            this._errCallback = f;
        }
    };
    _$jscoverage_done("lib/modelproxy-client.js", 157);
    ModelProxy.create = function(profile) {
        _$jscoverage_done("lib/modelproxy-client.js", 158);
        return new this(profile);
    };
    _$jscoverage_done("lib/modelproxy-client.js", 161);
    ModelProxy.configBase = function(path) {
        _$jscoverage_done("lib/modelproxy-client.js", 162);
        Proxy.configBase(path);
    };
    _$jscoverage_done("lib/modelproxy-client.js", 165);
    return ModelProxy;
}, {
    requires: [ "io" ]
});