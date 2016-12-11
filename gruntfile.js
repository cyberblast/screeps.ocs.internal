module.exports = function(grunt) {
    var config = require('./screeps.json')
    if(!config.branch) {
        config.branch = 'sim'
    }
    if(!config.ptr) {
        config.ptr = false
    }

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                src: ['dist/main.js']
            }
        },
        clean: ['dist/','lib/'],        
        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'lib/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize dots for folders
                        return dest + src.replace(/\//g,'.');
                    }
                }]
            },
        },
        webpack: {
            main: {
                entry: './lib/main.js',
                output: {
                    path: 'dist/',
                    filename: 'main.js',
                    libraryTarget: 'commonjs2'
                },
                module: {
                    loaders: [{
                        test: /\.js$/,
                        exclude: /(src|node_modules|ScreepsAutocomplete)/,
                        loader: 'babel-loader',
                        query: {
                            presets: [
                                require.resolve('babel-preset-es2015')
                            ]
                        }
                    }]
                }
            }
        },
        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: 'main.js',
                    dest: 'dist'
                }]
            }
        }
    });
    grunt.registerTask('switch-to-lib-deploy', function () {
        grunt.config.set('screeps.dist.src', ['lib/*.js']);
    });
    grunt.registerTask('default', ['clean', 'copy', 'webpack', 'uglify']);
    grunt.registerTask('deploy', ['clean', 'copy', 'switch-to-lib-deploy', 'screeps']);
    grunt.registerTask('compress-deploy', ['clean', 'copy', 'webpack', 'uglify', 'screeps']);
};