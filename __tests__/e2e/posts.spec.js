const axios = require('axios');
const expect = require('chai').expect;

describe('POSTS', () => {
  describe('GET/ POSTS', () => {
    before(() => {
      // con to db
      // empty old data
      // seed db

      console.log('before get request');
    });

    after(() => {
      // disconnect from the db
    });

    // happy path
    it('should get all posts', async () => {
      // Make a request for a user with a given ID
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts');

      const { data } = response;

      expect(data).to.be.an('array');

      const post = data[0];

      // check prop
      expect(post).have.property('userId');
      expect(post).have.property('id');
      expect(post).have.property('title');
      expect(post).have.property('body');

      // check prop datatype
      expect(post.userId).to.be.a('number');
      expect(post.id).to.be.a('number');
      expect(post.title).to.be.a('string');
      expect(post.body).to.be.a('string');
    });

    it('should get not more that 100 posts', async () => {
      // Make a request for a user with a given ID
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts');

      const { data } = response;

      expect(data).to.be.an('array');

      expect(data).to.have.length(100);
    });

    // unhappy path
    it('should fail to get all posts', async () => {
      // Make a request for a user with a given ID
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts');

      const { data } = response;

      expect(data).to.not.be.an('object');
    });
  });

  describe('POST/ POSTS', () => {
    it('should create post', () => {});
  });
});
