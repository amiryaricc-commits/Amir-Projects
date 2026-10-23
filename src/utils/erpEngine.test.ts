import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateJournalEntry,
  calculateInstallments,
  calculateMovingAverageValuation,
  allocateLandedCost,
  calculateAssetDepreciation,
  evaluateBudgetControl,
  calculatePosCartTotals,
  calculateStockReconciliation,
  generateItemVariants,
} from './erpEngine';

test('validateJournalEntry enforces double-entry debit === credit rule', () => {
  const balanced = validateJournalEntry([
    { id: '1', accountCode: '1101', accountName: 'بانک ملت', debit: 15000000, credit: 0 },
    { id: '2', accountCode: '4101', accountName: 'درآمد فروش کالا', debit: 0, credit: 15000000 },
  ]);
  assert.equal(balanced.isValid, true);
  assert.equal(balanced.difference, 0);

  const unbalanced = validateJournalEntry([
    { id: '1', accountCode: '1101', accountName: 'بانک ملت', debit: 15000000, credit: 0 },
    { id: '2', accountCode: '4101', accountName: 'درآمد فروش کالا', debit: 0, credit: 12000000 },
  ]);
  assert.equal(unbalanced.isValid, false);
  assert.equal(unbalanced.difference, 3000000);
});

test('calculateInstallments splits invoice accurately into 30/35/35 schedule', () => {
  const schedule = calculateInstallments(10000000, [
    { label: 'پیش‌پرداخت نقد (۳۰٪)', percentage: 30, dueDays: 0 },
    { label: 'قسط اول - یک ماهه (۳۵٪)', percentage: 35, dueDays: 30 },
    { label: 'قسط دوم - دو ماهه (۳۵٪)', percentage: 35, dueDays: 60 },
  ]);
  assert.equal(schedule.length, 3);
  assert.equal(schedule[0].amount, 3000000);
  assert.equal(schedule[0].status, 'پرداخت‌شده');
  assert.equal(schedule[1].amount, 3500000);
  assert.equal(schedule[2].amount, 3500000);
});

test('calculateMovingAverageValuation computes weighted moving average cost', () => {
  const res = calculateMovingAverageValuation(100, 500000, 50, 650000);
  assert.equal(res.newQty, 150);
  assert.equal(res.newValuationRate, 550000);
});

test('allocateLandedCost distributes customs and freight proportionally', () => {
  const allocated = allocateLandedCost(
    [
      { itemCode: 'ITM-01', itemName: 'پاد Peak Bar 60000', qty: 10, weightGrams: 100, unitCost: 800000 },
      { itemCode: 'ITM-02', itemName: 'جویس ۶۰ میل', qty: 20, weightGrams: 80, unitCost: 400000 },
    ],
    1600000,
    'amount'
  );
  // Both lines have base total 8,000,000, so each gets 800,000 landed cost
  assert.equal(allocated[0].allocatedLandedCost, 800000);
  assert.equal(allocated[0].finalUnitCost, 880000);
  assert.equal(allocated[1].allocatedLandedCost, 800000);
  assert.equal(allocated[1].finalUnitCost, 440000);
});

test('calculateAssetDepreciation straight-line and declining balance work properly', () => {
  const sl = calculateAssetDepreciation(120000000, 12000000, 36, 12, 'straight-line');
  assert.equal(sl.monthlyDepreciation, 3000000);
  assert.equal(sl.accumulatedDepreciation, 36000000);
  assert.equal(sl.currentBookValue, 84000000);
});

test('evaluateBudgetControl enforces STOP and WARN policies accurately', () => {
  const stopped = evaluateBudgetControl(50000000, 45000000, 10000000, 'STOP');
  assert.equal(stopped.status, 'STOPPED');
  assert.equal(stopped.remainingAfter, -5000000);

  const warned = evaluateBudgetControl(50000000, 45000000, 10000000, 'WARN');
  assert.equal(warned.status, 'WARNING');
});

test('calculatePosCartTotals handles stepped discount, loyalty, tax and commission', () => {
  const totals = calculatePosCartTotals({
    items: [{ price: 1000000, qty: 5, category: 'دستگاه' }],
    priceListMultiplier: 1,
    couponPercent: 10,
    redeemLoyaltyPoints: 100, // 100,000 Toman
    taxPercent: 10,
    partnerCommissionPercent: 5,
  });
  // Gross: 5,000,000 -> 5% stepped discount = 250,000 -> 4,750,000
  // Coupon 10% of 4,750,000 = 475,000 -> 4,275,000
  // Loyalty = 100,000 -> taxableBase = 4,175,000
  // Tax 10% = 417,500 -> Net = 4,592,500
  assert.equal(totals.grossTotal, 5000000);
  assert.equal(totals.pricingRuleDiscount, 250000);
  assert.equal(totals.couponDiscount, 475000);
  assert.equal(totals.loyaltyDiscount, 100000);
  assert.equal(totals.taxAmount, 417500);
  assert.equal(totals.netPayable, 4592500);
  assert.equal(totals.freeGiftTriggered, true);
});

test('calculateStockReconciliation detects deficit and triggers auto reorder', () => {
  const rec = calculateStockReconciliation(25, 8, 500000, 10);
  assert.equal(rec.varianceQty, -17);
  assert.equal(rec.varianceValue, -8500000);
  assert.equal(rec.needsAutoReorder, true);
  assert.ok(rec.suggestedOrderQty > 0);
});

test('generateItemVariants creates SKU combinations from attributes', () => {
  const variants = generateItemVariants('پاد Peak Bar 60000', 'PK60', ['انبه یخ', 'بلوبری'], ['۲۰ میلی‌گرم', '۵۰ میلی‌گرم']);
  assert.equal(variants.length, 4);
  assert.equal(variants[0].sku, 'PK60-V11');
});
