/**
 * Admin API client — all calls proxy through Next.js /api/backend/**
 * which forwards to the Spring Boot backend at http://localhost:8082
 */

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8082';

export const BACKEND = BACKEND_BASE;

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Admin endpoints ──────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalCredits: number;
  totalInstallments: number;
  pendingKyc: number;
  approvedKyc: number;
  pendingCredits: number;
  approvedCredits: number;
  rejectedCredits: number;
}

export const getAdminStats = () => fetchBackend<AdminStats>('/api/admin/stats');

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: string;
  createdAt: string;
}

export const getAdminUsers = () => fetchBackend<AdminUser[]>('/api/admin/users');

export interface AdminCredit {
  id: number;
  userId: number;
  productName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const getAdminCredits = () => fetchBackend<AdminCredit[]>('/api/admin/credits');

export interface AdminInstallment {
  id: number;
  creditRequestId: number;
  userId: number;
  dueDate: string;
  amount: number;
  status: string;
  paidDate?: string;
}

export const getAdminInstallments = () => fetchBackend<AdminInstallment[]>('/api/admin/installments');

export interface AdminKycDocument {
  id: number;
  userId: number;
  cinNumber: string;
  status: string;
  adminComment?: string;
  createdAt: string;
}

export const getAdminKycDocuments = () => fetchBackend<AdminKycDocument[]>('/api/admin/kyc');

export const approveKyc = (documentId: number) =>
  fetchBackend<AdminKycDocument>(`/api/admin/kyc/${documentId}/approve`, { method: 'POST' });

export const rejectKyc = (documentId: number, comment: string) =>
  fetchBackend<AdminKycDocument>(`/api/admin/kyc/${documentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });

export const approveCredit = (creditId: number) =>
  fetchBackend<AdminCredit>(`/api/admin/credits/${creditId}/approve`, { method: 'POST' });

export const rejectCredit = (creditId: number) =>
  fetchBackend<AdminCredit>(`/api/admin/credits/${creditId}/reject`, { method: 'POST' });
