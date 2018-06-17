var _gulp = require("gulp");
var _sourcemaps = require("gulp-sourcemaps");
var _typescript = require("gulp-typescript");
var _minify = require("gulp-minify");
var _del = require("del");

_gulp.task("clean",
    function(done) {
        return _del(["./dist"], done);
    });

_gulp.task("compile",
    () => {
        var typescriptProject = _typescript.createProject("tsconfig.json");
        return _gulp.src(["./src/**/*.ts"])
            .pipe(_sourcemaps.init())
            .pipe(typescriptProject())
            .pipe(_sourcemaps.write())
            .pipe(_minify({
                ext: {
                    src: ".js",
                    min: ".min.js"
                }
            }))
            .pipe(_gulp.dest("."));
    });

_gulp.task("build",
    [
        "clean"
    ],
    () => {
        _gulp.start(
            [
                "compile"
            ],
            (done) => {
                done();
            }
        );
    });