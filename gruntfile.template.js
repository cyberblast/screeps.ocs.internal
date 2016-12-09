module.exports = function(grunt) { // NOSONAR
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        clean: ['dist/'],
        copy: {
            main: {
                expand: true,
                cwd: 'node_modules/screeps-perf/',
                src: '*.js',
                dest: 'src/',
                flatten: true,
                filter: 'isFile'
            }
        },
        webpack: {
            main: {
                entry: './src/main.js',
                output: {
                    path: 'dist/',
                    filename: 'main.js',
                    libraryTarget: 'commonjs2'
                }
            }
        },
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
        }
    });

    grunt.registerTask('default', ['clean', 'copy', 'webpack']);
    grunt.registerTask('deploy', ['clean', 'copy', 'webpack', 'screeps']);
};