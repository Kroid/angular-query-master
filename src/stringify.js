(function() {
  'use strict';

  angular.module('queryMaster').service('queryStringify', service);

  service.$inject = ['utils'];

  function service(utils) {
    var internals = {
      delimiter: '&',
      arrayPrefixGenerators: {
        brackets: function (prefix, key) {
          return prefix + '[]';
        },
        indices: function (prefix, key) {
          return prefix + '[' + key + ']';
        },
        repeat: function (prefix, key) {
          return prefix;
        }
      }
    }


    function stringify(obj, prefix, generateArrayPrefix) {
      if (utils.isBuffer(obj)) {
        obj = obj.toString();
      }
      else if (obj instanceof Date) {
        obj = obj.toISOString();
      }
      else if (obj === null) {
        obj = '';
      }

      if (typeof obj === 'string' ||
          typeof obj === 'number' ||
          typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
      }

      var values = [];

      if (typeof obj === 'undefined') {
        return values;
      }

      var objKeys = Object.keys(obj);
      for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        if (Array.isArray(obj)) {
          values = values.concat(stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
        }
        else {
          values = values.concat(stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
        }
      }

      return values;
    }


    return function (obj, options) {
      options = options || {};
      var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

      var keys = [];

      if (typeof obj !== 'object' ||
          obj === null) {

        return '';
      }

      var arrayFormat;
      if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
      }
      else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
      }
      else {
        arrayFormat = 'indices';
      }

      var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

      var objKeys = Object.keys(obj);
      for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        keys = keys.concat(stringify(obj[key], key, generateArrayPrefix));
      }

      return keys.join(delimiter);
    };
  }
})();
