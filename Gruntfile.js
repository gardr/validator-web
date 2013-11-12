module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-subgrunt');

    grunt.initConfig({
        subgrunt: {
            'grunt BUILD node_modules/pasties-js': {
                'node_modules/pasties-js':'build'
            }
        }
    });

    grunt.registerTask('default', ['subgrunt']);
};
