export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function createOrder(payload, mode = 'order') {
  const response = await fetch(`${API}/${mode === 'lead' ? 'api/leads' : 'api/orders'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('No se pudo procesar la solicitud');
  return response.json();
}

export async function getOrderStatus(id) {
  const response = await fetch(`${API}/api/orders/${id}/status`);
  if (!response.ok) return null;
  return response.json();
}
