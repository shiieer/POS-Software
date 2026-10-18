from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.config import settings
from app.core.qr import (
    build_menu_url,
    generate_qr_data_uri,
    generate_qr_png,
    generator_qr_token,
)
from app.core.storage import delete_file
from app.dependencies import AdminUser, DbSession
from app.models.order import Order
from app.models.table import Table
from app.schemas.table import TableCreate, TableOut, TablePublic

router = APIRouter(prefix="/tables", tags=["Tables"])


@router.get("/verify", response_model=TablePublic)
def verify_table(table_id: int, token: str, db: DbSession):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.qr_token == token,
            Table.is_active.is_(True),
        )
        .first()
    )
    if not table:
        raise HTTPException(status_code=404, detail="Table not found or QR code is invalid")
    return table


def _serialize_table(table: Table, request_origin: str | None = None) -> TableOut:
    menu_url = build_menu_url(table.id, table.qr_token, request_origin)
    return TableOut(
        id=table.id,
        name=table.name,
        qr_token=table.qr_token,
        is_active=table.is_active,
        created_at=table.created_at,
        qr_url=menu_url,
        qr_image_url=generate_qr_data_uri(menu_url),
    )


def _get_table_or_404(table_id: int, db: Session) -> Table:
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table


@router.get("", response_model=list[TableOut])
def list_tables(request: Request, _: AdminUser, db: DbSession):
    tables = db.query(Table).order_by(Table.id).all()
    origin = request.headers.get("origin")
    return [_serialize_table(table, request_origin=origin) for table in tables]


@router.post("", response_model=TableOut, status_code=201)
def create_table(payload: TableCreate, request: Request, _: AdminUser, db: DbSession):
    existing = db.query(Table).filter(Table.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table name already exists")

    table = Table(name=payload.name, qr_token=generator_qr_token())
    db.add(table)
    db.commit()
    db.refresh(table)

    return _serialize_table(table, request_origin=request.headers.get("origin"))


@router.get("/{table_id}/qr")
def get_table_qr(table_id: int, request: Request, _: AdminUser, db: DbSession):
    table = _get_table_or_404(table_id, db)
    menu_url = build_menu_url(table.id, table.qr_token, request.headers.get("origin"))
    return Response(content=generate_qr_png(menu_url), media_type="image/png")


@router.delete("/{table_id}", status_code=204)
def delete_table(table_id: int, _: AdminUser, db: DbSession):
    table = _get_table_or_404(table_id, db)

    try:
        delete_file(
            bucket=settings.SUPABASE_QR_BUCKET,
            path=f"table_{table_id}.png",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not delete this table's QR image from Supabase Storage",
        ) from exc

    # Keep order history, but remove its reference to the deleted table.
    db.query(Order).filter(Order.table_id == table_id).update(
        {Order.table_id: None}, synchronize_session=False
    )
    db.delete(table)
    db.commit()


@router.patch("/{table_id}/active", response_model=TableOut)
def set_table_active(table_id: int, is_active: bool, request: Request, _: AdminUser, db: DbSession):
    table = _get_table_or_404(table_id, db)

    table.is_active = is_active
    db.commit()
    db.refresh(table)
    return _serialize_table(table, request_origin=request.headers.get("origin"))


