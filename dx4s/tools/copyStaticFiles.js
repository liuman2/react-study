const ncp = require('ncp').ncp;

function copyStaticFiles(userOptions) {
  this.options = userOptions;
}
copyStaticFiles.prototype.apply = function(compiler) {
  const options = this.options;
  compiler.plugin('done', function() {
    ncp(options.from, options.to, function (err) {
     if (err) {
       return console.error(err);
     }
    });
  });
};

module.exports = exports = copyStaticFiles;
