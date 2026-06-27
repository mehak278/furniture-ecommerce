const calculateCommission = (price, qty, commissionRate = 10) => {
  const itemTotal = price * qty;
  const commission = (itemTotal * commissionRate) / 100;
  const vendorEarning = itemTotal - commission;
  return {
    itemTotal,
    commission: Math.round(commission * 100) / 100,
    vendorEarning: Math.round(vendorEarning * 100) / 100,
  };
};

module.exports = calculateCommission;
