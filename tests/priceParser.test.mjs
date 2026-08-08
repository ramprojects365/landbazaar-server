import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIndianPriceValue } from '../src/utils/priceParsing.js';

test('parses Indian price strings into numeric values', () => {
  assert.equal(parseIndianPriceValue('8 lakhs'), 800000);
  assert.equal(parseIndianPriceValue('2 crores'), 20000000);
  assert.equal(parseIndianPriceValue('65 thousands'), 65000);
  assert.equal(parseIndianPriceValue('1.5 lakh'), 150000);
  assert.equal(parseIndianPriceValue('1200000'), 1200000);
  assert.equal(parseIndianPriceValue('INR 5,00,000'), 500000);
});
