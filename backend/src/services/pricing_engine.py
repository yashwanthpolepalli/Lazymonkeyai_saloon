from typing import List, Optional, Dict, Any

def get_tier_markup(tier: str, base_price: float) -> float:
    multipliers = {
        "master": 1.5,
        "senior": 1.25,
        "executive": 1.1,
        "director": 1.75
    }
    multiplier = multipliers.get(tier.lower(), 1.0)
    return round(base_price * (multiplier - 1.0))

def calculate_service_pricing(
    base_price: float,
    stylist_tier: str = "senior",
    selected_options: Optional[List[Dict[str, Any]]] = None,
    selected_add_ons: Optional[List[Dict[str, Any]]] = None,
    membership_discount_pct: float = 0.0,
    has_package_credit: bool = False,
    wallet_balance: float = 0.0,
    loyalty_points: int = 0,
    coupon_discount_pct: Optional[float] = None,
    coupon_flat_discount: Optional[float] = None,
    tax_rate: float = 0.18,
    use_wallet: bool = False,
    use_loyalty: bool = False
) -> Dict[str, Any]:
    options_price = sum(opt.get("price_delta", 0) for opt in (selected_options or []))
    add_ons_price = sum(addon.get("price", 0) for addon in (selected_add_ons or []))
    stylist_markup = get_tier_markup(stylist_tier, base_price)

    full_service_cost = base_price + options_price + add_ons_price + stylist_markup
    discounted_service_cost = full_service_cost
    package_savings = 0.0

    if has_package_credit:
        package_savings = base_price + options_price + stylist_markup
        discounted_service_cost = add_ons_price

    membership_discount = 0.0
    if not has_package_credit and membership_discount_pct > 0:
        membership_discount = round(discounted_service_cost * (membership_discount_pct / 100.0))

    subtotal_after_membership = max(0.0, discounted_service_cost - membership_discount)

    coupon_discount = 0.0
    if coupon_flat_discount and coupon_flat_discount > 0:
        coupon_discount = min(coupon_flat_discount, subtotal_after_membership)
    elif coupon_discount_pct and coupon_discount_pct > 0:
        coupon_discount = round(subtotal_after_membership * (coupon_discount_pct / 100.0))

    subtotal_after_coupon = max(0.0, subtotal_after_membership - coupon_discount)

    loyalty_discount = 0.0
    if use_loyalty and loyalty_points > 0:
        # 100 points = 100 currency units (e.g. ₹100 max up to 20% of subtotal)
        max_loyalty_applicable = subtotal_after_coupon * 0.20
        loyalty_discount = min(float(loyalty_points), max_loyalty_applicable)

    subtotal_after_loyalty = max(0.0, subtotal_after_coupon - loyalty_discount)
    tax_amount = round(subtotal_after_loyalty * tax_rate)
    total_before_wallet = subtotal_after_loyalty + tax_amount

    wallet_used = 0.0
    if use_wallet and wallet_balance > 0:
        wallet_used = min(wallet_balance, total_before_wallet)

    final_total = max(0.0, total_before_wallet - wallet_used)

    return {
        "base_price": base_price,
        "options_price": options_price,
        "add_ons_price": add_ons_price,
        "stylist_tier_markup": stylist_markup,
        "subtotal": full_service_cost,
        "membership_discount": membership_discount,
        "package_savings": package_savings,
        "coupon_discount": coupon_discount,
        "loyalty_discount": loyalty_discount,
        "tax_amount": tax_amount,
        "wallet_used": wallet_used,
        "final_total": final_total,
    }
