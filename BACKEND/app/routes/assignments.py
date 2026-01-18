from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.db.supabase import supabase

router=APIRouter()

@router.get("/assignments")

def get_assignments(user=Depends(get_current_user)):
    result = supabase.table("assignments").select("*").execute()
    return result.data