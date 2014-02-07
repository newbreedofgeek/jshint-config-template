JSHint Config Template
========================

* For all the HTML5 frameworks I build, I use JSHint to ensure industry standards are being followed for JavaScript code

* JSHint is an open source project with good documentation, [read more here](http://jshint.com/)

* I usually enforce JSHint as part of a Grunt workflow using a JSHint plugin (grunt-contrib-jshint) and a global config file (.jshintrc) to list the standards so it can be shared by all developers of my projects

* This global config file is baked into my projects, but it lives and grows here so I can keep it updated based on my learnings

    * pure-config -> .jshintrc

    This file is the pure file with no markup. You have to use this version with grunt-contrib-jshint

    * marked-up-config -> .jshintrc

    This is the same as the pure file but has some mark up to help you understand what is what. You can cross reference this with the JSHint website to learn more.


### Some Tips:

* If you have some code in your project that is throwing errors via JSHint which is not an error but just something the parser thinks is as error, you can ask JSHint to ignore this by putting you code block in some meta like so:

        - /* jshint ignore:start */
        - Your code here
        - ...
        - /* jshint ignore:end */


### Release History
1.0.0 - (4/2/2014) Initial release. As used by [HTML5 Thor] (https://github.com/newbreedofgeek/html5-thor) version 2.X