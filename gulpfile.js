// Defining base pathes
var basePaths = {
    bower: './bower_components/',
    node: './node_modules/',
    dev: './src/'
};

/** FTP Configuration **/
var user = '';  
var password = '';  
var host = '';  
var port = 21;  
var localFilesGlob = ['./**/*','!node_modules','!node_modules/**','!package.json','!sftp-config.json','!gulpfile.js']; //! meaning exclude 
var remoteFolder = '/'

// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var del = require('del');
var gutil = require( 'gulp-util' );
var ftp = require( 'vinyl-ftp' );

function swallowError(self, error) {
    console.log(error.toString())

    self.emit('end')
}

// Run:
// gulp vinyl-ftp
// send ftp
// helper function to build an FTP connection based on our configuration
function getFtpConnection() {  
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}

/**
 * Deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */
gulp.task('deploy', function() {
    var conn = getFtpConnection();

    return gulp.src(localFilesGlob, { base: '.', buffer: false })
        .pipe(plumber({ errorHandler: function (error) { swallowError(this, error); } }))
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files 
        .pipe( conn.dest( remoteFolder ) );
});


// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function () {
    var stream = gulp.src('./sass/*.scss')
        .pipe(plumber({ errorHandler: function (error) { swallowError(this, error); } }))
        .pipe(sass())
        .pipe(gulp.dest('./css'));
    return stream;
});

// Run: 
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', ['deploy'], function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./css/style.css', ['cssnano']);

    var conn = getFtpConnection();
    gulp.watch(['./**/*.{php,css}'])
    .on('change', function(event) {
      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe(plumber({ errorHandler: function (error) { swallowError(this, error); } }))
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files 
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});


// Run: 
// gulp nanocss
// Minifies CSS files
gulp.task('cssnano', function(){
  return gulp.src('./css/style.css')
    .pipe(plumber())
    .pipe(cssnano({discardComments: {removeAll: true}}))

    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./css/'));
}); 

