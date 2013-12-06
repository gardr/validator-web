module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-subgrunt');

    grunt.initConfig({
        subgrunt: {
            'grunt BUILD node_modules/gardr': {
                'node_modules/gardr':'build'
            }
        }
    });

    grunt.registerTask('default', ['subgrunt']);
};
