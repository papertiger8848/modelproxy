var assert = require( 'assert' );

var ProxyFactory = require( '../lib-cov/proxyfactory' );
var InterfaceManager = require( '../lib-cov/interfacemanager' );

var ifmgr = new InterfaceManager( '../tests/interface_test.json' );
var cookie = 'ali_ab=42.120.74.193.1395041649126.7; l=c%E6%B5%8B%E8%AF%95%E8%B4%A6%E5%8F%B7135::1395387929931::11; cna=KcVJCxpk1XkCAX136Nv5aaC4; _tb_token_=DcE1K7Gbq9n; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; whl=-1%260%260%260; ck1=; lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598; lzstat_ss=3744453007_0_1396468901_2868200|970990289_0_1396468901_2898598; uc3=nk2=AKigXc46EgNui%2FwL&id2=Vy%2BbYvqj0fGT&vt3=F8dHqR%2F5HOhOUWkAFIo%3D&lg2=UtASsssmOIJ0bQ%3D%3D; lgc=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; tracknick=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; _cc_=U%2BGCWk%2F7og%3D%3D; tg=0; mt=ci=3_1&cyk=0_0; cookie2=1c5db2f359099faff00e14d7f39e16f2; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; v=0; uc1=cookie14=UoLVYyvcdJF0aw%3D%3D';

describe( 'ProxyFactory', function() {

  it( 'can only use object of InterfaceManager to initial the factory', function() {
    assert.throws( function() {
      ProxyFactory.use( {} );
    }, function( err ) {
      return err.toString()
        .indexOf( 'Proxy can only use instance of InterfacefManager' ) !== -1
    } );
  } );
  ProxyFactory.use( ifmgr );

  describe( '#getInterfaceIdsByPrefix()', function() {
    it( 'should return an id array', function() {
      assert.equal( ProxyFactory.getInterfaceIdsByPrefix( 'Search.' ).length, 3 );
    } );
  } );

  describe( '#create()', function() {
    it( 'should throw exception when the interface id is invalid', function() {
      assert.throws( function() {
        ProxyFactory.create( 'Search.getItems' );
      }, function( err ) {
        return err.toString()
          .indexOf( 'Invalid interface id: Search.getItems' ) !== -1;
      } );
    } );
  } );

  describe( '#Interceptor()', function() {
    it( 'should intercept the request which interface id is matched', function( done ) {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/Search.suggest?q=a',
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.notEqual( data.length,  0 );
          done();
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        },
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response 404 when the interface id is not matched', function() {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/Search.what?q=a'
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.strictEqual( this.statusCode,  404 );
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response 404 when the interface id is matched but the intercepted field is configurated as false'
      , function() {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/D.getNav?q=c'
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.strictEqual( this.statusCode,  404 );
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response client interfaces', function( done ) {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/$interfaces',
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      var res = {
        end:  function( data ) {
          assert.notEqual( data.length, 0 );
          done();
        }
      };
      ProxyFactory.Interceptor( req, res );
    } )

  } );

} );

var Proxy = ProxyFactory;




