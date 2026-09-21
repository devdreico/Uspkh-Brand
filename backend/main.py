import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, HttpUrl, model_validator
from sqlalchemy import JSON, Boolean, DateTime, Integer, String, UniqueConstraint, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./uspkh.db')
engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {})


class Base(DeclarativeBase):
    pass


class Order(Base):
    __tablename__ = 'orders'
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    reference: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(40), index=True)
    plan_name: Mapped[str] = mapped_column(String(120))
    amount: Mapped[int] = mapped_column(Integer)
    customer: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(32), default='created', index=True)
    payment_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    provider_order_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    notified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PaymentEvent(Base):
    __tablename__ = 'payment_events'
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    provider_event_id: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    provider: Mapped[str] = mapped_column(String(40), default='mercadopago')
    order_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class StatusHistory(Base):
    __tablename__ = 'status_history'
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    order_id: Mapped[str] = mapped_column(String(36), index=True)
    status: Mapped[str] = mapped_column(String(32))
    source: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CampaignBalance(Base):
    __tablename__ = 'campaign_balances'
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    order_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    approved_amount: Mapped[int] = mapped_column(Integer, default=0)
    allocated_amount: Mapped[int] = mapped_column(Integer, default=0)
    spent_amount: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default='COP')


class BalanceTransaction(Base):
    __tablename__ = 'balance_transactions'
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    balance_id: Mapped[str] = mapped_column(String(36), index=True)
    kind: Mapped[str] = mapped_column(String(24))
    amount: Mapped[int] = mapped_column(Integer)
    reference: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(engine)

app = FastAPI(title='Uspkh Brand API', version='3.0')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','), allow_methods=['GET', 'POST'], allow_headers=['*'])

CATALOG = {'basico': ('Fundamento', 600000), 'intermedio': ('Tracción', 990000), 'avanzado': ('Dominio', 1300000), 'vectorizacion': ('Vectorización', 30000), 'branding': ('Re-branding', 250000)}
FORMSPREE_ENDPOINT = os.getenv('FORMSPREE_ENDPOINT', 'https://formspree.io/f/xdekoevv')


class CustomerIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    company: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    city: str = Field(default='', max_length=100)


class CampaignIn(BaseModel):
    category: str = Field(default='', max_length=120)
    website: Optional[HttpUrl] = None
    social: str = Field(default='', max_length=160)
    objective: str = Field(default='', max_length=2000)
    audience: str = Field(default='', max_length=1000)
    product: str = Field(default='', max_length=500)
    budget_cop: int = Field(default=0, ge=0, le=500000000)


class ConsentIn(BaseModel):
    privacy: bool
    terms: bool
    marketing: bool = False


class OrderIn(BaseModel):
    plan_id: str
    customer: CustomerIn
    campaign: CampaignIn = CampaignIn()
    consents: ConsentIn
    policy_version: str = Field(min_length=3, max_length=30)
    contact: str = 'WhatsApp'
    idempotency_key: Optional[str] = Field(default=None, max_length=120)

    @model_validator(mode='after')
    def validate_consent(self):
        if not self.consents.privacy or not self.consents.terms:
            raise ValueError('Se requiere aceptar privacidad y términos')
        return self


class LeadIn(OrderIn):
    pass


def now():
    return datetime.now(timezone.utc)


def serialize(order: Order, balance: Optional[CampaignBalance] = None):
    data: dict[str, Any] = {'id': order.id, 'reference': order.reference, 'plan': order.plan, 'plan_name': order.plan_name, 'amount': order.amount, 'customer': order.customer, 'status': order.status, 'payment_id': order.payment_id, 'provider_order_id': order.provider_order_id, 'notified': order.notified}
    if balance:
        data['balance'] = {'approved_amount': balance.approved_amount, 'allocated_amount': balance.allocated_amount, 'spent_amount': balance.spent_amount, 'operational_balance': balance.approved_amount - balance.allocated_amount - balance.spent_amount, 'currency': balance.currency}
    return data


def save_status(db: Session, order: Order, status: str, source: str):
    order.status = status
    db.add(StatusHistory(id=str(uuid.uuid4()), order_id=order.id, status=status, source=source))


def mp_headers(token: str, idempotency_key: Optional[str] = None):
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    if idempotency_key:
        headers['X-Idempotency-Key'] = idempotency_key
    return headers


def validate_webhook_signature(raw_body: bytes, signature: Optional[str], request_id: Optional[str], secret: str) -> bool:
    if not secret:
        return os.getenv('APP_ENV', 'development') != 'production'
    if not signature or not request_id:
        return False
    parts = dict(item.split('=', 1) for item in signature.split(',') if '=' in item)
    ts, v1 = parts.get('ts'), parts.get('v1')
    try:
        body = json.loads(raw_body or b'{}')
        data_id = str(body.get('data', {}).get('id', ''))
        manifest = f'id:{data_id};request-id:{request_id};ts:{ts};'
        expected = hmac.new(secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()
        return bool(v1 and hmac.compare_digest(expected, v1))
    except (ValueError, TypeError):
        return False


async def fetch_provider_order(provider_id: str, token: str):
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f'https://api.mercadopago.com/v1/orders/{provider_id}', headers=mp_headers(token))
    if response.status_code >= 400:
        return None
    return response.json()


def status_from_provider(payload: dict):
    payments = payload.get('transactions', {}).get('payments', [])
    payment = payments[0] if payments else {}
    return payment.get('status') or payload.get('status') or 'pending', str(payment.get('id')) if payment.get('id') else None


async def notify_order(order_id: str):
    with Session(engine) as db:
        order = db.get(Order, order_id)
        if not order:
            raise HTTPException(404, 'Orden no encontrada')
        if order.status != 'approved':
            raise HTTPException(409, 'Pago no aprobado')
        if order.notified:
            return {'notified': True}
        customer = order.customer.get('customer', order.customer)
        message = f"Nueva compra Uspkh Brand\nCliente: {customer['name']}\nEmpresa: {customer['company']}\nCorreo: {customer['email']}\nPlan: {order.plan_name}\nTotal: ${order.amount:,} COP\nReferencia: {order.reference}\nDatos: {json.dumps(customer, ensure_ascii=False)}"
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(FORMSPREE_ENDPOINT, data={'email': customer['email'], 'message': message, '_subject': f'Compra confirmada {order.reference}'})
        if response.status_code >= 400:
            raise HTTPException(502, 'No se pudo notificar la compra')
        order.notified = True
        db.commit()
    return {'notified': True}


@app.get('/api/health')
def health():
    return {'ok': True, 'provider': 'mercadopago-orders', 'database': 'connected'}


@app.post('/api/orders')
async def create_order(data: OrderIn):
    if data.plan_id not in CATALOG:
        raise HTTPException(400, 'Servicio no válido')
    name, amount = CATALOG[data.plan_id]
    idempotency_key = data.idempotency_key or str(uuid.uuid4())
    order_id = str(uuid.uuid4()); reference = f'USPKH-{now():%Y%m%d%H%M%S}-{order_id[:8].upper()}'
    customer = {'customer': data.customer.model_dump(mode='json'), 'campaign': data.campaign.model_dump(mode='json'), 'consents': data.consents.model_dump(), 'policy_version': data.policy_version, 'contact': data.contact}
    with Session(engine) as db:
        existing = db.scalar(select(Order).where(Order.idempotency_key == idempotency_key))
        if existing:
            return {'id': existing.id, 'reference': existing.reference, 'checkout_url': None, 'status': existing.status, 'duplicate': True}
        order = Order(id=order_id, reference=reference, plan=data.plan_id, plan_name=name, amount=amount, customer=customer, status='created', idempotency_key=idempotency_key)
        db.add(order); db.add(StatusHistory(id=str(uuid.uuid4()), order_id=order_id, status='created', source='api')); db.commit()
    token = os.getenv('MP_ACCESS_TOKEN', '')
    if not token or token.startswith('TEST-your'):
        return {'id': order_id, 'reference': reference, 'checkout_url': None, 'status': 'pending', 'demo': True}
    base = os.getenv('PUBLIC_APP_URL', 'http://localhost:5173'); api = os.getenv('PUBLIC_API_URL', 'http://localhost:8000')
    payload = {'type': 'online', 'processing_mode': 'automatic', 'total_amount': f'{amount:.2f}', 'external_reference': reference, 'payer': {'email': str(data.customer.email), 'name': data.customer.name}, 'transactions': {'payments': [{'amount': f'{amount:.2f}'}]}, 'config': {'online': {'success_url': f'{base}/pago/exito?order={order_id}', 'failure_url': f'{base}/pago/error?order={order_id}', 'pending_url': f'{base}/pago/pendiente?order={order_id}', 'auto_return': 'approved'}}, 'notification_url': f'{api}/api/payments/mercadopago/webhook'}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post('https://api.mercadopago.com/v1/orders', headers=mp_headers(token, idempotency_key), json=payload)
    if response.status_code >= 400:
        raise HTTPException(502, 'No se pudo crear el checkout')
    provider = response.json(); provider_id = str(provider.get('id', '')); checkout_url = provider.get('checkout_url') or provider.get('config', {}).get('online', {}).get('checkout_url')
    with Session(engine) as db:
        order = db.get(Order, order_id); order.provider_order_id = provider_id; save_status(db, order, 'checkout_created', 'mercadopago'); db.commit()
    return {'id': order_id, 'reference': reference, 'provider_order_id': provider_id, 'checkout_url': checkout_url}


@app.post('/api/leads')
async def create_lead(data: LeadIn):
    lead_id = str(uuid.uuid4()); reference = f'USPKH-LEAD-{lead_id[:8].upper()}'
    customer = {'customer': data.customer.model_dump(mode='json'), 'campaign': data.campaign.model_dump(mode='json'), 'consents': data.consents.model_dump(), 'policy_version': data.policy_version, 'contact': data.contact}
    order = Order(id=lead_id, reference=reference, plan='asesoria', plan_name='Diagnóstico estratégico', amount=0, customer=customer, status='lead', idempotency_key=data.idempotency_key or str(uuid.uuid4()))
    with Session(engine) as db: db.add(order); db.add(StatusHistory(id=str(uuid.uuid4()), order_id=lead_id, status='lead', source='api')); db.commit()
    message = f"Nueva solicitud de diagnóstico Uspkh Brand\nCliente: {data.customer.name}\nEmpresa: {data.customer.company}\nCorreo: {data.customer.email}\nDatos: {json.dumps(customer, ensure_ascii=False)}"
    async with httpx.AsyncClient(timeout=20) as client: await client.post(FORMSPREE_ENDPOINT, data={'email': str(data.customer.email), 'message': message, '_subject': f'Nuevo lead {reference}'})
    return {'id': lead_id, 'reference': reference, 'status': 'lead'}


@app.get('/api/orders/{order_id}/status')
def status(order_id: str):
    with Session(engine) as db:
        order = db.get(Order, order_id); balance = db.scalar(select(CampaignBalance).where(CampaignBalance.order_id == order_id))
        if not order: raise HTTPException(404, 'Orden no encontrada')
        return serialize(order, balance)


@app.post('/api/payments/mercadopago/webhook')
async def webhook(request: Request, x_signature: Optional[str] = Header(default=None), x_request_id: Optional[str] = Header(default=None)):
    raw = await request.body(); secret = os.getenv('MP_WEBHOOK_SECRET', '')
    if not validate_webhook_signature(raw, x_signature, x_request_id, secret):
        raise HTTPException(401, 'Firma de webhook inválida')
    body = json.loads(raw or b'{}'); provider_id = str(body.get('data', {}).get('id') or body.get('id') or '')
    if not provider_id: return {'received': True, 'ignored': True}
    event_id = f"{body.get('type', 'event')}:{provider_id}:{body.get('action', '')}"
    token = os.getenv('MP_ACCESS_TOKEN', '')
    if not token or token.startswith('TEST-your'): return {'received': True, 'demo': True}
    provider = await fetch_provider_order(provider_id, token)
    if not provider: return {'received': True, 'retryable': True}
    provider_status, payment_id = status_from_provider(provider); reference = provider.get('external_reference')
    notify_id = None
    with Session(engine) as db:
        if db.scalar(select(PaymentEvent).where(PaymentEvent.provider_event_id == event_id)):
            return {'received': True, 'duplicate': True}
        order = db.scalar(select(Order).where(Order.reference == reference))
        event = PaymentEvent(id=str(uuid.uuid4()), provider_event_id=event_id, order_id=order.id if order else None, payload=body)
        db.add(event)
        if order:
            save_status(db, order, provider_status, 'mercadopago_webhook'); order.payment_id = payment_id or order.payment_id; order.provider_order_id = provider_id
            if provider_status == 'approved':
                balance = db.scalar(select(CampaignBalance).where(CampaignBalance.order_id == order.id))
                if not balance:
                    balance = CampaignBalance(id=str(uuid.uuid4()), order_id=order.id, approved_amount=order.amount); db.add(balance); db.add(BalanceTransaction(id=str(uuid.uuid4()), balance_id=balance.id, kind='credit', amount=order.amount, reference=f'{order.reference}:credit'))
                notify_id = order.id
        db.commit()
    if notify_id:
        try: await notify_order(notify_id)
        except HTTPException: pass
    return {'received': True}


@app.post('/api/orders/{order_id}/notify')
async def notify(order_id: str):
    return await notify_order(order_id)


@app.get('/api/campaign-balances/{order_id}')
def campaign_balance(order_id: str):
    with Session(engine) as db:
        balance = db.scalar(select(CampaignBalance).where(CampaignBalance.order_id == order_id))
        order = db.get(Order, order_id)
        if not order: raise HTTPException(404, 'Orden no encontrada')
        if not balance: return {'order_id': order_id, 'status': order.status, 'balance': None}
        return {'order_id': order_id, 'balance': serialize(order, balance)['balance']}


@app.post('/api/campaign-balances/{order_id}/allocations')
def allocate_campaign_budget(order_id: str, amount: int = Query(gt=0), x_admin_key: Optional[str] = Header(default=None)):
    admin_key = os.getenv('ADMIN_API_KEY', '')
    if not admin_key or not x_admin_key or not hmac.compare_digest(admin_key, x_admin_key):
        raise HTTPException(403, 'Operación administrativa no autorizada')
    with Session(engine) as db:
        balance = db.scalar(select(CampaignBalance).where(CampaignBalance.order_id == order_id))
        if not balance: raise HTTPException(404, 'Saldo de campaña no encontrado')
        if balance.allocated_amount + amount > balance.approved_amount: raise HTTPException(409, 'La asignación supera el saldo aprobado')
        balance.allocated_amount += amount; db.add(BalanceTransaction(id=str(uuid.uuid4()), balance_id=balance.id, kind='allocation', amount=amount, reference=f'{order_id}:allocation:{uuid.uuid4()}')); db.commit()
        return {'order_id': order_id, 'allocated_amount': balance.allocated_amount, 'operational_balance': balance.approved_amount - balance.allocated_amount - balance.spent_amount}
