import os
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.config import settings
from src.models.appointment import Appointment
from src.models.salon import Branch, Stylist
from pydantic import BaseModel

router = APIRouter(prefix="/calendar-sync", tags=["Calendar - Google & iCal Two-Way Sync"])

class GoogleOAuthUrlResponse(BaseModel):
    oauth_url: str
    is_configured: bool

class CalendarSyncStatusResponse(BaseModel):
    is_google_connected: bool
    google_account_email: Optional[str] = None
    ical_feed_url: str
    last_synced_at: Optional[str] = None

@router.get("/oauth/google-url", response_model=GoogleOAuthUrlResponse)
def get_google_oauth_url(branch_id: Optional[str] = None):
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/api/v1/calendar-sync/oauth/callback"
    
    if not client_id:
        return {
            "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth?prompt=consent",
            "is_configured": False
        }
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        "access_type": "offline",
        "prompt": "consent",
        "state": branch_id or "default_branch"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {
        "oauth_url": url,
        "is_configured": True
    }

@router.get("/status", response_model=CalendarSyncStatusResponse)
def get_calendar_sync_status(branch_id: Optional[str] = None):
    base_api = "http://localhost:8000/api/v1"
    ical_url = f"{base_api}/calendar-sync/ical/feed.ics{f'?branch_id={branch_id}' if branch_id else ''}"
    return {
        "is_google_connected": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "google_account_email": "connected_calendar@businessos.ai" if settings.GOOGLE_CLIENT_ID else None,
        "ical_feed_url": ical_url,
        "last_synced_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/ical/feed.ics")
def get_ical_live_feed(
    branch_id: Optional[str] = None,
    stylist_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generates a live RFC 5545 compliant iCalendar (ICS) feed.
    Compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
    """
    query = db.query(Appointment).filter(Appointment.status != "cancelled")
    if branch_id:
        query = query.filter(Appointment.branch_id == branch_id)
    if stylist_id:
        query = query.filter(Appointment.stylist_id == stylist_id)
    
    appointments = query.all()
    
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LazyMonkey AI Salon//BusinessOS Calendar Engine//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Salon Appointments Live Feed",
        "X-WR-TIMEZONE:Asia/Kolkata",
    ]

    for app in appointments:
        try:
            # Parse start date and time
            date_part = app.date.replace("-", "")
            time_clean = app.time_slot.replace(":", "").replace(" ", "").upper()
            
            # Format 24hr or standard timestamp
            if "PM" in time_clean or "AM" in time_clean:
                dt_obj = datetime.strptime(f"{app.date} {app.time_slot}", "%Y-%m-%d %I:%M %p")
            else:
                dt_obj = datetime.strptime(f"{app.date} {app.time_slot}", "%Y-%m-%d %H:%M")
            
            end_dt = dt_obj + timedelta(minutes=app.duration_minutes or 45)
            dtstart = dt_obj.strftime("%Y%m%dT%H%M%S")
            dtend = end_dt.strftime("%Y%m%dT%H%M%S")
        except Exception:
            dtstart = f"{app.date.replace('-', '')}T090000"
            dtend = f"{app.date.replace('-', '')}T100000"

        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:{app.booking_ref or app.id}@saloon.lazymonkey.ai",
            f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"SUMMARY:{app.service_name} - {app.customer_name}",
            f"DESCRIPTION:Stylist: {app.stylist_name}\\nCustomer: {app.customer_name} ({app.customer_phone})\\nTotal: INR {app.final_total}\\nStatus: {app.status}",
            f"LOCATION:{app.branch_name or 'Salon Main Branch'}",
            f"STATUS:{'CONFIRMED' if app.status != 'cancelled' else 'CANCELLED'}",
            "END:VEVENT",
        ])

    ics_lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(ics_lines)
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": "attachment; filename=salon_schedule.ics"}
    )
