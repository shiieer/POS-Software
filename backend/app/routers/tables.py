from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from app.core.qr import (
    build_menu_url,
    generator_qr_token,
    get_qr_public_url,
    save_qr_image,
)
from app.dependencies import AdminUser, DbSession
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


def _serialize_table(table: Table, qr_image_url: str | None = None) -> TableOut:
    return TableOut(
        id=table.id,
        name=table.name,
        qr_token=table.qr_token,
        is_active=table.is_active,
        created_at=table.created_at,
        qr_url=build_menu_url(table.id, table.qr_token),
        qr_image_url=qr_image_url,
    )


@router.get("", response_model=list[TableOut])
def list_tables(_: AdminUser, db: DbSession):
    tables = db.query(Table).order_by(Table.id).all()
    return [_serialize_table(t, qr_image_url=get_qr_public_url(t.id)) for t in tables]


@router.post("", response_model=TableOut, status_code=201)
def create_table(payload: TableCreate, _: AdminUser, db: DbSession):
    existing = db.query(Table).filter(Table.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table name already exists")

    table = Table(name=payload.name, qr_token=generator_qr_token())
    db.add(table)
    db.commit()
    db.refresh(table)

    menu_url = build_menu_url(table.id, table.qr_token)
    qr_image_url = save_qr_image(menu_url, f"table_{table.id}.png")

    return _serialize_table(table, qr_image_url=qr_image_url)


@router.get("/{table_id}/qr")
def get_table_qr(table_id: int, _: AdminUser):
    return RedirectResponse(url=get_qr_public_url(table_id), status_code=302)
