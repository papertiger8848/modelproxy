/**
 * Proxy Base Class
 */

/* Constant */
var Constant = require( './constant' );

function Proxy( options ) {
    this._opt = options || {};
}

Proxy.prototype = {
    // should be overridden
    request: function( params, callback, errCallback ) {
        callback( 'Hello ModelProxy!' );
    },
    requestMock: function( params, callback, errCallback ) {
        try {
            if ( this._opt.isRuleStatic ) {
                callback( this._opt.status === Constant.STATUS_MOCK
                    ? this._opt.rule.response
                    : this._opt.rule.responseError );
                return;
            }
            var engine = getMockEngine( this._opt.engine );
            engine.mock( this._opt.rule
                , this._opt.status === Constant.STATUS_MOCK 
                    ? Constant.RESPONSE : Constant.RESPONSE_ERROR );

        } catch ( e ) {
            setTimeout( function() {
                errCallback( e );
            }, 1 );
        }
    },
    getOption: function( name ) {
        return this._opt[ name ];
    },
    // should be overridden
    interceptRequest: function( req, res ) {
        res.end( 'Hello ModelProxy!' );
    }
};

function getMockEngine( name ) {
    var engine = require( name );
    return {
        mock: function( rule, responseType ) {
            if ( name === 'river-mock' ) {
                return engine.spec2mock( rule, responseType );

            } else if ( name === 'mockjs' ) {
                return engine.mock( rule[responseType] );
            }
        }
    }
}

module.exports = Proxy;