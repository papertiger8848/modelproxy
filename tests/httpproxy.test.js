describe( 'Proxy', function() {
  
  it( 'should construct a new Proxy object', function() {
    var p = new Proxy( {
      id: 'Search.getItems',
      urls: {
        online: 'http://www.modelproxy.com'
      },
      status: 'online'
    } );
    assert( p instanceof Proxy );
    console.log( p._opt );
  } );

  it( 'should throw error when no url is available', function() {
    assert.throws( function() {
      var p = new Proxy( {
        id: 'Search.getItems',
        status: 'online'
      } );
    }, function( err ) {
      return err.toString()
        .indexOf( 'No url can be proxied!' ) !== -1;
    } );

    assert.throws( function() {
      var p = new Proxy( {
        id: 'Search.getItems',
        urls: {
          online: 'http://www.modelproxy.com'
        }
      } );
    }, function( err ) {
      return err.toString()
        .indexOf( 'No url can be proxied!' ) !== -1;
    } );
  } );

  describe( '#getOption()', function() {
    it( 'should return status of this proxy', function() {
      var p = new Proxy( {
        id: 'Search.getItems',
        status: 'online',
        urls: {
          online: 'http://www.modelproxy.com'
        }
      } );
      assert.strictEqual( p.getOption( 'id' ), 'Search.getItems' );
    } );
  } );

  describe( '#_queryStringify()', function() {
    var p = new Proxy( {
      id: 'Search.getItems',
      status: 'online',
      urls: {
        online: 'http://www.modelproxy.com'
      }
    } );

    it( 'should return empty string if the params is null undefined', function() {
      assert.strictEqual( p._queryStringify( null ), '' );
      assert.strictEqual( p._queryStringify( undefined ), '' );
    } );

    it( 'should return the params itself if the type of params is string', function() {
      assert.strictEqual( p._queryStringify( 'a=b&c=d' ), 'a=b&c=d');
    } );

    it( 'should return the joined string with & if the params is instance of Array', function() {
      assert.strictEqual( p._queryStringify( [ 'a=b', 'c=d' ] ), 'a=b&c=d' );
      assert.strictEqual( p._queryStringify( [] ), '' );
    } );

    it( 'should return the joined string with & if the params is a key-value object', function() {
      assert.strictEqual( p._queryStringify( {a:'b', c:'d'} ), 'a=b&c=d' );
      assert.strictEqual( p._queryStringify( {} ), '' );
      assert.strictEqual( p._queryStringify( {a:'b', c:"{'d':'f'}"} )
        , "a=b&c=" + encodeURIComponent("{'d':'f'}") );
      assert.strictEqual( p._queryStringify( {a:'b', c:"['d','e']"} )
        , "a=b&c=" + encodeURIComponent("['d','e']") );
    } );
  } );
  
  describe( '#interceptRequest()', function() {
    it( 'should response mock data if the proxy status is mock', function( done ) {
      var p = new Proxy( {
          "name": "我的购物车",
          "id": "Cart.getMyCart",
          "urls": {
            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
          },
          "status": "mock"
      } );
      var res = {
        end: function( data ) {
          assert.equal( typeof data, 'string' );
          done();
        }
      }
      p.interceptRequest( null, res );
    } );

    it( 'should response mockerr data if the proxy status is mockerr.', function( done ) {
      var p = new Proxy( {
          "name": "我的购物车",
          "id": "Cart.getMyCart",
          "urls": {
            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
          },
          "ruleFile": "Cart.getCart.rule.json",
          "status": "mockerr"
      } );
      var res = {
        end: function( data ) {
          assert.notEqual( data.indexOf( 'this is error data' ), -1 );
          done();
        }
      }
      p.interceptRequest( null, res );

    } );

    it( 'should response error msg and set the status code as 500 when there is error.'
      , function( done ) {
        var p = new Proxy( {
          "name": "我的购物车1",
          "id": "Cart.getCart1",
          "urls": {
            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
          },
          "status": "mock"
        } );
        var res = {
          end: function( data ) {
            assert.strictEqual( this.statusCode, 500 );
            done();
          }
        };
        p.interceptRequest( null, res );
    } );

    it( 'should intercept the request and response data', function( done ) {
      var p = ProxyFactory.create( 'Search.suggest' );
      var req = {
        headers: {
          cookie: ''
        },
        url: 'Search.suggest?q=a',
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
          assert.notEqual( typeof this.headers['Content-Type'], 'undefined' );
          done();
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        }
      };
      p.interceptRequest( req, res );

    } );

  } );
  

  describe( '#request()', function() {
    var p = ProxyFactory.create( 'Search.suggest' );
    it( 'should get result from the remote', function( done ) {
      p.request( {q: 'i'}, function( result ) {
        done();
      } );
    } );

    it( 'should get the result from mock', function( done ) {
      ProxyFactory.create( 'Search.getNav' )
        .request( {q: 'i'}, function( result ) {
          assert.strictEqual( result, 'This is a mock text' );
          done();
        } );
    } );

    it( 'should get the result from mockerr', function( done ) {
      new Proxy( {
        'name': '导航获取接口',
        'id': 'Search.getNav',
        'urls': {
          'online': 'http://s.m.taobao.com/client/search.do'
        },
        'status': 'mockerr',
        'isRuleStatic': true
      } ).request( null, function( result ) {
        assert.strictEqual( result, 'This is a mock error' );
        done();
      } );
    } );

    it( 'should get the mocked result by mockEngine', function( done ) {
      ProxyFactory.create( 'Search.list' )
        .request( {q: 'i'}, function( result ) {
          assert.strictEqual( typeof result, 'object' );
          done();
        } );
    } );

    it( 'should get a buffer if the encoding of the result is  set as raw', function( done ) {
      new Proxy( {
        'name': '热词推荐接口',
        'id': 'Search.suggest',
        'urls': {
          'online': 'http://suggest.taobao.com/sug'
        },
        'encoding': 'raw',
        'status': 'online'
      } ).request( {q: 'i'}, function( result ) {
        assert( typeof result === 'object' );
        done();
      } );

    } );

    it( 'should get a json if the data type of the result is set as json', function( done ) {
      new Proxy( {
        'name': '热词推荐接口',
        'id': 'Search.suggest',
        'urls': {
          'online': 'http://suggest.taobao.com/sug'
        },
        'dataType': 'json',
        'status': 'online'
      } ).request( {q: 'i'}, function( result ) {
        assert( typeof result === 'object' );
        done();
      } );
    } );

    it( 'should get a string if the data type of the result is set as text', function( done ) {
      new Proxy( {
        'name': '热词推荐接口',
        'id': 'Search.suggest',
        'urls': {
          'online': 'http://suggest.taobao.com/sug'
        },
        'dataType': 'text',
        'status': 'online'
      } ).request( {q: 'i'}, function( result ) {
        assert( typeof result === 'string' );
        done();
      } );
    } );

    it( 'should get nothing if the request is cookie needed but no cookie is set for this request',
      function( done ) {

      new Proxy( {
        "name": "我的购物车",
        "id": "Cart.getMyCart",
        "urls": {
          "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
        },
        "status": "online",
        "encoding": "gbk"
      } ).request( {q: 'i'}, function( result ) {
        assert( result === '' );
        done();
      }, function( err ) {
        console.log( err );
      },  cookie );

      new Proxy( {
        "name": "我的购物车",
        "id": "Cart.getMyCart",
        "urls": {
          "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
        },
        "status": "online",
        "encoding": "gbk"
      } ).request( {q: 'i'}, function( result ) {
        console.log( result );
        assert( !result );
        done();
      }, function( err ) {
        console.log( err );
      } );
    } );
    
    it( 'should throw exception if the isCookieNeeded is set as true but no cookie is set for this request',
      function() {
      assert.throws( function() {
        new Proxy( {
          "name": "我的购物车",
          "id": "Cart.getMyCart",
          "urls": {
            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
          },
          "status": "online",
          "encoding": "gbk",
          "isCookieNeeded": true
        } ).request( {q: 'i'}, function( result ) {
          console.log( result );
          done();
        }, function( err ) {
          console.log( err );
        } );
      }, function( err ) {
        return err.toString().indexOf( 'This request is cookie needed' ) !== -1;
      } );
    } );
  } );
  
} );