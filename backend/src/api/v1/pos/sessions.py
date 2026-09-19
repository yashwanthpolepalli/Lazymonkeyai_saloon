from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.pos import POSRegisterSession
from pydantic import BaseModel

router = APIRouter(prefix="/pos/sessions", tags=["POS - Cash Sessions"])

class OpenSessionRequest(BaseModel):
    branch_id: str
    opened_by: str
    opening_cash: float

class CloseSessionRequest(BaseModel):
    closed_by: str
    closing_cash: float
    notes: Optional[str] = None

@router.get("/active/{branch_id}")
def get_active_session(branch_id: str, db: Session = Depends(get_db)):
    session = db.query(POSRegisterSession).filter(
        POSRegisterSession.branch_id == branch_id,
        POSRegisterSession.status == "open"
    ).first()
    return session

@router.post("/open", status_code=status.HTTP_201_CREATED)
def open_register_session(req: OpenSessionRequest, db: Session = Depends(get_db)):
    code = f"SES-{datetime.now().strftime('%y%m%d%H%M')}"
    session = POSRegisterSession(
        session_code=code,
        branch_id=req.branch_id,
        opened_by=req.opened_by,
        opening_cash=req.opening_cash,
        status="open"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/{session_id}/close")
def close_register_session(session_id: str, req: CloseSessionRequest, db: Session = Depends(get_db)):
    session = db.query(POSRegisterSession).filter(POSRegisterSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.closed_by = req.closed_by
    session.closing_cash = req.closing_cash
    session.cash_difference = req.closing_cash - (session.opening_cash + session.total_sales)
    session.notes = req.notes
    session.status = "closed"
    db.commit()
    db.refresh(session)
    return session
