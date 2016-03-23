module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', '**/*.js', '**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    copy: {
      main: {
        files: [
          {flatten: true, expand: true, src: ['node_modules/semantic-ui-css/semantic.min.css', 'node_modules/semantic-ui-css/semantic.css'], dest: 'public/vendor/semantic-ui'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy', 'jshint']);
  grunt.registerTask('build', ['copy']);

};
