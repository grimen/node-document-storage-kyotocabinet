require('sugar')
var kyoto = require('kyoto-fork-alphashack');

module.exports = {
  get: function(db, type, id, callback) {
    var key = [type, id].join('/');
    var file = '/tmp/' + db + '.kch';

    kyoto.open(file, 'a+', function() {
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
    var file = '/tmp/' + db + '.kch';

    kyoto.open(file, 'a+', function() {
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
    var file = '/tmp/' + db + '.kch';

    kyoto.open(file, 'a+', function() {
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

    kyoto.open(file, 'a+', function() {
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
};
