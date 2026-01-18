from fastapi import Header, HTTPException
from app.db.supabase import supabase

def get_current_user(authorization:str = Header(...)):
    token=authorization.replace("Bearer", "")
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user.user    