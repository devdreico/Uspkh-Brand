import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Footer, Header, Noise } from '../components/Layout';
import { createOrder, getOrderStatus } from '../lib/api';
import { extras, plans } from '../data/content';
import { formatCOP } from './Home';

function parseSearch(search) {
  if (typeof search !== 'string') return new URLSearchParams();
  return new URLSearchParams(search);
}

export function FormPage({ search = '' }) {
  const params = parseSearch(search);
  const mode = params.get('mode') === 'asesoria';
  const initial = params.get('plan') || 'basico';
  const [step, setStep] = useState(1);
  const [state, setState] = useState('idle');
  const idempotencyRef = useRef(null);
  if (idempotencyRef.current === null) {
    idempotencyRef.current = globalThis.crypto?.randomUUID?.() || `uspkh-${Date.now()}`;
  }
  const [form, setForm] = useState({
    plan_id: initial,
    name: '',
    company: '',
    email: '',
    phone: '',
    city: '',
    category: '',
    website: '',
    social: '',
    objective: '',
    audience: '',
    product: '',
    budget_cop: '',
    contact: 'WhatsApp',
    consent: false,
  });

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
  const selected = [...plans, ...extras].find((item) => item.id === form.plan_id) || plans[0];

  const submit = async (event) => {
    event.preventDefault();
    setState('loading');
    try {
      const payload = {
        plan_id: form.plan_id,
        customer: { name: form.name, company: form.company, email: form.email, phone: form.phone, city: form.city },
        campaign: {
          category: form.category,
          website: form.website || null,
          social: form.social,
          objective: form.objective,
          audience: form.audience,
          product: form.product,
          budget_cop: Number(form.budget_cop || 0),
        },
        consents: { privacy: form.consent, terms: form.consent, marketing: false },
        policy_version: '2026-01',
        contact: form.contact,
        idempotency_key: idempotencyRef.current,
      };
      const data = await createOrder(payload, mode ? 'lead' : 'order');
      if (mode) location.href = `/solicitud-recibida?id=${data.id}`;
      else if (data.checkout_url) location.href = data.checkout_url;
      else location.href = `/pago/pendiente?order=${data.id}&demo=1`;
    } catch {
      setState('error');
    }
  };

  const next = (event) => {
    event.preventDefault();
    setStep((value) => Math.min(4, value + 1));
  };

  return (
    <div className="app inner-page form-page">
      <Noise />
      <Header />
      <section className="form-shell">
        <div className="form-intro">
          <p className="section-label">{mode ? 'DIAGNÓSTICO SIN COSTO' : 'ACTIVA TU CAMPAÑA'}</p>
          <h1>
            {mode ? (
              <>
                Hablemos de
                <br />
                <em>tu negocio.</em>
              </>
            ) : (
              <>
                Vamos a ponerle
                <br />
                <em>movimiento.</em>
              </>
            )}
          </h1>
          <p>
            {mode
              ? 'Cuéntanos dónde está tu negocio y qué quieres lograr. Un estratega de Uspkh te responde en menos de 24 horas con una recomendación. Todavía no se realizará ningún cobro.'
              : 'Completa estos datos para preparar tu estrategia de contenido y pauta, revisar el resumen y pagar de forma segura.'}
          </p>
          {!mode && (
            <div className="form-aside">
              <span>Tu selección</span>
              <strong>{selected.name}</strong>
              <b>
                {formatCOP(selected.price)} <small>/ 30 días · pauta aparte</small>
              </b>
            </div>
          )}
        </div>
        <form onSubmit={step < 4 ? next : submit} className="lead-form">
          <div className="form-progress">
            <span className="active">0{step}</span>
            <i />
            <span>04</span>
          </div>

          {step === 1 && (
            <>
              <h2>Elige cómo empezar.</h2>
              <label>
                Servicio
                <select name="plan_id" value={form.plan_id} onChange={update}>
                  {mode && <option value="asesoria">Diagnóstico estratégico sin costo</option>}
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {formatCOP(plan.price)}
                    </option>
                  ))}
                  {extras.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatCOP(item.price)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="form-hint">
                La inversión en pauta publicitaria se acuerda y paga aparte, directamente en tu cuenta de Meta.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Conozcamos tu negocio.</h2>
              <div className="form-row">
                <label>
                  Tu nombre
                  <input required name="name" value={form.name} onChange={update} placeholder="Cómo te llamamos" />
                </label>
                <label>
                  Empresa o marca
                  <input required name="company" value={form.company} onChange={update} placeholder="Nombre del proyecto" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Correo
                  <input required type="email" name="email" value={form.email} onChange={update} placeholder="hola@marca.com" />
                </label>
                <label>
                  WhatsApp
                  <input required name="phone" value={form.phone} onChange={update} placeholder="+57 300..." />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Ciudad
                  <input name="city" value={form.city} onChange={update} placeholder="Bogotá, Medellín..." />
                </label>
                <label>
                  Categoría
                  <input name="category" value={form.category} onChange={update} placeholder="Restaurante, salud..." />
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Definamos la campaña.</h2>
              <label>
                ¿Qué quieres lograr?
                <textarea
                  required
                  name="objective"
                  value={form.objective}
                  onChange={update}
                  placeholder="Ej: conseguir más clientes para mi consultorio..."
                />
              </label>
              <div className="form-row">
                <label>
                  Público ideal
                  <input name="audience" value={form.audience} onChange={update} placeholder="¿A quién quieres llegar?" />
                </label>
                <label>
                  Producto o servicio
                  <input name="product" value={form.product} onChange={update} placeholder="¿Qué quieres vender?" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Red social + usuario
                  <input name="social" value={form.social} onChange={update} placeholder="Instagram @tu_marca" />
                </label>
                <label>
                  Presupuesto de pauta COP
                  <input name="budget_cop" inputMode="numeric" value={form.budget_cop} onChange={update} placeholder="800000" />
                </label>
              </div>
              <label>
                Sitio web
                <input name="website" value={form.website} onChange={update} placeholder="https://tumarca.com" />
              </label>
            </>
          )}

          {step === 4 && (
            <>
              <h2>Revisa antes de continuar.</h2>
              <div className="review-card">
                <p>
                  <span>Servicio</span>
                  <b>{mode ? 'Diagnóstico estratégico' : selected.name}</b>
                </p>
                <p>
                  <span>Inversión</span>
                  <b>{mode ? 'Sin costo' : `${formatCOP(selected.price)} / 30 días`}</b>
                </p>
                <p>
                  <span>Tu negocio</span>
                  <b>{form.company || '—'}</b>
                </p>
                <p>
                  <span>Objetivo</span>
                  <b>{form.objective || '—'}</b>
                </p>
                <p>
                  <span>Después</span>
                  <b>{mode ? 'Te contactamos en menos de 24 horas' : 'Validamos tu solicitud antes de iniciar'}</b>
                </p>
              </div>
              <label className="consent">
                <input required type="checkbox" name="consent" checked={form.consent} onChange={update} /> Acepto la política de
                privacidad y los términos de servicio.
              </label>
            </>
          )}

          {step > 1 && (
            <button type="button" className="back-step" onClick={() => setStep((value) => value - 1)}>
              <ArrowLeft size={16} /> Volver
            </button>
          )}
          <button className="button button-dark form-submit" disabled={state === 'loading'}>
            {step < 4 ? (
              'Continuar'
            ) : state === 'loading' ? (
              'Enviando...'
            ) : mode ? (
              <>
                Solicitar diagnóstico <ArrowUpRight size={18} />
              </>
            ) : (
              <>
                Continuar al pago <ArrowUpRight size={18} />
              </>
            )}
          </button>
          {state === 'error' && (
            <p className="form-error">
              No pudimos enviar la solicitud. Verifica tu conexión e inténtalo de nuevo o escríbenos a inbox@uspkhbrand.co.
            </p>
          )}
        </form>
      </section>
      <Footer />
    </div>
  );
}

export function Result({ kind = 'approved', search = '' }) {
  const params = parseSearch(search);
  const id = params.get('order');
  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (!id || loaded) return undefined;
    setLoaded(true);
    getOrderStatus(id)
      .then(setSummary)
      .catch(() => {});
    return undefined;
  }, [id, loaded]);

  const data = {
    approved: {
      label: 'PAGO CONFIRMADO',
      title: (
        <>
          Tu crecimiento
          <br />
          <em>empieza hoy.</em>
        </>
      ),
      text: 'Recibimos tu pago y tu solicitud. Te contactaremos dentro de las próximas 24 horas para validar objetivos, calendario y arrancar la operación de contenido y pauta.',
    },
    pending: {
      label: 'PAGO EN VERIFICACIÓN',
      title: (
        <>
          Estamos
          <br />
          <em>verificando.</em>
        </>
      ),
      text: 'El procesador de pagos aún no confirma el estado. No mostraremos la orden como aprobada hasta verificarla; te avisaremos por correo.',
    },
    rejected: {
      label: 'PAGO NO COMPLETADO',
      title: (
        <>
          No se realizó
          <br />
          <em>ningún cobro.</em>
        </>
      ),
      text: 'Puedes volver al formulario y revisar los datos o intentarlo de nuevo. Si el error persiste, escríbenos a inbox@uspkhbrand.co.',
    },
  }[kind];

  return (
    <div className="app inner-page result-page">
      <Noise />
      <Header />
      <section className={`result-card ${kind}`}>
        <div className="result-icon">{kind === 'approved' ? <Check /> : <span>!</span>}</div>
        <p className="section-label">{data.label}</p>
        <h1>{data.title}</h1>
        <p>{data.text}</p>
        {summary && (
          <div className="summary">
            <span>RESUMEN</span>
            <p>
              <b>{summary.customer?.customer?.name || summary.customer?.name}</b>
              <br />
              {summary.customer?.customer?.company || summary.customer?.company}
              <br />
              Plan: {summary.plan_name}
              <br />
              Referencia: {summary.reference}
            </p>
          </div>
        )}
        <a href={kind === 'rejected' ? '/formulario' : '/'} className="button button-dark">
          {kind === 'rejected' ? 'Volver al formulario' : 'Volver al inicio'} <ArrowLeft size={18} />
        </a>
      </section>
      <Footer />
    </div>
  );
}

export function RequestReceived() {
  return (
    <div className="app inner-page result-page">
      <Noise />
      <Header />
      <section className="result-card approved">
        <div className="result-icon">
          <Check />
        </div>
        <p className="section-label">SOLICITUD RECIBIDA</p>
        <h1>
          Hablemos de
          <br />
          <em>tu negocio.</em>
        </h1>
        <p>
          Recibimos tus datos. Un estratega de Uspkh te contactará dentro de las próximas 24 horas. Todavía no se realizó
          ningún cobro.
        </p>
        <a href="/" className="button button-dark">
          Volver al inicio <ArrowLeft size={18} />
        </a>
      </section>
      <Footer />
    </div>
  );
}
