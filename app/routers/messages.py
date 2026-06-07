from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import json

from app.database import get_db
from app.models.message import Message
from app.models.proposal_contract import Contract
from app.schemas.message import MessageResponse
from app.core.dependencies import get_current_user
from app.core.security import decode_token
from app.models.user import User

router = APIRouter(prefix="/messages", tags=["Chat"])


# ─── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        # Maps contract_id (str) → list of active websocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, contract_id: str, websocket: WebSocket):
        await websocket.accept()
        if contract_id not in self.active_connections:
            self.active_connections[contract_id] = []
        self.active_connections[contract_id].append(websocket)

    def disconnect(self, contract_id: str, websocket: WebSocket):
        if contract_id in self.active_connections:
            self.active_connections[contract_id].remove(websocket)
            if not self.active_connections[contract_id]:
                del self.active_connections[contract_id]

    async def broadcast_to_contract(self, contract_id: str, message: dict):
        """Send a message to all connected clients in a contract chat room."""
        connections = self.active_connections.get(contract_id, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(contract_id, ws)


manager = ConnectionManager()


# ─── Helper: verify a user has access to a contract ───────────────────────────
async def _get_contract_for_user(
    db: AsyncSession,
    contract_id: uuid.UUID,
    user: User,
) -> Contract:
    result = await db.execute(select(Contract).filter(Contract.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Contract not found")
    if user.id not in (contract.client_id, contract.freelancer_id):
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You are not part of this contract")
    return contract


# ─── REST: Get Chat History ────────────────────────────────────────────────────
@router.get("/{contract_id}", response_model=List[MessageResponse])
async def get_messages(
    contract_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all messages for a contract."""
    await _get_contract_for_user(db, contract_id, current_user)

    result = await db.execute(
        select(Message)
        .filter(Message.contract_id == contract_id)
        .order_by(Message.created_at.asc())
    )
    return result.scalars().all()


# ─── REST: Send a Message (fallback for non-WS clients) ───────────────────────
@router.post("/{contract_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    contract_id: uuid.UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to a contract chat room (REST fallback)."""
    await _get_contract_for_user(db, contract_id, current_user)

    content = body.get("content", "").strip()
    if not content:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Message content cannot be empty")

    msg = Message(
        contract_id=contract_id,
        sender_id=current_user.id,
        content=content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


# ─── WebSocket: Real-time Chat ─────────────────────────────────────────────────
@router.websocket("/ws/{contract_id}")
async def websocket_chat(
    websocket: WebSocket,
    contract_id: str,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket endpoint for real-time chat.
    Client connects via: ws://API_HOST/api/v1/messages/ws/{contract_id}?token=<access_token>
    """
    # Authenticate via query-param token (browsers can't send Auth headers in WS)
    user_id = decode_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    result = await db.execute(select(User).filter(User.id == uuid.UUID(user_id)))
    current_user = result.scalars().first()
    if not current_user:
        await websocket.close(code=4001)
        return

    contract_uuid = uuid.UUID(contract_id)
    result = await db.execute(select(Contract).filter(Contract.id == contract_uuid))
    contract = result.scalars().first()
    if not contract or current_user.id not in (contract.client_id, contract.freelancer_id):
        await websocket.close(code=4003)
        return

    await manager.connect(contract_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            content = payload.get("content", "").strip()
            if not content:
                continue

            # Persist message to DB
            msg = Message(
                contract_id=contract_uuid,
                sender_id=current_user.id,
                content=content,
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            # Broadcast to all connected clients in this room
            outgoing = {
                "id": str(msg.id),
                "contract_id": str(msg.contract_id),
                "sender_id": str(msg.sender_id),
                "sender_email": current_user.email,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat(),
            }
            await manager.broadcast_to_contract(contract_id, outgoing)

    except WebSocketDisconnect:
        manager.disconnect(contract_id, websocket)
