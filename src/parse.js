(function() {
  'use strict';

  angular.module('queryMaster').service('queryParse', service);

  service.$inject = ['utils'];

  function service(utils) {
    function parseValues(str, options) {
      var obj = {};
      var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

      for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
          obj[utils.decode(part)] = '';
        }
        else {
          var key = utils.decode(part.slice(0, pos));
          var val = utils.decode(part.slice(pos + 1));

          if (!obj.hasOwnProperty(key)) {
            obj[key] = val;
          }
          else {
            obj[key] = [].concat(obj[key]).concat(val);
          }
        }
      }

      return obj;
    }


    function parseObject(chain, val, options) {
      if (!chain.length) {
        return val;
      }

      var root = chain.shift();

      var obj = {};
      if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
      }
      else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        var indexString = '' + index;
        if (!isNaN(index) &&
            root !== cleanRoot &&
            indexString === cleanRoot &&
            index >= 0 &&
            index <= options.arrayLimit) {

          obj = [];
          obj[index] = parseObject(chain, val, options);
        }
        else {
          obj[cleanRoot] = parseObject(chain, val, options);
        }
      }

      return obj;
    };


    function parseKeys(key, val, options) {
      if (!key) {
        return;
      }

      // The regex chunks

      var parent = /^([^\[\]]*)/;
      var child = /(\[[^\[\]]*\])/g;

      // Get the parent

      var segment = parent.exec(key);

      // Don't allow them to overwrite object prototype properties

      if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
      }

      // Stash the parent if it exists

      var keys = [];
      if (segment[1]) {
        keys.push(segment[1]);
      }

      // Loop through children appending to the array until we hit depth

      var i = 0;
      while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
          keys.push(segment[1]);
        }
      }

      // If there's a remainder, just add whatever is left

      if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
      }

      return parseObject(keys, val, options);
    }


    return function (str, options) {
      var internals = {
        delimiter: '&',
        depth: 5,
        arrayLimit: 20,
        parameterLimit: 1000
      };

      if (str === '' ||
          str === null ||
          typeof str === 'undefined') {

        return {};
      }

      options = options || {};
      options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
      options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
      options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
      options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

      var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
      var obj = {};

      // Iterate over the keys and setup the new object

      var keys = Object.keys(tempObj);
      for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj);
      }

      return utils.compact(obj);
    };
  }
})();
