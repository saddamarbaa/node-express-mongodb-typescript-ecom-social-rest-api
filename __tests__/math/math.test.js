const chai = require('chai');
const expect = chai.expect; // Using Expect style

const math = require('./math');

const result = math.sum(2, 2);

// Testing with conditions
if (result === 4) {
  console.log('testing with conditions pass');
} else {
  console.log('testing with conditions fail');
}

// automation  Test with mocha
describe('math', function() {
  // Happy path
  describe('sum', function() {
    it('should return the sum of two provided numbers ', function(done) {
      const result = math.sum(2, 2);

      expect(result).to.be.eq(4);
      expect(result).to.be.a('number');
      done();
    });

    // Unhappy path
    // it('should fail to return the sum of two provided numbers', function(done) {
    //   const result = math.sum('2', 8);

    //   expect(result).to.not.be.eq(4);
    //   expect(result).to.be.a('number');
    //   done();
    // });
  });
});
