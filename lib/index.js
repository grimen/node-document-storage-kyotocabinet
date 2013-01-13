require('sugar')
var fun = require('funargs'),
    fs = require('node-fs'),
    path = require('path'),
    util = require('util');

// HACK: ...until Node.js `require` supports `instanceof` on modules loaded more than once. (bug in Node.js)
var Storage = global.NodeDocumentStorage || (global.NodeDocumentStorage = require('node-document-storage'));

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/alphashack/node-kyoto

// -----------------------
//  TODO
// --------------------
//  - [FEATURE]: Use the bulk API.
//      - https://github.com/alphashack/node-kyoto/blob/master/tests/kyoto.js

// -----------------------
//  Constructor
// --------------------

// new KyotoCabinet ();
// new KyotoCabinet (options);
// new KyotoCabinet (url);
// new KyotoCabinet (url, options);
function KyotoCabinet () {
  var self = this;

  self.klass = KyotoCabinet;
  self.klass.super_.apply(self, arguments);
}

util.inherits(KyotoCabinet, Storage);

// -----------------------
//  Class
// --------------------

KyotoCabinet.defaults = {
  url: process.env.KYOTOCABINET_URL || 'file:///tmp/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    server: {
      extension: '.kch' // REVIEW: Move into connection URL?
    },
    client: {
      mode: 'a+'
    }
  }
};

KyotoCabinet.url = KyotoCabinet.defaults.url;
KyotoCabinet.options = KyotoCabinet.defaults.options;

KyotoCabinet.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
KyotoCabinet.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var kyoto = require('kyoto-fork-alphashack');

    self.client = kyoto;

    fs.mkdir(path.dirname(self.resource().db), self.options.mode, true, function(err) {
      if (err) {
        self.emit('error', err);
      }
      self.emit('ready');
    });
  });
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
KyotoCabinet.prototype.set = function() {
  var self = this;

  // NOTE: Relatively verbose imlementation because of the one-connection-at-time-limitation of Kyoto Cabinet.

  self._set(arguments, function(key_values, options, done, next) {
    var store = self.resource().db + self.resource().ext;

    self.client.open(store, self.options.client.mode, function(_err) {
      var store = this;
      var res = Object.extended({});
      var keys = Object.keys(key_values);

      self.client.stores = self.client.stores || [];
      self.client.stores.add(store);

      key_values.each(function(key, value) {
        store.set(key, value, function(error, response, k) {
          res[k] = {
            error: error,
            result: !error,
            response: response
          };

          if (Object.keys(res).length === keys.length) {
            store.close(function() {
              self.client.stores.remove(store);
              keys.each(function(k) {
                next(k, res[k].error, res[k].result, res[k].response)
              });
            });
          }
        });
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
KyotoCabinet.prototype.get = function() {
  var self = this;

  // NOTE: Relatively verbose imlementation because of the one-connection-at-time-limitation of Kyoto Cabinet.

  self._get(arguments, function(keys, options, done, next) {
    var store = self.resource().db + self.resource().ext;

    self.client.open(store, self.options.client.mode, function(_err) {
      var store = this;
      var res = Object.extended({});

      self.client.stores = self.client.stores || [];
      self.client.stores.add(store);

      keys.each(function(key) {
        store.get(key, function(error, response, k) {
          res[k] = {
            error: error,
            result: response,
            response: response
          };

          // NOTE: Get data in correct order, and ensure to close connection.

          if (Object.keys(res).length === keys.length) {
            store.close(function() {
              self.client.stores.remove(store);
              keys.each(function(k) {
                next(k, res[k].error, res[k].result, res[k].response)
              });
            });
          }
        });
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
KyotoCabinet.prototype.del = function() {
  var self = this;

  // NOTE: Relatively verbose imlementation because of the one-connection-at-time-limitation of Kyoto Cabinet.

  self._del(arguments, function(keys, options, done, next) {
    var store = self.resource().db + self.resource().ext;

    self.client.open(store, self.options.client.mode, function() {
      var store = this;
      var res = Object.extended({});

      self.client.stores = self.client.stores || [];
      self.client.stores.add(store);

      keys.each(function(key) {
        store.remove(key, function(error, response) {
          res[key] = {
            error: error,
            result: !error,
            response: response
          };

          // NOTE: Get data in correct order, and ensure to close connection.

          if (Object.keys(res).length === keys.length) {
            self.client.stores.remove(store);
            store.close(function() {
              keys.each(function(k) {
                next(k, res[k].error, res[k].result, res[k].response)
              });
            });
          }
        });
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
KyotoCabinet.prototype.exists = function() {
  var self = this;

  // NOTE: Relatively verbose imlementation because of the one-connection-at-time-limitation of Kyoto Cabinet.

  self._exists(arguments, function(keys, options, done, next) {
    var store = self.resource().db + self.resource().ext;

    self.client.open(store, self.options.client.mode, function(_err) {
      var store = this;
      var res = Object.extended({});

      self.client.stores = self.client.stores || [];
      self.client.stores.add(store);

      keys.each(function(key) {
        store.get(key, function(error, response, k) {
          res[k] = {
            error: error,
            result: !!response,
            response: response
          };

          // NOTE: Get data in correct order, and ensure to close connection.

          if (Object.keys(res).length === keys.length) {
            self.client.stores.remove(store);
            store.close(function() {
              keys.each(function(k) {
                next(k, res[k].error, res[k].result, res[k].response)
              });
            });
          }
        });
      });
    });
  });
};

// #end ()
KyotoCabinet.prototype.end = function() {
  var self = this;

  if (self.client) {
    (self.client.stores || []).each(function(store) {
      store && store.closeSync();
    });
  }
};

// #pack (object)
KyotoCabinet.prototype.pack = JSON.stringify;

// #unpack (json)
KyotoCabinet.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = KyotoCabinet;
