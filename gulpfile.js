const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const htmlmin = require('gulp-htmlmin');
const csso = require("postcss-csso");
const sass = require('gulp-sass')(require('sass'));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const del = require("del");
const rename = require("gulp-rename");
const replace = require('gulp-replace');

// Clean

const clean = () => del("build");

// Copy

const copy = () => {
  return gulp.src([
    "src/fonts/*.{woff2,woff}",
    "src/img/**/*.{jpg,png,svg}",
  ], {
    base: "src"
  })
  .pipe(gulp.dest("build"))
};

exports.copy = copy;

// HTML

const htmlminify = () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(replace('css/style.css', 'css/style.min.css'))
    .pipe(gulp.dest('build'));
}

exports.htmlminify = htmlminify;

// Styles

const styles = () => {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("src/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const buildStyles = () => {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso(),
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
    // .pipe(sync.stream());
}

exports.buildStyles = buildStyles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'src'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("src/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("src/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  clean,
  copy,
  gulp.series(
    styles,
    server,
    watcher,
  ),
);

// Build

const build = gulp.series(
  clean,
  copy,
  gulp.parallel(
    buildStyles,
    htmlminify,
  )
)

exports.build = build;
