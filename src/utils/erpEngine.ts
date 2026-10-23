export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  costCenter?: string;
  dimensionBranch?: string;
  dimensionChannel?: string;
  debit: number;
  credit: number;
  note?: string;
}

export interface InstallmentRule {
  label: string;
  percentage: number;
  dueDays: number;
}

export interface InstallmentScheduleItem {
  label: string;
  percentage: number;
  amount: number;
  dueDays: number;
  status: 'پرداخت‌شده' | 'در انتظار' | 'سررسید گذشته';
}

export interface LandedCostItemInput {
  itemCode: string;
  itemName: string;
  qty: number;
  weightGrams: number;
  unitCost: number;
}

export interface LandedCostItemOutput extends LandedCostItemInput {
  allocatedLandedCost: number;
  finalUnitCost: number;
  finalLineTotal: number;
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('fa-IR').format(rounded);
}

export function validateJournalEntry(lines: JournalLine[]): {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errorMessage?: string;
} {
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);

  if (lines.length < 2) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      errorMessage: 'سند روزنامه دوبل باید حداقل شامل ۲ ردیف (بدهکار و بستانکار) باشد.',
    };
  }
  if (totalDebit <= 0 || totalCredit <= 0) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      errorMessage: 'جمع مبالغ بدهکار و بستانکار باید بزرگتر از صفر باشد.',
    };
  }
  if (difference > 0.01) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      errorMessage: `سند تراز نیست؛ اختلاف بدهکار و بستانکار: ${formatCurrency(difference)} تومان`,
    };
  }
  return {
    isValid: true,
    totalDebit,
    totalCredit,
    difference: 0,
  };
}

export function calculateInstallments(
  totalAmount: number,
  rules: InstallmentRule[],
  paidFirstInstallment = true
): InstallmentScheduleItem[] {
  if (totalAmount <= 0 || rules.length === 0) return [];
  let allocated = 0;
  return rules.map((rule, index) => {
    const isLast = index === rules.length - 1;
    const amount = isLast
      ? Math.max(0, totalAmount - allocated)
      : Math.round((totalAmount * rule.percentage) / 100);
    allocated += amount;
    return {
      label: rule.label,
      percentage: rule.percentage,
      amount,
      dueDays: rule.dueDays,
      status: index === 0 && paidFirstInstallment && rule.dueDays === 0 ? 'پرداخت‌شده' : 'در انتظار',
    };
  });
}

export function calculateMovingAverageValuation(
  currentQty: number,
  currentValuationRate: number,
  incomingQty: number,
  incomingRate: number
): { newQty: number; newValuationRate: number; totalValue: number } {
  const safeCurrentQty = Math.max(0, currentQty);
  const safeIncomingQty = Math.max(0, incomingQty);
  const newQty = safeCurrentQty + safeIncomingQty;
  if (newQty === 0) {
    return { newQty: 0, newValuationRate: currentValuationRate, totalValue: 0 };
  }
  const totalValue = safeCurrentQty * currentValuationRate + safeIncomingQty * incomingRate;
  const newValuationRate = Math.round(totalValue / newQty);
  return {
    newQty,
    newValuationRate,
    totalValue: newQty * newValuationRate,
  };
}

export function allocateLandedCost(
  items: LandedCostItemInput[],
  totalExtraCharges: number,
  basis: 'amount' | 'qty' | 'weight'
): LandedCostItemOutput[] {
  const totalBasis = items.reduce((sum, item) => {
    if (basis === 'qty') return sum + item.qty;
    if (basis === 'weight') return sum + item.qty * item.weightGrams;
    return sum + item.qty * item.unitCost;
  }, 0);

  if (totalBasis <= 0) {
    return items.map((item) => ({
      ...item,
      allocatedLandedCost: 0,
      finalUnitCost: item.unitCost,
      finalLineTotal: item.qty * item.unitCost,
    }));
  }

  return items.map((item) => {
    const itemBasis =
      basis === 'qty'
        ? item.qty
        : basis === 'weight'
          ? item.qty * item.weightGrams
          : item.qty * item.unitCost;
    const shareRatio = itemBasis / totalBasis;
    const allocatedLandedCost = Math.round(totalExtraCharges * shareRatio);
    const baseTotal = item.qty * item.unitCost;
    const finalLineTotal = baseTotal + allocatedLandedCost;
    const finalUnitCost = item.qty > 0 ? Math.round(finalLineTotal / item.qty) : item.unitCost;
    return {
      ...item,
      allocatedLandedCost,
      finalUnitCost,
      finalLineTotal,
    };
  });
}

export function calculateAssetDepreciation(
  purchaseValue: number,
  salvageValue: number,
  usefulLifeMonths: number,
  elapsedMonths: number,
  method: 'straight-line' | 'declining'
): {
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
} {
  const depreciableBase = Math.max(0, purchaseValue - salvageValue);
  const safeLife = Math.max(1, usefulLifeMonths);
  const clampedElapsed = Math.min(Math.max(0, elapsedMonths), safeLife);

  if (method === 'straight-line') {
    const monthlyDepreciation = Math.round(depreciableBase / safeLife);
    const accumulatedDepreciation = Math.min(
      depreciableBase,
      monthlyDepreciation * clampedElapsed
    );
    const currentBookValue = Math.max(salvageValue, purchaseValue - accumulatedDepreciation);
    return {
      monthlyDepreciation,
      accumulatedDepreciation,
      currentBookValue,
    };
  }

  // Double declining balance approximation per month
  const monthlyRate = Math.min(0.15, 2 / safeLife);
  let book = purchaseValue;
  let lastMonthDep = 0;
  for (let m = 0; m < clampedElapsed; m++) {
    const dep = Math.min(Math.max(0, book - salvageValue), Math.round(book * monthlyRate));
    lastMonthDep = dep;
    book -= dep;
  }
  const monthlyDepreciation =
    clampedElapsed === 0
      ? Math.round(purchaseValue * monthlyRate)
      : lastMonthDep;
  const accumulatedDepreciation = purchaseValue - book;
  return {
    monthlyDepreciation,
    accumulatedDepreciation,
    currentBookValue: book,
  };
}

export function evaluateBudgetControl(
  allocatedBudget: number,
  spentSoFar: number,
  newExpenseAmount: number,
  actionOnExceed: 'WARN' | 'STOP'
): {
  status: 'OK' | 'WARNING' | 'STOPPED';
  utilizationPercent: number;
  remainingAfter: number;
  message: string;
} {
  const totalAfter = spentSoFar + newExpenseAmount;
  const utilizationPercent =
    allocatedBudget > 0 ? Math.round((totalAfter / allocatedBudget) * 100) : 100;
  const remainingAfter = allocatedBudget - totalAfter;

  if (totalAfter <= allocatedBudget) {
    return {
      status: 'OK',
      utilizationPercent,
      remainingAfter,
      message: `در محدوده بودجه مجاز (${utilizationPercent}٪ مصرف‌شده)`,
    };
  }

  if (actionOnExceed === 'STOP') {
    return {
      status: 'STOPPED',
      utilizationPercent,
      remainingAfter,
      message: `توقف سیستمی: عبور از سقف بودجه به میزان ${formatCurrency(Math.abs(remainingAfter))} تومان (سیاست: جلوگیری از ثبت سند)`,
    };
  }

  return {
    status: 'WARNING',
    utilizationPercent,
    remainingAfter,
    message: `هشدار بودجه: عبور از سقف مجاز به میزان ${formatCurrency(Math.abs(remainingAfter))} تومان (سیاست: ثبت با هشدار به مدیر مالی)`,
  };
}

export function allocateCostCenterExpense(
  totalAmount: number,
  allocations: { costCenterName: string; percentage: number }[]
): { costCenterName: string; percentage: number; allocatedAmount: number }[] {
  return allocations.map((item) => ({
    costCenterName: item.costCenterName,
    percentage: item.percentage,
    allocatedAmount: Math.round((totalAmount * item.percentage) / 100),
  }));
}

export function calculatePosCartTotals(params: {
  items: { price: number; qty: number; category: string }[];
  priceListMultiplier: number; // 1 = تکی, 0.88 = عمده, 0.92 = همکار
  couponPercent: number;
  redeemLoyaltyPoints: number; // each point = 1,000 Toman
  taxPercent: number;
  partnerCommissionPercent: number;
}): {
  grossTotal: number;
  pricingRuleDiscount: number;
  couponDiscount: number;
  loyaltyDiscount: number;
  taxAmount: number;
  netPayable: number;
  earnedLoyaltyPoints: number;
  partnerCommissionAmount: number;
  freeGiftTriggered: boolean;
} {
  const grossTotal = params.items.reduce(
    (sum, item) => sum + Math.round(item.price * params.priceListMultiplier) * item.qty,
    0
  );
  const totalQty = params.items.reduce((sum, item) => sum + item.qty, 0);

  // Stepped quantity pricing rule: 5% automatic discount when buying >= 5 items
  const pricingRuleDiscount = totalQty >= 5 ? Math.round(grossTotal * 0.05) : 0;
  const freeGiftTriggered = totalQty >= 3;

  const afterPricingRule = Math.max(0, grossTotal - pricingRuleDiscount);
  const couponDiscount =
    params.couponPercent > 0
      ? Math.round((afterPricingRule * params.couponPercent) / 100)
      : 0;
  const loyaltyDiscount = Math.min(
    Math.max(0, afterPricingRule - couponDiscount),
    params.redeemLoyaltyPoints * 1000
  );
  const taxableBase = Math.max(0, afterPricingRule - couponDiscount - loyaltyDiscount);
  const taxAmount = Math.round((taxableBase * params.taxPercent) / 100);
  const netPayable = taxableBase + taxAmount;
  const earnedLoyaltyPoints = Math.floor(netPayable / 50000);
  const partnerCommissionAmount = Math.round(
    (taxableBase * params.partnerCommissionPercent) / 100
  );

  return {
    grossTotal,
    pricingRuleDiscount,
    couponDiscount,
    loyaltyDiscount,
    taxAmount,
    netPayable,
    earnedLoyaltyPoints,
    partnerCommissionAmount,
    freeGiftTriggered,
  };
}

export function calculateStockReconciliation(
  systemQty: number,
  physicalQty: number,
  valuationRate: number,
  reorderLevel: number
): {
  varianceQty: number;
  varianceValue: number;
  needsAutoReorder: boolean;
  suggestedOrderQty: number;
} {
  const varianceQty = physicalQty - systemQty;
  const varianceValue = varianceQty * valuationRate;
  const needsAutoReorder = physicalQty <= reorderLevel;
  const suggestedOrderQty = needsAutoReorder ? Math.max(10, reorderLevel * 2 - physicalQty) : 0;

  return {
    varianceQty,
    varianceValue,
    needsAutoReorder,
    suggestedOrderQty,
  };
}

export function generateItemVariants(
  baseName: string,
  baseSku: string,
  flavors: string[],
  nicotineLevels: string[]
): { sku: string; variantName: string; flavor: string; nicotine: string }[] {
  const results: { sku: string; variantName: string; flavor: string; nicotine: string }[] = [];
  flavors.forEach((flavor, fIdx) => {
    nicotineLevels.forEach((nic, nIdx) => {
      results.push({
        sku: `${baseSku}-V${fIdx + 1}${nIdx + 1}`,
        variantName: `${baseName} — طعم ${flavor} (${nic})`,
        flavor,
        nicotine: nic,
      });
    });
  });
  return results;
}

export type SystemRole =
  | 'ادمین کل (Super Admin)'
  | 'مدیر مالی (Accounts Manager)'
  | 'سرپرست انبار (Stock Manager)'
  | 'صندوقدار POS';

export function checkRolePermission(
  role: SystemRole,
  permission:
    | 'view_buying_cost'
    | 'unlock_fiscal_year'
    | 'manage_users_roles'
    | 'post_journal'
    | 'adjust_stock'
    | 'export_database'
): boolean {
  if (role === 'ادمین کل (Super Admin)') return true;
  switch (permission) {
    case 'view_buying_cost':
      return role === 'مدیر مالی (Accounts Manager)' || role === 'سرپرست انبار (Stock Manager)';
    case 'unlock_fiscal_year':
    case 'manage_users_roles':
    case 'export_database':
      return false; // Strictly Super Admin
    case 'post_journal':
      return role === 'مدیر مالی (Accounts Manager)';
    case 'adjust_stock':
      return role === 'سرپرست انبار (Stock Manager)';
    default:
      return false;
  }
}

export function calculateFinancialStatements(
  accounts: { category: 'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه'; level: string; balance: number }[]
): {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  equityPlusLiabilitiesAndProfit: number;
  isBalanceSheetBalanced: boolean;
} {
  const groupAccounts = accounts.filter((a) => a.level === 'گروه');
  const sumByCategory = (cat: 'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه') =>
    groupAccounts.filter((a) => a.category === cat).reduce((s, a) => s + a.balance, 0);

  const totalAssets = sumByCategory('دارایی');
  const totalLiabilities = sumByCategory('بدهی');
  const totalEquity = sumByCategory('سرمایه');
  const totalRevenue = sumByCategory('درآمد');
  const totalExpenses = sumByCategory('هزینه');
  const netProfit = totalRevenue - totalExpenses;
  const equityPlusLiabilitiesAndProfit = totalLiabilities + totalEquity + netProfit;

  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netProfit,
    equityPlusLiabilitiesAndProfit,
    isBalanceSheetBalanced: Math.abs(totalAssets - equityPlusLiabilitiesAndProfit) < 1,
  };
}

export function postDoubleEntryToAccounts<
  T extends {
    code: string;
    category: 'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه';
    level: 'گروه' | 'کل' | 'معین' | 'تفصیلی';
    parentCode?: string;
    balance: number;
  }
>(accounts: T[], lines: { accountCode: string; debit: number; credit: number }[]): T[] {
  // First update target accounts and their ancestor chain
  const deltas = new Map<string, number>();

  const byCode = new Map<string, T>();
  accounts.forEach((a) => byCode.set(a.code, a));

  for (const line of lines) {
    const target = byCode.get(line.accountCode);
    if (!target) continue;
    const isDebitNature = target.category === 'دارایی' || target.category === 'هزینه';
    const netChange = isDebitNature ? line.debit - line.credit : line.credit - line.debit;

    // Apply delta to target and all its parent accounts up the tree
    let curr: T | undefined = target;
    const visited = new Set<string>();
    while (curr && !visited.has(curr.code)) {
      visited.add(curr.code);
      deltas.set(curr.code, (deltas.get(curr.code) || 0) + netChange);
      curr = curr.parentCode ? byCode.get(curr.parentCode) : undefined;
    }
  }

  return accounts.map((acc) => {
    const d = deltas.get(acc.code);
    if (!d) return acc;
    return { ...acc, balance: acc.balance + d };
  });
}


