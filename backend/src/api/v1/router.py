from fastapi import APIRouter

# Base Module Routers
from src.api.v1.auth import router as auth_router
from src.api.v1.branches import router as branches_router
from src.api.v1.services import router as services_router
from src.api.v1.stylists import router as stylists_router
from src.api.v1.appointments import router as appointments_router
from src.api.v1.inventory import router as inventory_router
from src.api.v1.marketing import router as marketing_router
from src.api.v1.finance import router as finance_router
from src.api.v1.copilot import router as copilot_router
from src.api.v1.notifications import router as notifications_router
from src.api.v1.system_settings import router as settings_router

# CRM Sub-Routers
from src.api.v1.crm_modules.customers import router as crm_customers_router, wallet_router as crm_wallet_router
from src.api.v1.crm_modules.memberships import router as crm_memberships_router
from src.api.v1.crm_modules.loyalty import router as crm_loyalty_router
from src.api.v1.crm_modules.segments import router as crm_segments_router
from src.api.v1.crm_modules.whatsapp_automation import router as crm_whatsapp_router
from src.api.v1.crm_modules.leads import router as crm_leads_router
from src.api.v1.crm_modules.tickets import router as crm_tickets_router

# POS Sub-Routers
from src.api.v1.pos.transactions import router as pos_transactions_router
from src.api.v1.pos.products import router as pos_products_router
from src.api.v1.pos.sessions import router as pos_sessions_router
from src.api.v1.pos.free_qty_rules import router as pos_free_qty_router

# HRMS Sub-Routers
from src.api.v1.hrms.employees import router as hrms_employees_router
from src.api.v1.hrms.attendance import router as hrms_attendance_router
from src.api.v1.hrms.leaves import router as hrms_leaves_router
from src.api.v1.hrms.payroll import router as hrms_payroll_router
from src.api.v1.hrms.performance import router as hrms_performance_router
from src.api.v1.hrms.learning import router as hrms_learning_router
from src.api.v1.hrms.recruitment import router as hrms_recruitment_router
from src.api.v1.hrms.intelligence import router as hrms_intelligence_router
from src.api.v1.hrms.exit_management import router as hrms_exit_router

# ERP Sub-Routers
from src.api.v1.erp.invoices import router as erp_invoices_router
from src.api.v1.erp.accounting import router as erp_accounting_router
from src.api.v1.erp.gst_filing import router as erp_gst_router
from src.api.v1.erp.vouchers import router as erp_vouchers_router
from src.api.v1.erp.fixed_assets import router as erp_fixed_assets_router

api_v1_router = APIRouter(prefix="/api/v1")

# Include Core Base Routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(branches_router)
api_v1_router.include_router(services_router)
api_v1_router.include_router(stylists_router)
api_v1_router.include_router(appointments_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(marketing_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(copilot_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(settings_router)

# Include CRM Routers
api_v1_router.include_router(crm_customers_router)
api_v1_router.include_router(crm_wallet_router)
api_v1_router.include_router(crm_memberships_router)
api_v1_router.include_router(crm_loyalty_router)
api_v1_router.include_router(crm_segments_router)
api_v1_router.include_router(crm_whatsapp_router)
api_v1_router.include_router(crm_leads_router)
api_v1_router.include_router(crm_tickets_router)

# Include POS Routers
api_v1_router.include_router(pos_transactions_router)
api_v1_router.include_router(pos_products_router)
api_v1_router.include_router(pos_sessions_router)
api_v1_router.include_router(pos_free_qty_router)

# Include HRMS Routers
api_v1_router.include_router(hrms_employees_router)
api_v1_router.include_router(hrms_attendance_router)
api_v1_router.include_router(hrms_leaves_router)
api_v1_router.include_router(hrms_payroll_router)
api_v1_router.include_router(hrms_performance_router)
api_v1_router.include_router(hrms_learning_router)
api_v1_router.include_router(hrms_recruitment_router)
api_v1_router.include_router(hrms_intelligence_router)
api_v1_router.include_router(hrms_exit_router)

# Include ERP Routers
api_v1_router.include_router(erp_invoices_router)
api_v1_router.include_router(erp_accounting_router)
api_v1_router.include_router(erp_gst_router)
api_v1_router.include_router(erp_vouchers_router)
api_v1_router.include_router(erp_fixed_assets_router)
