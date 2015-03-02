(function() {
  'use strict';

  angular.module('queryMaster', []);
})();

(function() {
  'use strict';

  angular.module('queryMaster').service('utils', service);

  function service() {
    this.arrayToObject = arrayToObject;
    this.merge = merge;
    this.decode = decode;
    this.compact = compact;
    this.isRegExp = isRegExp;
    this.isBuffer = isBuffer;


    function arrayToObject(source) {
      var obj = {};
      for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

          obj[i] = source[i];
        }
      }

      return obj;
    }


    function merge(target, source) {
      if (!source) {
        return target;
      }

      if (typeof source !== 'object') {
        if (Array.isArray(target)) {
          target.push(source);
        }
        else {
          target[source] = true;
        }

        return target;
      }

      if (typeof target !== 'object') {
        target = [target].concat(source);
        return target;
      }

      if (Array.isArray(target) &&
          !Array.isArray(source)) {

        target = arrayToObject(target);
      }

      var keys = Object.keys(source);
      for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (!target[key]) {
          target[key] = value;
        }
        else {
          target[key] = merge(target[key], value);
        }
      }

      return target;
    }


    function decode(str) {
      try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
      } catch (e) {
        return str;
      }
    }


    function compact(obj, refs) {
      if (typeof obj !== 'object' ||
          obj === null) {

        return obj;
      }

      refs = refs || [];
      var lookup = refs.indexOf(obj);
      if (lookup !== -1) {
        return refs[lookup];
      }

      refs.push(obj);

      if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, il = obj.length; i < il; ++i) {
          if (typeof obj[i] !== 'undefined') {
            compacted.push(obj[i]);
          }
        }

        return compacted;
      }

      var keys = Object.keys(obj);
      for (i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = compact(obj[key], refs);
      }

      return obj;
    }


    function isRegExp(obj) {
      return Object.prototype.toString.call(obj) === '[object RegExp]';
    }


    function isBuffer(obj) {
      if (obj === null ||
          typeof obj === 'undefined') {

        return false;
      }

      return !!(obj.constructor &&
                obj.constructor.isBuffer &&
                obj.constructor.isBuffer(obj));
    }
  }
})();

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
