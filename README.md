# angular-query-master
Stringify and parse search query strings with nested params. Based on https://github.com/hapijs/qs nodejs package.

## Motivation
$location and $routeParams not enought for deep parse query arguments:

```javascript
// url: /page?users[0][id]=1&users[0][name]=Joe&users[1][id]=2&users[1][name]=Kevin

$location.search()

{
  "users[0][id]": "1",
  "users[0][name]": "Joe",
  "users[1][id]": "2",
  "users[1][name]": "Kevin"
}
```

## Solution
```javascript
searchParse('users[0][id]=1&users[0][name]=Joe&users[1][id]=2&users[1][name]=Kevin')

{
  users: [
    {id: '1', name: 'Joe'},
    {id: '2', name: 'Kevin'}
  ]
}
```

## Getting started:
### Get the code:
Install via **[Bower](http://bower.io/)** `$ bower install --save angular-query-master`.

Or [download the release](http://rawgit.com/kroid/angular-query-master/master/dist/angular-query-master.js) ([minified](http://rawgit.com/kroid/angular-query-master/master/dist/angular-query-master.min.js))

### Add module to your application.
#### index.html:
```html
<html ng-app="app">
  <head></head>
  <body ng-controller="AppController">
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.13/angular.min.js"></script>
    <script src="angular-query-master.min.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```
#### app.js
```javascript
(function() {
  angular
    .module('app', ['queryMaster'])
    .controller('AppController', controller);

  controller.$inject = ['searchParse']

  function controller(searchParse) {
    var parsed = searchParse(location.search.slice(1));
    console.log(parsed);
  }
})();
```

## Documentation
coming soon
