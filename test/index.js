var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;
var expect = require('chai').use(require('sinon-chai')).expect;

var proxyquireStubs = { };

var _ = '';

describe('For the Steve Initialize File', function() {
  beforeEach('Setup Spies', function() {
    this.callbackSpy = spy();
    this.readFileStub = stub();
    proxyquireStubs['fs'] = { readFile: this.readFileStub };
  });
  beforeEach('Setup File', function() {
    this.file = proxyquire('./../index.js', proxyquireStubs);
  });
  describe('when loading the file', function() {
    it('expect the file name to be passed', function() {
      var filePath = 'THE BEST FILE EVER! PROBABLY ABOUT BANANA PANCAKES!!!';
      this.file(filePath, this.callbackSpy);
      expect(this.readFileStub).to.have.been.calledOnce;
      expect(this.readFileStub).to.have.been.calledWith(filePath);
    });
    it('and it fails expect an error', function() {
      var error = new Error();
      this.readFileStub.callsArgWith(1, error);

      this.file(_, this.callbackSpy);
      expect(this.callbackSpy).to.have.been.calledOnce;
      expect(this.callbackSpy).to.have.been.calledWith(error);
    });
    describe('and it suceeds', function() {
      beforeEach('Setup Assertion', function() {
        var callbackSpy = this.callbackSpy;
        this.results = function() {
          return callbackSpy.getCall(0).args[1];
        };
      });
      beforeEach('Setup Spies', function() {
        var readFileStub = this.readFileStub;
        this.setFileContents = function(contents) {
          readFileStub.callsArgWith(1, null, contents);
        };
      });
      it('expect there to be no error assuming the file isn\'t terrible', function() {
        this.readFileStub.callsArgWith(1, null, '');
        this.file(_, this.callbackSpy);
        expect(this.callbackSpy).to.have.been.calledWith(null);
      });
      describe('expect it to return the correct values for', function() {
        it('a null file', function() {
          this.setFileContents(null);
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql([]);
        });
        it('an empty file', function() {
          this.setFileContents('');
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql([]);
        });
        it('an file with only whitespace', function() {
          this.setFileContents('  \n\n  ');
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql([]);
        });
        it('a file with one entry', function() {
          var chuckFilePath = 'aSuperCoolChucKFile.ck';
          this.setFileContents('Machine.add(me.dir()+"' + chuckFilePath + '");');
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql([chuckFilePath]);
        });
        it('a file with various formats', function() {
          var chuckFilePaths = [
            '0aSuperCoolChucKFile.ck',
            '1aSuperCoolChucKFile.ck',
            '2aSuperCoolChucKFile.ck',
            '3aSuperCoolChucKFile.ck',
            '4aSuperCoolChucKFile.ck',
            '5aSuperCoolChucKFile.ck',
            '6aSuperCoolChucKFile.ck',
            '7aSuperCoolChucKFile.ck',
            '8aSuperCoolChucKFile.ck',
            '9aSuperCoolChucKFile.ck'
          ];
          this.setFileContents([
            'Machine.add(me.dir()+"' + chuckFilePaths[0] + '");',
            'Machine.add(me.dir() + "' + chuckFilePaths[1] + '");',
            'Machine.add(me.dir()+ "' + chuckFilePaths[2] + '");',
            'Machine.add(me.dir() +"' + chuckFilePaths[3] + '");',
            'Machine.add("' + chuckFilePaths[4] + '");',
            'Machine.add(me.dir()+"' + chuckFilePaths[5] + '" );',
            'Machine.add(me.dir()   +   "' + chuckFilePaths[6] + '" );',
            'Machine.add(me.dir()+   "' + chuckFilePaths[7] + '" );',
            'Machine.add(me.dir()   +"' + chuckFilePaths[8] + '" );',
            'Machine.add("' + chuckFilePaths[9] + '" );'
          ].join('\n'));
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql(chuckFilePaths);
        });
        it('a file with single line comments and whitespace', function() {
          var chuckFilePaths = [
            'aCoolFile.ck',
            'anotherCoolFile.ck',
            'theLastCoolFile.ck'
          ];
          this.setFileContents([
            '// I\'m irrelevent!',
            'Machine.add(me.dir()+"' + chuckFilePaths[0] + '");',
            '// Machine.add(me.dir() + "' + chuckFilePaths[0] + '");',
            'Machine.add(me.dir() + "' + chuckFilePaths[1] + '");',
            '',
            '// Machine.add(me.dir() + "' + chuckFilePaths[1] + '");',
            '//Machine.add(me.dir() + "' + chuckFilePaths[2] + '");',
            '',
            '// I\'m probably lying!',
            '//Machine.add(me.dir() + "' + chuckFilePaths[2] + '");',
            '// I\'m definitely lying!!!',
            'Machine.add(me.dir()+ "' + chuckFilePaths[2] + '");',
            '//Why would you comment the last line in a file?'
          ].join('\n'));
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql(chuckFilePaths);
        });
        it('a file with multi-line comments and whitespace', function() {
          var chuckFilePaths = [
            'aCoolFile.ck',
            'anotherCoolFile.ck',
            'theLastCoolFile.ck'
          ];
          this.setFileContents([
            '/* I\'m irrelevent!',
            ' *',
            ' * I\'m also irrelevent!*/',
            'Machine.add(me.dir()+"' + chuckFilePaths[0] + '");',
            'Machine.add(me.dir() + "' + chuckFilePaths[1] + '");',
            '',
            '',
            '/*',
            'I\'m probably lying!',
            'I\'m definitely lying!!!',
            '*/',
            'Machine.add(me.dir()+ "' + chuckFilePaths[2] + '");',
            '/*Why am I not a single line comment */'
          ].join('\n'));
          this.file(_, this.callbackSpy);
          expect(this.results()).to.eql(chuckFilePaths);
        });
      });
    });
  });
});
