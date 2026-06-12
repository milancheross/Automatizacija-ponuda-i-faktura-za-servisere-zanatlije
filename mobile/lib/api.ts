import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'auth_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  company_name: string;
  phone?: string;
  address?: string;
  pib?: string;
  logo_url?: string;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface PriceItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  category: 'rad' | 'materijal' | 'ostalo';
  created_at: string;
}

export type QuoteStatus = 'nacrt' | 'poslata' | 'prihvacena' | 'odbijena';

export interface QuoteItem {
  id?: number;
  price_item_id?: number;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: number;
  client_id: number;
  client?: Client;
  status: QuoteStatus;
  items: QuoteItem[];
  discount_percent: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  valid_until?: string;
  note?: string;
  sent_at?: string;
  opened_at?: string;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'neplaceno' | 'placeno';

export interface Invoice {
  id: number;
  invoice_number: string;
  quote_id: number;
  quote?: Quote;
  client_id: number;
  client?: Client;
  status: InvoiceStatus;
  items: QuoteItem[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
  issued_at: string;
  due_at?: string;
  paid_at?: string;
  note?: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  company_name: string;
  phone?: string;
  address?: string;
  pib?: string;
}

export interface UpdateProfileData {
  company_name?: string;
  phone?: string;
  address?: string;
  pib?: string;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreatePriceItemData {
  name: string;
  unit: string;
  price: number;
  category: 'rad' | 'materijal' | 'ostalo';
}

export interface CreateQuoteData {
  client_id: number;
  items: Omit<QuoteItem, 'id' | 'total'>[];
  discount_percent?: number;
  valid_until?: string;
  note?: string;
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await clearToken();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  data: RegisterData,
): Promise<{ token: string; user: User }> {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProfile(): Promise<User> {
  return apiFetch('/api/auth/profile');
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  return apiFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  return apiFetch('/api/clients');
}

export async function createClient(data: CreateClientData): Promise<Client> {
  return apiFetch('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(
  id: number,
  data: Partial<CreateClientData>,
): Promise<Client> {
  return apiFetch(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: number): Promise<void> {
  return apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
}

// ─── Price items ──────────────────────────────────────────────────────────────

export async function getPriceItems(): Promise<PriceItem[]> {
  return apiFetch('/api/price-items');
}

export async function createPriceItem(
  data: CreatePriceItemData,
): Promise<PriceItem> {
  return apiFetch('/api/price-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePriceItem(
  id: number,
  data: Partial<CreatePriceItemData>,
): Promise<PriceItem> {
  return apiFetch(`/api/price-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePriceItem(id: number): Promise<void> {
  return apiFetch(`/api/price-items/${id}`, { method: 'DELETE' });
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function getQuotes(): Promise<Quote[]> {
  return apiFetch('/api/quotes');
}

export async function getQuote(id: number): Promise<Quote> {
  return apiFetch(`/api/quotes/${id}`);
}

export async function createQuote(data: CreateQuoteData): Promise<Quote> {
  return apiFetch('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuote(
  id: number,
  data: Partial<CreateQuoteData>,
): Promise<Quote> {
  return apiFetch(`/api/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function sendQuote(id: number): Promise<Quote> {
  return apiFetch(`/api/quotes/${id}/send`, { method: 'POST' });
}

export async function convertToInvoice(id: number): Promise<Invoice> {
  return apiFetch(`/api/quotes/${id}/convert`, { method: 'POST' });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch('/api/invoices');
}

export async function getInvoice(id: number): Promise<Invoice> {
  return apiFetch(`/api/invoices/${id}`);
}

export async function markPaid(id: number): Promise<Invoice> {
  return apiFetch(`/api/invoices/${id}/pay`, { method: 'POST' });
}
