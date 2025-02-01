from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/health")
async def admin_health_check():
    """
    Example admin endpoint - you can move your admin logic here.
    """
    return {"status": "Admin route healthy!"}
