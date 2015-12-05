module.exports = function(filePath, cb){
  require('fs').readFile(filePath, (err, contents) => {
    if(err) {
      cb(err);
      return;
    }

    // I tried using a lexer + parser but apparantly I'm not smart enough...
    var filePaths = [];
    (contents || '')
      .split('\n')
      .forEach((thisLine) => {
        if(thisLine === '') {
          return;
        }
        if(thisLine.startsWith('//')) {
          return;
        }

        var filePathMatch = thisLine.match(/"(.*\.ck)"/);
        if(filePathMatch && filePathMatch.length > 1) {
          filePaths.push(filePathMatch[1]);
        }
      });

    cb(null, filePaths);
  });
};
