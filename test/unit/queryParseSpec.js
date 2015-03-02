'use strict';

describe('queryParse', function() {
  var queryParse;

  beforeEach(module('queryMaster'));

  beforeEach(inject(function($injector) {
    queryParse = $injector.get('queryParse');
  }));


  it('a=1&b=2', function() {
    var query  = 'a=1&b=2'
    var parsed = {a:'1', b:'2'}

    expect(queryParse(query)).toEqual(parsed);
  });

  it('a[]=1&a[]=2', function() {
    var query  = 'a[]=1&a[]=2'
    var parsed = {a: ['1', '2']}

    expect(queryParse(query)).toEqual(parsed);
  });

  it('foo[bar][baz]=foobarbaz', function() {
    var query  = 'foo[bar][baz]=foobarbaz'
    var parsed = {foo: {bar: {baz: 'foobarbaz'}}}

    expect(queryParse(query)).toEqual(parsed);
  });

  it('users[0][id]=1&users[0][name]=Joe&users[1][id]=2&users[1][name]=Kevin', function() {
    var query  = 'users[0][id]=1&users[0][name]=Joe&users[1][id]=2&users[1][name]=Kevin'
    var parsed = {
      users: [
        {id: '1', name: 'Joe'},
        {id: '2', name: 'Kevin'}
      ]
    }

    expect(queryParse(query)).toEqual(parsed);
  });
});
