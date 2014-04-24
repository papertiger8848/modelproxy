/** 
 * ProxyFactory, Proxy
 * This class is provided to create proxy objects following the configuration
 * @author ShanFan
 * @created 24-3-2014
 */

// Dependencies
var fs = require( 'fs' );

// logger
var logger = console;

// Instance of InterfaceManager, will be intialized when the proxy.use() is called.
var interfaceManager;

// load proxy plugins.
var ProxyClassSet = {};
var dir = fs.readdirSync( __dirname + '/plugins' );
for ( var i in dir ) {
    if ( !/^\w+\.js$/.test( dir[i] ) ) continue;
    var type = dir[i].split( '.' )[0];
    try {
        ProxyClassSet[ type ] = require( './plugins/' + type );
    } catch ( e ) {
        logger.error( 'Failed to load proxy plugin '
            + dir[i] + ', Caused by:\n' + e );
    }
}

var ProxyFactory = {

    // {Object} An object map to store created proxies. The key is interface id
    // and the value is the proxy instance. 
    proxies: {},

    /**
     * use
     * @param {InterfaceManager} ifmgr
     * @throws errors
     */
    use: function( ifmgr ) {
        if ( ifmgr instanceof require( './interfacemanager' ) ) {
            interfaceManager = ifmgr;
        } else {
            throw new Error( 'Proxy can only use instance of InterfacefManager!' );
        }
        return this;
    },

    // Proxy factory
    // @throws errors
    create: function( interfaceId ) {
        if ( this.proxies[ interfaceId ] ) {
            return this.proxies[ interfaceId ];
        }
        var options = interfaceManager.getProfile( interfaceId );
        if ( !options ) {
            throw new Error( 'Invalid interface id: ' + interfaceId );
        }
        var ProxyClass = ProxyClassSet[ options.type ];
        if ( typeof ProxyClass !== 'function' ) {
            throw new Error( 'Invalid proxy type of ' + options.type + ' for interface ' + interfaceId );
        }
        return this.proxies[ interfaceId ] = new ProxyClass( options );
    },

    // setLogger
    setLogger: function( l ) {
        logger = l;
    },
    // getInterfaceIdsByPrefix
    getInterfaceIdsByPrefix: function( pattern ) {
        return interfaceManager.getInterfaceIdsByPrefix( pattern );
    },
    // Interceptor
    Interceptor: function( req, res ) {
        var interfaceId = req.url.split( /\?|\// )[ 1 ];
        if ( interfaceId === '$interfaces' ) {
            var interfaces = interfaceManager.getClientInterfaces();
            res.end( this.clientInterfaces 
                ? this.clientInterfaces 
                : this.clientInterfaces = JSON.stringify( interfaces ) );

            return;
        }

        try {
            proxy = this.create( interfaceId );
            if ( proxy.getOption( 'intercepted' ) === false ) {
                throw new Error( 'This url is not intercepted by proxy.' );
            }
        } catch ( e ) {
            res.statusCode = 404;
            res.end( 'Invalid url: ' + req.url + '\n' + e );
            return;
        }
        proxy.interceptRequest( req, res );
    }
}

module.exports = ProxyFactory;
