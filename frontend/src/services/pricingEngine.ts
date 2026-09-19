import { Service, StylistTier, AddOn, BookingSelectedOption, CustomerMembership, Coupon, Branch } from "@/types";

export interface PricingCalculationInput {
  service: Service;
  selectedOptions: BookingSelectedOption[];
  selectedAddOns: AddOn[];
  stylistTier: StylistTier;
  branch: Branch;
  membership?: CustomerMembership;
  usePackageCredit?: boolean;
  walletToUse?: number;
  loyaltyPointsToRedeem?: number; // 100 pts = 50 currency units
  coupon?: Coupon;
}

export interface PricingBreakdown {
  basePrice: number;
  optionsPrice: number;
  addOnsPrice: number;
  stylistMarkup: number;
  subtotal: number;
  membershipDiscount: number;
  packageCreditApplied: boolean;
  packageSavings: number;
  loyaltyDiscount: number;
  couponDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  finalTotal: number;
  walletUsed: number;
  amountPayableAtCounter: number;
}

export function calculateDynamicPricing(input: PricingCalculationInput): PricingBreakdown {
  const {
    service,
    selectedOptions,
    selectedAddOns,
    stylistTier,
    branch,
    membership,
    usePackageCredit = false,
    walletToUse = 0,
    loyaltyPointsToRedeem = 0,
    coupon,
  } = input;

  const basePrice = service.basePrice;
  const optionsPrice = selectedOptions.reduce((acc, curr) => acc + curr.priceDelta, 0);
  const addOnsPrice = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);

  // Stylist Tier Markup calculation
  let multiplier = 1.0;
  if (stylistTier === "senior") multiplier = 1.15;
  if (stylistTier === "master") multiplier = 1.25;
  if (stylistTier === "director") multiplier = 1.5;

  const stylistMarkup = Math.round(basePrice * (multiplier - 1.0));
  const fullServiceCost = basePrice + optionsPrice + addOnsPrice + stylistMarkup;

  let packageSavings = 0;
  let discountedServiceCost = fullServiceCost;

  if (usePackageCredit) {
    packageSavings = basePrice + optionsPrice + stylistMarkup; // covers the base service & options
    discountedServiceCost = addOnsPrice; // client only pays add-ons
  }

  // Membership discount (applied to service if not package covered)
  let membershipDiscount = 0;
  if (membership && membership.active && !usePackageCredit) {
    // 25% for Black Diamond, 15% for Gold, 10% for Rose
    let pct = 0;
    if (membership.tierId.includes("black_diamond")) pct = 0.25;
    else if (membership.tierId.includes("gold")) pct = 0.15;
    else if (membership.tierId.includes("rose")) pct = 0.10;

    membershipDiscount = Math.round(discountedServiceCost * pct);
  }

  const subtotalAfterMembership = Math.max(0, discountedServiceCost - membershipDiscount);

  // Coupon discount
  let couponDiscount = 0;
  if (coupon && subtotalAfterMembership >= coupon.minSpend) {
    if (coupon.discountPercent) {
      const discount = Math.round((subtotalAfterMembership * coupon.discountPercent) / 100);
      couponDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    } else if (coupon.flatDiscount) {
      couponDiscount = Math.min(coupon.flatDiscount, subtotalAfterMembership);
    }
  }

  // Loyalty points discount (100 points = ₹50 or $50 equivalent based on tier)
  const loyaltyDiscount = Math.min(
    Math.round((loyaltyPointsToRedeem / 100) * (branch.currency === "INR" ? 50 : 5)),
    Math.max(0, subtotalAfterMembership - couponDiscount)
  );

  const taxableAmount = Math.max(0, subtotalAfterMembership - couponDiscount - loyaltyDiscount);
  const taxRate = branch.taxRate || 0.18;
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
  const finalTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const walletUsed = Math.min(walletToUse, finalTotal);
  const amountPayableAtCounter = Math.max(0, finalTotal - walletUsed);

  return {
    basePrice,
    optionsPrice,
    addOnsPrice,
    stylistMarkup,
    subtotal: fullServiceCost,
    membershipDiscount,
    packageCreditApplied: usePackageCredit,
    packageSavings,
    loyaltyDiscount,
    couponDiscount,
    taxableAmount,
    taxAmount,
    finalTotal,
    walletUsed,
    amountPayableAtCounter,
  };
}
