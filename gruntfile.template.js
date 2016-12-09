module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        screeps: {
            options: {
                email: 'YOUR_EMAIL',
                password: 'YOUR_PASSWORD',
                branch: 'ScreepsOCS',
                ptr: false
            },
            dist: {
                src: ['dist/main.js']
            }
        },
        clean: ['dist/'],
        webpack: {
            main: {
                entry: './src/main.js',
                output: {
                    path: 'dist/',
                    filename: 'main.js',
                    libraryTarget: 'commonjs2'
                },
                module: {
                    loaders: [{
                        test: /\.js$/,
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

    grunt.registerTask('default', ['clean', 'webpack', 'uglify']);
    grunt.registerTask('deploy', ['clean', 'webpack', 'uglify', 'screeps']);
};