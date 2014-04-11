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
_$jscoverage_init(_$jscoverage, "lib/interfacemanager.js",[9,16,20,24,28,30,36,40,42,43,45,47,48,50,52,56,56,57,59,64,66,67,71,73,74,75,80,83,87,88,90,91,92,94,95,97,99,100,102,106,109,113,113,114,115,116,117,120,124,127,128,129,131,132,133,135,136,138,141,144,146,148,150,152,155,157,159,160,161,162,166,168,174,177,177,178,179,181,185]);
_$jscoverage_init(_$jscoverage_cond, "lib/interfacemanager.js",[56,66,87,87,91,113,116,127,127,131,135,144,144,150,177]);
_$jscoverage["lib/interfacemanager.js"].source = ["/** "," * InterfaceManager"," * This Class is provided to parse the interface configuration file so that"," * the Proxy class can easily access the structure of the configuration."," * @author ShanFan"," * @created 24-3-2014"," **/","","var fs = require( 'fs' );","","/**"," * InterfaceManager "," * @param {String|Object} path The file path of inteface configuration or the interface object"," */","function InterfaceManager( path ) {","    this._path = path;","","    // {Object} Interface Mapping, The key is interface id and ","    // the value is a json profile for this interface.","    this._interfaceMap = {};","","    // {Object} A interface Mapping for client, the key is interface id and ","    // the value is a json profile for this interface.","    this._clientInterfaces = {};","","    // {String} The path of rulebase where the interface rules is stored. This value will be override","    // if user specified the path of rulebase in interface.json.","    this._rulebase = typeof path === 'string' ? path.replace( /\\/[^\\/]*$/, '/interfaceRules' ) : '';","","    typeof path === 'string'","        ? this._loadProfilesFromPath( path )","        : this._loadProfiles( path );","}","","// InterfaceManager prototype","InterfaceManager.prototype = {","","    // @throws errors","    _loadProfilesFromPath: function( path ) {","        console.info( 'Loading interface profiles.\\nPath = ', path );","","        try {","            var profiles = fs.readFileSync( path, { encoding: 'utf8' } );","        } catch ( e ) {","            throw new Error( 'Fail to load interface profiles.' + e );","        }","        try {","            profiles = JSON.parse( profiles );","        } catch( e ) {","            throw new Error( 'Interface profiles has syntax error:' + e );","        }","        this._loadProfiles( profiles );","    },","    ","    _loadProfiles: function( profiles ) {","        if ( !profiles ) return;","        console.info( 'Title:', profiles.title, 'Version:', profiles.version );","","        this._rulebase = profiles.rulebase ","                       ? ( profiles.rulebase || './' ).replace(/\\/$/, '')","                       : this._rulebase;","","        // {String} The mock engine name.","        this._engine = profiles.engine || 'mockjs';","","        if ( profiles.status === undefined ) {","            throw new Error( 'There is no status specified in interface configuration!' );","        }","","        // {String} The interface status in using. ","        this._status = profiles.status;","","        var interfaces = profiles.interfaces || [];","        for ( var i = interfaces.length - 1; i >= 0; i-- ) {","            this._addProfile( interfaces[i] ) ","                && console.info( 'Interface[' + interfaces[i].id + '] is loaded.' );","        }","    },","    getProfile: function( interfaceId ) {","        return this._interfaceMap[ interfaceId ];","    },","    getClientInterfaces: function() {","        return this._clientInterfaces;","    },","    // @throws errors","    getRule: function( interfaceId ) {","        if ( !interfaceId || !this._interfaceMap[ interfaceId ] ) {","            throw new Error( 'The interface profile ' + interfaceId + \" is not found.\" );","        }","        path = this._interfaceMap[ interfaceId ].ruleFile;","        if ( !fs.existsSync( path ) ) {","            throw new Error( 'The rule file is not existed.\\npath = ' + path );","        }","        try {","            var rulefile = fs.readFileSync( path, { encoding: 'utf8' } );","        } catch ( e ) {","            throw new Error( 'Fail to read rulefile of path ' + path );","        }","        try {","            return JSON.parse( rulefile );","        } catch( e ) {","            throw new Error( 'Rule file has syntax error. ' + e + '\\npath=' + path );","        }","    },","    getEngine: function() {","        return this._engine;","    },","    getStatus: function( name ) {","        return this._status;","    },","    // @return Array","    getInterfaceIdsByPrefix: function( pattern ) {","        if ( !pattern ) return [];","        var ids = [], map = this._interfaceMap, len = pattern.length;","        for ( var id in map ) {","            if ( id.slice( 0, len ) == pattern ) {","                ids.push( id );","            }","        }","        return ids;","    },","","    isProfileExisted: function( interfaceId ) {","        return !!this._interfaceMap[ interfaceId ];","    },","    _addProfile: function( prof ) {","        if ( !prof || !prof.id ) {","            console.error( \"Can not add interface profile without id!\" );","            return false;","        }","        if ( !/^((\\w+\\.)*\\w+)$/.test( prof.id ) ) {","            console.error( \"Invalid id: \" + prof.id );","            return false;","        }","        if ( this.isProfileExisted( prof.id ) ) {","            console.error( \"Can not repeat to add interface [\" + prof.id","                     + \"]! Please check your interface configuration file!\" );","            return false;","        }","","        prof.ruleFile = this._rulebase + '/'","                         + ( prof.ruleFile || ( prof.id + \".rule.json\" ) );","","        if ( !this._isUrlsValid( prof.urls )","                && !fs.existsSync( prof.ruleFile ) ) {","            console.error( 'Profile is deprecated:\\n', ","                prof, '\\nNo urls is configured and No ruleFile is available' );","            return false;","        }","        if (!( prof.status in prof.urls || prof.status === 'mock'","                || prof.status === 'mockerr')) {","            prof.status = this._status;","        }","","        prof.method         = { POST: 'POST', GET:'GET' }","                            [ (prof.method || 'GET').toUpperCase() ];","        prof.dataType       = { json: 'json', text: 'text', jsonp: 'jsonp' }","                            [ (prof.dataType || 'json').toLowerCase() ];","        prof.isRuleStatic   = !!prof.isRuleStatic || false;","        prof.isCookieNeeded = !!prof.isCookieNeeded || false;","        prof.signed         = !!prof.signed || false;","        prof.timeout        = prof.timeout || 10000;","","        // prof.format","        // prof.filter         = ...","        this._interfaceMap[ prof.id ] = prof;","","        this._clientInterfaces[ prof.id ] = {","            id: prof.id,","            method: prof.method,","            dataType: prof.dataType","        };","","        return true;","    },","    _isUrlsValid: function( urls ) {","        if ( !urls ) return false;","        for ( var i in urls ) {","            return true;","        }","        return false;","    }","};","","module.exports = InterfaceManager;"];
_$jscoverage_done("lib/interfacemanager.js", 9);
var fs = require("fs");

function InterfaceManager(path) {
    _$jscoverage_done("lib/interfacemanager.js", 16);
    this._path = path;
    _$jscoverage_done("lib/interfacemanager.js", 20);
    this._interfaceMap = {};
    _$jscoverage_done("lib/interfacemanager.js", 24);
    this._clientInterfaces = {};
    _$jscoverage_done("lib/interfacemanager.js", 28);
    this._rulebase = typeof path === "string" ? path.replace(/\/[^\/]*$/, "/interfaceRules") : "";
    _$jscoverage_done("lib/interfacemanager.js", 30);
    typeof path === "string" ? this._loadProfilesFromPath(path) : this._loadProfiles(path);
}

_$jscoverage_done("lib/interfacemanager.js", 36);
InterfaceManager.prototype = {
    _loadProfilesFromPath: function(path) {
        _$jscoverage_done("lib/interfacemanager.js", 40);
        console.info("Loading interface profiles.\nPath = ", path);
        _$jscoverage_done("lib/interfacemanager.js", 42);
        try {
            _$jscoverage_done("lib/interfacemanager.js", 43);
            var profiles = fs.readFileSync(path, {
                encoding: "utf8"
            });
        } catch (e) {
            _$jscoverage_done("lib/interfacemanager.js", 45);
            throw new Error("Fail to load interface profiles." + e);
        }
        _$jscoverage_done("lib/interfacemanager.js", 47);
        try {
            _$jscoverage_done("lib/interfacemanager.js", 48);
            profiles = JSON.parse(profiles);
        } catch (e) {
            _$jscoverage_done("lib/interfacemanager.js", 50);
            throw new Error("Interface profiles has syntax error:" + e);
        }
        _$jscoverage_done("lib/interfacemanager.js", 52);
        this._loadProfiles(profiles);
    },
    _loadProfiles: function(profiles) {
        _$jscoverage_done("lib/interfacemanager.js", 56);
        if (_$jscoverage_done("lib/interfacemanager.js", 56, !profiles)) {
            _$jscoverage_done("lib/interfacemanager.js", 56);
            return;
        }
        _$jscoverage_done("lib/interfacemanager.js", 57);
        console.info("Title:", profiles.title, "Version:", profiles.version);
        _$jscoverage_done("lib/interfacemanager.js", 59);
        this._rulebase = profiles.rulebase ? (profiles.rulebase || "./").replace(/\/$/, "") : this._rulebase;
        _$jscoverage_done("lib/interfacemanager.js", 64);
        this._engine = profiles.engine || "mockjs";
        _$jscoverage_done("lib/interfacemanager.js", 66);
        if (_$jscoverage_done("lib/interfacemanager.js", 66, profiles.status === undefined)) {
            _$jscoverage_done("lib/interfacemanager.js", 67);
            throw new Error("There is no status specified in interface configuration!");
        }
        _$jscoverage_done("lib/interfacemanager.js", 71);
        this._status = profiles.status;
        _$jscoverage_done("lib/interfacemanager.js", 73);
        var interfaces = profiles.interfaces || [];
        _$jscoverage_done("lib/interfacemanager.js", 74);
        for (var i = interfaces.length - 1; i >= 0; i--) {
            _$jscoverage_done("lib/interfacemanager.js", 75);
            this._addProfile(interfaces[i]) && console.info("Interface[" + interfaces[i].id + "] is loaded.");
        }
    },
    getProfile: function(interfaceId) {
        _$jscoverage_done("lib/interfacemanager.js", 80);
        return this._interfaceMap[interfaceId];
    },
    getClientInterfaces: function() {
        _$jscoverage_done("lib/interfacemanager.js", 83);
        return this._clientInterfaces;
    },
    getRule: function(interfaceId) {
        _$jscoverage_done("lib/interfacemanager.js", 87);
        if (_$jscoverage_done("lib/interfacemanager.js", 87, !interfaceId) || _$jscoverage_done("lib/interfacemanager.js", 87, !this._interfaceMap[interfaceId])) {
            _$jscoverage_done("lib/interfacemanager.js", 88);
            throw new Error("The interface profile " + interfaceId + " is not found.");
        }
        _$jscoverage_done("lib/interfacemanager.js", 90);
        path = this._interfaceMap[interfaceId].ruleFile;
        _$jscoverage_done("lib/interfacemanager.js", 91);
        if (_$jscoverage_done("lib/interfacemanager.js", 91, !fs.existsSync(path))) {
            _$jscoverage_done("lib/interfacemanager.js", 92);
            throw new Error("The rule file is not existed.\npath = " + path);
        }
        _$jscoverage_done("lib/interfacemanager.js", 94);
        try {
            _$jscoverage_done("lib/interfacemanager.js", 95);
            var rulefile = fs.readFileSync(path, {
                encoding: "utf8"
            });
        } catch (e) {
            _$jscoverage_done("lib/interfacemanager.js", 97);
            throw new Error("Fail to read rulefile of path " + path);
        }
        _$jscoverage_done("lib/interfacemanager.js", 99);
        try {
            _$jscoverage_done("lib/interfacemanager.js", 100);
            return JSON.parse(rulefile);
        } catch (e) {
            _$jscoverage_done("lib/interfacemanager.js", 102);
            throw new Error("Rule file has syntax error. " + e + "\npath=" + path);
        }
    },
    getEngine: function() {
        _$jscoverage_done("lib/interfacemanager.js", 106);
        return this._engine;
    },
    getStatus: function(name) {
        _$jscoverage_done("lib/interfacemanager.js", 109);
        return this._status;
    },
    getInterfaceIdsByPrefix: function(pattern) {
        _$jscoverage_done("lib/interfacemanager.js", 113);
        if (_$jscoverage_done("lib/interfacemanager.js", 113, !pattern)) {
            _$jscoverage_done("lib/interfacemanager.js", 113);
            return [];
        }
        _$jscoverage_done("lib/interfacemanager.js", 114);
        var ids = [], map = this._interfaceMap, len = pattern.length;
        _$jscoverage_done("lib/interfacemanager.js", 115);
        for (var id in map) {
            _$jscoverage_done("lib/interfacemanager.js", 116);
            if (_$jscoverage_done("lib/interfacemanager.js", 116, id.slice(0, len) == pattern)) {
                _$jscoverage_done("lib/interfacemanager.js", 117);
                ids.push(id);
            }
        }
        _$jscoverage_done("lib/interfacemanager.js", 120);
        return ids;
    },
    isProfileExisted: function(interfaceId) {
        _$jscoverage_done("lib/interfacemanager.js", 124);
        return !!this._interfaceMap[interfaceId];
    },
    _addProfile: function(prof) {
        _$jscoverage_done("lib/interfacemanager.js", 127);
        if (_$jscoverage_done("lib/interfacemanager.js", 127, !prof) || _$jscoverage_done("lib/interfacemanager.js", 127, !prof.id)) {
            _$jscoverage_done("lib/interfacemanager.js", 128);
            console.error("Can not add interface profile without id!");
            _$jscoverage_done("lib/interfacemanager.js", 129);
            return false;
        }
        _$jscoverage_done("lib/interfacemanager.js", 131);
        if (_$jscoverage_done("lib/interfacemanager.js", 131, !/^((\w+\.)*\w+)$/.test(prof.id))) {
            _$jscoverage_done("lib/interfacemanager.js", 132);
            console.error("Invalid id: " + prof.id);
            _$jscoverage_done("lib/interfacemanager.js", 133);
            return false;
        }
        _$jscoverage_done("lib/interfacemanager.js", 135);
        if (_$jscoverage_done("lib/interfacemanager.js", 135, this.isProfileExisted(prof.id))) {
            _$jscoverage_done("lib/interfacemanager.js", 136);
            console.error("Can not repeat to add interface [" + prof.id + "]! Please check your interface configuration file!");
            _$jscoverage_done("lib/interfacemanager.js", 138);
            return false;
        }
        _$jscoverage_done("lib/interfacemanager.js", 141);
        prof.ruleFile = this._rulebase + "/" + (prof.ruleFile || prof.id + ".rule.json");
        _$jscoverage_done("lib/interfacemanager.js", 144);
        if (_$jscoverage_done("lib/interfacemanager.js", 144, !this._isUrlsValid(prof.urls)) && _$jscoverage_done("lib/interfacemanager.js", 144, !fs.existsSync(prof.ruleFile))) {
            _$jscoverage_done("lib/interfacemanager.js", 146);
            console.error("Profile is deprecated:\n", prof, "\nNo urls is configured and No ruleFile is available");
            _$jscoverage_done("lib/interfacemanager.js", 148);
            return false;
        }
        _$jscoverage_done("lib/interfacemanager.js", 150);
        if (_$jscoverage_done("lib/interfacemanager.js", 150, !(prof.status in prof.urls || prof.status === "mock" || prof.status === "mockerr"))) {
            _$jscoverage_done("lib/interfacemanager.js", 152);
            prof.status = this._status;
        }
        _$jscoverage_done("lib/interfacemanager.js", 155);
        prof.method = {
            POST: "POST",
            GET: "GET"
        }[(prof.method || "GET").toUpperCase()];
        _$jscoverage_done("lib/interfacemanager.js", 157);
        prof.dataType = {
            json: "json",
            text: "text",
            jsonp: "jsonp"
        }[(prof.dataType || "json").toLowerCase()];
        _$jscoverage_done("lib/interfacemanager.js", 159);
        prof.isRuleStatic = !!prof.isRuleStatic || false;
        _$jscoverage_done("lib/interfacemanager.js", 160);
        prof.isCookieNeeded = !!prof.isCookieNeeded || false;
        _$jscoverage_done("lib/interfacemanager.js", 161);
        prof.signed = !!prof.signed || false;
        _$jscoverage_done("lib/interfacemanager.js", 162);
        prof.timeout = prof.timeout || 1e4;
        _$jscoverage_done("lib/interfacemanager.js", 166);
        this._interfaceMap[prof.id] = prof;
        _$jscoverage_done("lib/interfacemanager.js", 168);
        this._clientInterfaces[prof.id] = {
            id: prof.id,
            method: prof.method,
            dataType: prof.dataType
        };
        _$jscoverage_done("lib/interfacemanager.js", 174);
        return true;
    },
    _isUrlsValid: function(urls) {
        _$jscoverage_done("lib/interfacemanager.js", 177);
        if (_$jscoverage_done("lib/interfacemanager.js", 177, !urls)) {
            _$jscoverage_done("lib/interfacemanager.js", 177);
            return false;
        }
        _$jscoverage_done("lib/interfacemanager.js", 178);
        for (var i in urls) {
            _$jscoverage_done("lib/interfacemanager.js", 179);
            return true;
        }
        _$jscoverage_done("lib/interfacemanager.js", 181);
        return false;
    }
};

_$jscoverage_done("lib/interfacemanager.js", 185);
module.exports = InterfaceManager;