'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, CalendarClock, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { getAdminStats, AdminStats } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  const cards = [
    { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-indigo-500 to-indigo-700', bg: 'bg-indigo-500/10' },
    { label: 'Demandes Crédit', value: stats?.totalCredits ?? 0, icon: CreditCard, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500/10' },
    { label: 'Échéances', value: stats?.totalInstallments ?? 0, icon: CalendarClock, color: 'from-amber-500 to-amber-700', bg: 'bg-amber-500/10' },
    { label: 'KYC en attente', value: stats?.pendingKyc ?? 0, icon: ShieldCheck, color: 'from-rose-500 to-rose-700', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <p className="text-gray-400 mt-1">Vue d&apos;ensemble du système CreadiTN</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#111827] border border-white/5 rounded-2xl p-5 hover:shadow-lg hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Credit Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Statut des crédits
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-400">Approuvés</span>
              </div>
              <span className="text-lg font-bold text-emerald-400">{stats?.approvedCredits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-400">En attente</span>
              </div>
              <span className="text-lg font-bold text-amber-400">{stats?.pendingCredits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-400">Rejetés</span>
              </div>
              <span className="text-lg font-bold text-red-400">{stats?.rejectedCredits ?? 0}</span>
            </div>
          </div>

          {(stats?.totalCredits ?? 0) > 0 && (
            <div className="mt-6">
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${((stats?.approvedCredits ?? 0) / (stats?.totalCredits ?? 1)) * 100}%` }}
                />
                <div
                  className="bg-amber-500 transition-all duration-700"
                  style={{ width: `${((stats?.pendingCredits ?? 0) / (stats?.totalCredits ?? 1)) * 100}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-700"
                  style={{ width: `${((stats?.rejectedCredits ?? 0) / (stats?.totalCredits ?? 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Vérifications KYC
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-400">Vérifiés</span>
              </div>
              <span className="text-lg font-bold text-emerald-400">{stats?.approvedKyc ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-400">En attente</span>
              </div>
              <span className="text-lg font-bold text-amber-400">{stats?.pendingKyc ?? 0}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-300">
              Les vérifications KYC sont traitées automatiquement par l&apos;IA Didit.
              Vous pouvez aussi approuver/rejeter manuellement depuis la page KYC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
