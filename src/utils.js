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
