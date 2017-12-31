var gulp = require('gulp');
var del = require('del');
var mocha = require('gulp-mocha');
var tsb = require('gulp-tsb');
var chalk = require('chalk');
var run = require('gulp-run');
var bump = require('gulp-bump');
var sequence = require('run-sequence');

var buildDone = false;

var paths = {
    src: ['src/**', 'test/**', './*.ts', 'typings/*.d.ts'],
    out: './dist',
    test: './dist/test/**/*.js',
    publish: './publish'
};

function handleBuildError (error) {
    console.log(chalk.red(error.toString()));
    buildDone = false;
}

function createCompilation(){
    return tsb.create('tsconfig.json', false, null, function(error){handleBuildError(error)});
}

function logBuildResult(){
    console.log(buildDone ? chalk.green('Build succeeded.') : chalk.red('Build failed.'));
}

gulp.task('build', function() {
    console.log(chalk.blue('Typescript compile.'));
    buildDone = true;
    return gulp.src(paths.src, {base: '.'})
        .pipe(createCompilation()())
        // .pipe(compilation())
        .pipe(gulp.dest(paths.out));
});

gulp.task('test', ['build'], function() {
    logBuildResult();
    if(buildDone){
        console.log(chalk.blue('Running tests in', paths.test));
        return gulp.src(paths.test, {read: false})
            .pipe(mocha({
                reporter: 'spec'
            }));
    }
});

gulp.task('build_clean', function() {
    var clean = [paths.out + '/**/*'];
    console.log(chalk.blue('Cleaning build path' + clean));
    return del(clean);
});

gulp.task('cb', ['build'], function() {
    return gulp.watch(paths.src, ['build']);
});

gulp.task('ci', ['test'], function() {
    return gulp.watch(paths.src, ['test']);
});

gulp.task('package_copy', function() {
    return gulp.src([paths.out + '/lib/**/*.js', './README.md', './ts-flux-utils.d.ts']).pipe(gulp.dest(paths.publish));
});

gulp.task('package_npm', function() {
    run('npm publish').exec();
});

gulp.task('package_bump', function() {
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('package_pack', function() {
    run('npm pack').exec();
});

gulp.task('pack', function() {
    sequence('build_clean','build', 'package_pack');
});

gulp.task('publish', function() {
    sequence('build_clean','build', 'package_npm', 'package_bump');
});

