import { sum } from '../../src/utils/index';

describe('Sample Unit Tests', () => {
    test('should return the sum of two numbers', () => {
        expect(sum(1, 2)).toBe(3);
    });

    test('should return the sum of negative numbers', () => {
        expect(sum(-1, -1)).toBe(-2);
    });

    test('should return zero when adding zero', () => {
        expect(sum(0, 0)).toBe(0);
    });
});

describe('Sample test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});