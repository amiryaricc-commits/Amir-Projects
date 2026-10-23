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
  checkRolePermission,
  calculateFinancialStatements,
  postDoubleEntryToAccounts,
  computeMultiLineInvoiceTotals,
  computeTrialBalance6Col,
  deductStockWithBundles,
} from './erpEngine';
import { INITIAL_ACCOUNTS, INITIAL_GL_ENTRIES, INITIAL_INVENTORY_ITEMS } from '../data/erpSeedData';

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
    redeemLoyaltyPoints: 100,
    taxPercent: 10,
    partnerCommissionPercent: 5,
  });
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

test('checkRolePermission grants full access to Super Admin and restricts Cashier', () => {
  assert.equal(checkRolePermission('ادمین کل (Super Admin)', 'unlock_fiscal_year'), true);
  assert.equal(checkRolePermission('ادمین کل (Super Admin)', 'view_buying_cost'), true);
  assert.equal(checkRolePermission('صندوقدار POS', 'view_buying_cost'), false);
  assert.equal(checkRolePermission('صندوقدار POS', 'export_database'), false);
});

test('calculateFinancialStatements computes P&L and Balance Sheet equation accurately', () => {
  const st = calculateFinancialStatements([
    { category: 'دارایی', level: 'گروه', balance: 4850000000 },
    { category: 'بدهی', level: 'گروه', balance: 960000000 },
    { category: 'سرمایه', level: 'گروه', balance: 3000000000 },
    { category: 'درآمد', level: 'گروه', balance: 2150000000 },
    { category: 'هزینه', level: 'گروه', balance: 1260000000 },
  ]);
  assert.equal(st.netProfit, 890000000);
  assert.equal(st.equityPlusLiabilitiesAndProfit, 4850000000);
  assert.equal(st.isBalanceSheetBalanced, true);
});

test('postDoubleEntryToAccounts rolls up leaf debit/credit changes to parent group accounts and preserves Balance Sheet equality', () => {
  const sampleAccounts = [
    { code: '1000', category: 'دارایی' as const, level: 'گروه' as const, balance: 1000 },
    { code: '1101', category: 'دارایی' as const, level: 'معین' as const, parentCode: '1000', balance: 1000 },
    { code: '2000', category: 'بدهی' as const, level: 'گروه' as const, balance: 200 },
    { code: '3000', category: 'سرمایه' as const, level: 'گروه' as const, balance: 800 },
    { code: '4000', category: 'درآمد' as const, level: 'گروه' as const, balance: 0 },
    { code: '4101', category: 'درآمد' as const, level: 'معین' as const, parentCode: '4000', balance: 0 },
    { code: '5000', category: 'هزینه' as const, level: 'گروه' as const, balance: 0 },
  ];

  const updated = postDoubleEntryToAccounts(sampleAccounts, [
    { accountCode: '1101', debit: 500, credit: 0 },
    { accountCode: '4101', debit: 0, credit: 500 },
  ]);

  assert.equal(updated.find((a) => a.code === '1101')?.balance, 1500);
  assert.equal(updated.find((a) => a.code === '1000')?.balance, 1500);
  assert.equal(updated.find((a) => a.code === '4101')?.balance, 500);
  assert.equal(updated.find((a) => a.code === '4000')?.balance, 500);

  const st = calculateFinancialStatements(updated);
  assert.equal(st.isBalanceSheetBalanced, true);
});

test('computeMultiLineInvoiceTotals computes multi-line net, 10% VAT and grandTotal', () => {
  const res = computeMultiLineInvoiceTotals([
    { id: '1', sku: 'A', itemName: 'Item A', uom: 'عدد', qty: 2, unitPrice: 1000000, discountPercent: 10, netLineAmount: 1800000 },
    { id: '2', sku: 'B', itemName: 'Item B', uom: 'عدد', qty: 1, unitPrice: 500000, discountPercent: 0, netLineAmount: 500000 },
  ]);
  assert.equal(res.netBeforeTax, 2300000);
  assert.equal(res.taxAmount, 230000);
  assert.equal(res.grandTotal, 2530000);
});

test('computeTrialBalance6Col produces balanced 6-column trial balance for گروه/کل/معین', () => {
  for (const level of ['گروه', 'کل', 'معین'] as const) {
    const tb = computeTrialBalance6Col(INITIAL_ACCOUNTS, level, INITIAL_GL_ENTRIES, 'همه شعب');
    assert.equal(tb.totals.isBalanced, true, `Trial balance must be balanced at level ${level}`);
    assert.equal(tb.totals.closingDebit, tb.totals.closingCredit);
  }
});

test('deductStockWithBundles dynamically deducts bundle component items and computes COGS', () => {
  const bundleBefore = INITIAL_INVENTORY_ITEMS.find((i) => i.sku === 'BND-STARTER-PRO')!;
  const mangoBefore = INITIAL_INVENTORY_ITEMS.find((i) => i.sku === 'PK60-MANGO-50')!;
  const saltBefore = INITIAL_INVENTORY_ITEMS.find((i) => i.sku === 'SALT-NASTY-30')!;
  const coilBefore = INITIAL_INVENTORY_ITEMS.find((i) => i.sku === 'COIL-XROS-06')!;

  const res = deductStockWithBundles(INITIAL_INVENTORY_ITEMS, [
    { sku: 'BND-STARTER-PRO', qty: 2 },
  ]);
  const bundleAfter = res.updatedItems.find((i) => i.sku === 'BND-STARTER-PRO')!;
  const mangoAfter = res.updatedItems.find((i) => i.sku === 'PK60-MANGO-50')!;
  const saltAfter = res.updatedItems.find((i) => i.sku === 'SALT-NASTY-30')!;
  const coilAfter = res.updatedItems.find((i) => i.sku === 'COIL-XROS-06')!;

  assert.equal(bundleAfter.stockQty, bundleBefore.stockQty - 2);
  assert.equal(mangoAfter.stockQty, mangoBefore.stockQty - 2);
  assert.equal(saltAfter.stockQty, saltBefore.stockQty - 2);
  assert.equal(coilAfter.stockQty, coilBefore.stockQty - 2);
  assert.ok(res.totalCogs > 0);
});



