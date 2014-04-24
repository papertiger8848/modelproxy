/** 
 * InterfaceManager
 * This Class is provided to parse the interface configuration file so that
 * the Proxy class can easily access the structure of the configuration.
 * @author ShanFan
 * @created 24-3-2014
 **/

var fs = require( 'fs' );
var Constant = require( './constant' );
var util = require( 'midway-parser' );
var logger = console;

/**
 * InterfaceManager 
 * @param {String|Object} path The file path of inteface configuration or the interface object
 * @param {Object} variables
 */
function InterfaceManager( path, variables ) {
    this._path = path;
    variables = variables || {};
    // {Object} Interface Mapping, The key is interface id and 
    // the value is a json profile for this interface.
    this._interfaceMap = {};

    // {Object} A interface Mapping for client, the key is interface id and 
    // the value is a json profile for this interface.
    this._clientInterfaces = {};

    // {String} The path of rulebase where the interface rules is stored. This value will be override
    // if user specified the path of rulebase in interface.json.
    this._rulebase = typeof path === 'string' ? path.replace( /\/[^\/]*$/, '/interfaceRules' ) : '';

    typeof path === 'string'
        ? this._loadProfilesFromPath( path, variables )
        : this._loadProfiles( path, variables );
}

// InterfaceManager prototype
InterfaceManager.prototype = {

    // @throws errors
    _loadProfilesFromPath: function( path, variables ) {
        logger.info( 'Loading interface profiles.\nPath = ', path );

        try {
            var profiles = fs.readFileSync( path, { encoding: 'utf8' } );
        } catch ( e ) {
            throw new Error( 'Fail to load interface profiles.' + e );
        }
        try {
            profiles = JSON.parse( profiles );
        } catch( e ) {
            throw new Error( 'Interface profiles has syntax error:' + e );
        }
        this._loadProfiles( profiles, variables );
    },
    
    _loadProfiles: function( profiles, variables ) {
        if ( !profiles ) return;
        try {
            profiles = util.parse( profiles, variables );
        } catch ( e ) {
            logger.error( 'Error occured when parsing interface file' );
            throw e;
        }

        logger.info( 'Title:', profiles.title, 'Version:', profiles.version );

        this._rulebase = profiles.rulebase
                       ? this._rulebase.replace( /\/[^\/]*$/, '/' + profiles.rulebase )
                       : this._rulebase;
        logger.info( 'interface path:' + this._path );
        logger.info( 'rulebase path:' + this._rulebase );
        
        // {String} The mock engine name.
        this._engine = profiles.engine || 'mockjs';

        if ( profiles.status === undefined ) {
            throw new Error( 'There is no status specified in interface configuration!' );
        }

        // {String} The interface status in using. 
        this._status = profiles.status;

        var interfaces = profiles.interfaces || [];
        for ( var i = interfaces.length - 1; i >= 0; i-- ) {
            this._addProfile( interfaces[i] ) 
                && logger.info( 'Interface[' + interfaces[i].id + '] is loaded.' );
        }
    },
    getProfile: function( interfaceId ) {
        return this._interfaceMap[ interfaceId ];
    },
    getClientInterfaces: function() {
        return this._clientInterfaces;
    },
    getTypeList: function() {

    },
    getEngine: function() {
        return this._engine;
    },
    getStatus: function( name ) {
        return this._status;
    },
    // @return Array
    getInterfaceIdsByPrefix: function( pattern ) {
        if ( !pattern ) return [];
        var ids = [], map = this._interfaceMap, len = pattern.length;
        for ( var id in map ) {
            if ( id.slice( 0, len ) == pattern ) {
                ids.push( id );
            }
        }
        return ids;
    },

    isProfileExisted: function( interfaceId ) {
        return !!this._interfaceMap[ interfaceId ];
    },
    _addProfile: function( prof ) {
        if ( !prof || !prof.id ) {
            logger.error( "Can not add interface profile without id!" );
            return false;
        }
        if ( !/^((\w+\.)*\w+)$/.test( prof.id ) ) {
            logger.error( "Invalid id: " + prof.id );
            return false;
        }
        if ( this.isProfileExisted( prof.id ) ) {
            logger.error( "Can not repeat to add interface [" + prof.id
                     + "]! Please check your interface configuration file!" );
            return false;
        }


        prof.ruleFile = this._rulebase + '/'
                         + ( prof.ruleFile || ( prof.id + ".rule.json" ) );

        if ( !this._isUrlsValid( prof.urls )
                && !fs.existsSync( prof.ruleFile ) ) {
            logger.error( 'Profile is deprecated:\n', 
                prof, '\nNo urls is configured and No ruleFile is available' );
            return false;
        }

        if (!(prof.status in prof.urls
                || prof.status === Constant.STATUS_MOCK
                || prof.status === Constant.STATUS_MOCK_ERR ) ) {
            prof.status = this._status;
        }
        
        if ( prof.status === Constant.STATUS_MOCK 
                || prof.status === Constant.STATUS_MOCK_ERR ) {
            try {
                prof.rule = require( prof.ruleFile );
            } catch ( e ) {
                logger.warn( 'Can not read rule file of ' + prof.id 
                    + ' , so deprecated this interface. Caused by:\n', e );
            }
        }

        prof.type                = prof.type || 'http'
        prof.engine              = prof.engine || this._engine;
        prof.method              = { POST: 'POST', GET:'GET' }
                                 [ (prof.method || 'GET').toUpperCase() ];
        prof.dataType            = { json: 'json', text: 'text', jsonp: 'jsonp' }
                                 [ (prof.dataType || 'json').toLowerCase() ];
        prof.isRuleStatic        = !!prof.isRuleStatic || false;
        prof.isCookieNeeded      = !!prof.isCookieNeeded || false;
        prof.signed              = !!prof.signed || false;
        prof.timeout             = prof.timeout || 2000;
        prof.version             = prof.version || '';
        prof.bypassProxyOnClient = !!prof.bypassProxyOnClient;

        this._interfaceMap[ prof.id ] = prof;

        this._clientInterfaces[ prof.id ] = {
            id: prof.id,
            method: prof.method,
            dataType: prof.dataType,
            version: prof.version,
            bypass: prof.bypassProxyOnClient,
            url: (prof.status !== 'mock' && prof.status !== 'mockerr') 
                ? prof.urls[ prof.status ] : '' 
        };

        return true;
    },
    _isUrlsValid: function( urls ) {
        if ( !urls ) return false;
        for ( var i in urls ) {
            return true;
        }
        return false;
    }
};

InterfaceManager.setLogger = function( l ) {
    logger = l;
};

module.exports = InterfaceManager;