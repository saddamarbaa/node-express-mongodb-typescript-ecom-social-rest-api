import { getRandomIntNumberInBetween, getImageExtension, generateSecretKey, isValidMongooseObjectId } from '@src/utils';

describe('Testing to see if Jest works', () => {
  describe('given two plus two', () => {
    it('should return 4', () => {
      expect(2 + 2).toBe(4);
    });
  });

  describe('given true === true', () => {
    it('should return true', () => {
      expect(true).toBe(true);
    });
  });
});

describe('utils', () => {
  describe('getRandomIntNumberInBetween', () => {
    describe('given function call with no arguments', () => {
      it('should return number between one and 5', () => {
        const result = getRandomIntNumberInBetween();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(5);
      });
    });

    describe('given the value 10 and 100', () => {
      it('should return number between 10 and 100', () => {
        const result = getRandomIntNumberInBetween(10, 100);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getImageExtension', () => {
    describe('given the mimetype "image/png"', () => {
      it('should return .png', () => {
        expect(getImageExtension('image/png')).toMatch(/.png/);
      });
    });

    describe('given the mimetype "image/webp"', () => {
      it('should return .webp', () => {
        expect(getImageExtension('image/webp')).toMatch(/.webp/);
      });
    });

    describe('given invaild mimetype', () => {
      it('should return false', () => {
        expect(getImageExtension('image/pdf')).toBeFalsy();
      });
    });
  });

  describe('generateSecretKey', () => {
    describe('given no arguments', () => {
      it('should return random secret key', () => {
        expect(generateSecretKey()).toBeTruthy();
      });
    });
  });

  describe('isValidMongooseObjectId', () => {
    describe('given the mongoose object Id is valid', () => {
      it('should return true', () => {
        const vaildId = '63a449d6f4cf592dedf5c60b';
        expect(isValidMongooseObjectId(vaildId)).toBeTruthy();
      });
    });

    describe('given the mongoose object Id is invaild', () => {
      it('should return false', async () => {
        const invaildId = 'invaild';
        expect(isValidMongooseObjectId(invaildId)).toBeFalsy();
      });
    });
  });
});
