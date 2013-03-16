
// -----------------------
//  Test
// --------------------

var Storage = require('node-document-storage');

module.exports = Storage.Spec('KyototCabinet', {
  module: require('..'),
  engine: require('kyoto-fork-alphashack'),
  id: 'kyotocabinet',
  protocol: 'file',
  db: '/tmp/default-test',
  default_url: 'file:///tmp/default-test',
  authorized_url: undefined,
  unauthorized_url: undefined,
  client: {
    get: function(db, type, id, callback) {
      var key = [type, id].join('/');
      var file = db + '.kch';

      require('kyoto-fork-alphashack').open(file, 'a+', function() {
        var client = this;

        client.get(key, function(err, res) {
          client.close(function() {
            if (typeof res === 'undefined') {
              res = null;
            }
            callback(err, res);
          });
        });
      });
    },

    set: function(db, type, id, data, callback) {
      var key = [type, id].join('/');
      var file = db + '.kch';

      require('kyoto-fork-alphashack').open(file, 'a+', function() {
        var client = this;

        client.set(key, data, function(err, res) {
          client.close(function() {
            if (typeof res === 'undefined') {
              res = null;
            }
            callback(err, res);
          });
        });
      });
    },

    del: function(db, type, id, callback) {
      var key = [type, id].join('/');
      var file = db + '.kch';

      require('kyoto-fork-alphashack').open(file, 'a+', function() {
        var client = this;

        client.remove(key, function(err, res) {
          client.close(function() {
            if (typeof res === 'undefined') {
              res = null;
            }
            callback(err, res);
          });
        });
      });
    },

    exists: function(db, type, id, callback) {
      var key = [type, id].join('/');

      require('kyoto-fork-alphashack').open(file, 'a+', function() {
        var client = this;

        client.get(key, data, function(err, res) {
          client.close(function() {
            if (typeof res === 'undefined') {
              res = null;
            }
            callback(err, !!res);
          });
        });
      });
    }
  }
});
