var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify');

var src = [
  './src/app.js',
  'src/utils.js',
  'src/*.js'
];

gulp.task('default', function() {
  gulp.src(['./src/app.js', 'src/utils.js', 'src/*.js'])
    .pipe(concat('angular-query-master.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(rename('angular-query-master.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
});
