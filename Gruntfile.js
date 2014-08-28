// Обязательная обёртка
module.exports = function(grunt) {



  // Задачи
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),



    concat: {
      dist: {
        src: '<%= pkg.files.client.js.files %>',
        dest: '<%= pkg.files.client.js.dest %>',
      },
    },



    uglify: {
      js: {
        options: {
          banner: '/**\n' +
                  ' * <%= pkg.name %> - Version <%= pkg.version %>\n' +
                  ' * <%= pkg.description %>\n' +
                  ' * Author: <%= pkg.author.name %> - <%= pkg.author.email %>\n' +
                  ' * Build date: <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
                  ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.company %>\n' +
                  ' * Released under the <%= pkg.license %> license\n' +
                  ' */\n',
          // footer: '',
          sourceMapName: '<%= pkg.files.client.js.dest %>'+'.map',
          compress: {
            // drop_console: true
          }
        },
        files: {
          '<%= pkg.files.client.js.dest %>': '<%= pkg.files.client.js.dest %>'
        }
      }
    },



    // Объединяем css
    cssmin: {
      css: {
        options: {
          banner: '/**\n' +
                  ' * <%= pkg.name %> - Version <%= pkg.version %>\n' +
                  ' * <%= pkg.description %>\n' +
                  ' * Author: <%= pkg.author.name %> - <%= pkg.author.email %>\n' +
                  ' * Build date: <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
                  ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.company %>\n' +
                  ' * Released under the <%= pkg.license %> license\n' +
                  ' */\n',
          keepSpecialComments: 0 // remove special comments
        },

        files: {
          '<%= pkg.files.client.css.dest %>': '<%= pkg.files.client.css.files %>'
        }
      }
    },



    csso: {
      client: {
        options: {
          restructure: true,
          report: 'gzip'
        },
        files: { // 'output.css': ['input.css']
          '<%= pkg.files.client.css.dest %>': ['<%= pkg.files.client.css.dest %>']
        }
      }
    },



    autoprefixer: {
      options: {
        browsers: [
          'last 2 version',
          'ie 9',
          'Firefox ESR',
        ]
      },

      client: {
        files: { // 'input.css': 'output.css'
          '<%= pkg.files.client.css.dest %>': '<%= pkg.files.client.css.dest %>'
        }
      }
    },



    watch: {
      js: {
        files: '<%= pkg.files.client.js.files %>',
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false,
        },
      },

      css: {
        files: '<%= pkg.files.client.css.files %>',
        tasks: ['cssmin', 'csso', 'autoprefixer'],
        options: {
          spawn: false,
        },
      }
    },
  });



  // Загрузка плагинов, установленных с помощью npm install
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-csso');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');



  // Задача по умолчанию
  grunt.registerTask('default', [
    'concat',
    'uglify',
    'cssmin',
    'csso',
    'autoprefixer',
  ]);
};