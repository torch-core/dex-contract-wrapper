import { multiply, subtract, sum } from '../src/index';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

describe('subtract module', () => {
  test('subtracts 1 - 2 to equal -1', () => {
    expect(subtract(1, 2)).toBe(-1);
  });
});

describe('multiply module', () => {
  test('multiplies 1 * 2 to equal 2', () => {
    expect(multiply(1, 2)).toBe(2);
  });
});
