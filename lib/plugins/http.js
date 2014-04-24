/**
 * Http Proxy Class
 */

var util = require( 'util' )
  , url = require( 'url' )
  , http = require( 'http' )
  , iconv = require( 'iconv-lite' )
  , Agent = require( 'agentkeepalive' )
  , Constant = require( '../constant' );

var keepAliveAgent = new Agent( { maxSockets: 1000 } );
var ProxyBase = require( '../proxy' );

// HttpProxy Constructor
function HttpProxy( options ) {
    // ProxyBase.call( this, options );
    this._opt = options || {};

    var urls = this._opt.urls || {};

    if ( this._opt.status === Constant.STATUS_MOCK 
        || this._opt.status === Constant.STATUS_MOCK_ERR ) {
        return;
    }
    var currUrl = urls[ this._opt.status ];

    if ( !currUrl ) {
        throw new Error( 'No url can be proxied! InterfaceId = ' + options.id );
    }

    var urlObj = url.parse( currUrl );
    this._opt.hostname = urlObj.hostname;
    this._opt.port = urlObj.port || 80;
    this._opt.path = urlObj.path
                   + ( urlObj.path.indexOf( '?' ) !== -1  ? '&' : '?' )
                   + 'version=' + this._opt.version;
}

// Inherits ProxyBase
util.inherits( HttpProxy, ProxyBase );

// @override request function
HttpProxy.prototype.request = function( params, callback, errCallback, cookie ) {
    if ( this._opt.isCookieNeeded === true && cookie === undefined ) {
        throw new Error( 'This request is cookie needed, you must set a cookie for'
            + ' it before request. id = ' + this._opt.id );
    }

    // errCallback = typeof errCallback !== 'function' 
    //             ? function( e ) { logger.error( e ); }
    //             : errCallback;

    if ( this._opt.status === Constant.STATUS_MOCK 
            || this._opt.status === Constant.STATUS_MOCK_ERR ) {
        this.requestMock( params, callback, errCallback );
        return;
    }

    var self = this;

    var options = {
        hostname: self._opt.hostname,
        port: self._opt.port,
        path: self._opt.path,
        method: self._opt.method,
        headers: { 'Cookie': cookie },
        agent: keepAliveAgent,
        keepAlive: true
    };

    var querystring = queryStringify( params );

    if ( self._opt.method === Constant.POST ) {
        options.headers[ 'Content-Type' ] = 'application/x-www-form-urlencoded';
        options.headers[ 'Content-Length' ] = querystring.length;

    } else if ( self._opt.method === Constant.GET ) {
        options.path += querystring;
    }

    var timer = setTimeout( function() {
        errCallback( new Error( 'timeout' ) );
    }, self._opt.timeout || 5000 );

    var req = http.request( options, function( res ) {
        var source = [], size = 0;
        res.on( 'data', function( chunk ) {
            source.push( chunk );
            size += chunk.length;
        } );
        res.on( 'end', function() {
            var buffer = Buffer.concat( source, size );
            try {
                var result = self._opt.encoding === Constant.ENCODING_RAW 
                    ? buffer
                    : ( self._opt.dataType !== Constant.JSON && self._opt.dataType !== Constant.JSONP
                        ? iconv.fromEncoding( buffer, self._opt.encoding )
                        : JSON.parse( iconv.fromEncoding( buffer, self._opt.encoding ) ) );
            } catch ( e ) {
                clearTimeout( timer );
                errCallback( new Error( "The result has syntax error. " + e ) );
                return;
            }
            clearTimeout( timer );
            callback( result, res.headers['set-cookie'] );
        } );
        res.on( 'error', function() {
            clearTimeout( timer );
            errCallback( e );
        } );
    } );

    self._opt.method !== Constant.POST || req.write( querystring );
    req.on( 'error', function( e ) {
        clearTimeout( timer );
        errCallback( e );
    } );

    req.end();
};

// @override interceptRequest
HttpProxy.prototype.interceptRequest = function( req, res ) {
    if ( this._opt.status === Constant.STATUS_MOCK
            || this._opt.status === Constant.STATUS_MOCK_ERR ) {
        this.requestMock( {}, function( data ) {
            res.end( typeof data  === 'string' ? data : JSON.stringify( data ) );
        }, function( e ) {
            // logger.error( 'Error ocurred when mocking data', e );
            res.statusCode = 500;
            res.end( 'Error orccured when mocking data' );
        } );
        return;
    }
    var self = this;
    var options = {
        hostname: self._opt.hostname,
        port: self._opt.port,
        path: self._opt.path + req.url.replace( /^[^\?]*\?/, '' ),
        method: self._opt.method,
        headers: req.headers,
        agent: keepAliveAgent,
        keepAlive: true
    };

    options.headers.host = self._opt.hostname;
    // delete options.headers.referer;
    // delete options.headers['x-requested-with'];
    // delete options.headers['connection'];
    // delete options.headers['accept'];
    delete options.headers[ 'accept-encoding' ];
    
    var req2 = http.request( options, function( res2 ) {
        var source = [], size = 0;

        res2.on( 'data', function( chunk ) {
            source.push( chunk );
            size += chunk.length;
        } );
        res2.on( 'end', function() {
            var buffer = Buffer.concat( source, size );
            var result;
            try {
                result = self._opt.encoding === Constant.ENCODING_RAW 
                    ? buffer
                    : iconv.fromEncoding( buffer, self._opt.encoding );
            } catch ( e ) {
                res.statusCode = 500;
                res.end( e + '' );
                return;
            }
            res.setHeader( 'Set-Cookie', res2.headers['set-cookie'] );
            res.setHeader( 'Content-Type'
                , ( self._opt.dataType === Constant.JSON 
                        || self._opt.dataType === Constant.JSONP
                        ? 'application/json' : 'text/html' )
                  + ';charset=UTF-8' );

            res.end( result );
        } );
        res2.on( 'error', function( err ) {
            res.statusCode = 500;
            res.end( e + '' );
        } );
    } );

    req2.on( 'error', function( e ) {
        res.statusCode = 500;
        res.end( e + '' );
    } );
    req.on( 'data', function( chunck ) {
        req2.write( chunck );
    } );
    req.on( 'end', function() {
        req2.end();
    } );
};

function queryStringify( params ) {
    if ( !params || typeof params === 'string' ) {
        return params || '';
    } else if ( params instanceof Array ) {
        return params.join( '&' );
    }
    var qs = [], val;
    for ( var i in params ) {
        val = typeof params[i] === 'object' 
            ? JSON.stringify( params[ i ] )
            : params[ i ];
        qs.push( i + '=' + encodeURIComponent(val) );
    }
    return qs.join( '&' );
};

module.exports = HttpProxy;
