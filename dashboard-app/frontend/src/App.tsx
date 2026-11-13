import { useEffect, useMemo, useState } from 'react';
import type { Dashboard, Order, RoleKey } from './types';
import { fetchDashboard } from './api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExecutorDashboard } from './pages/ExecutorDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ApplicantDashboard } from './pages/ApplicantDashboard';

const ROLES = ['executor', 'customer', 'applicant'] as const;

function roleFromHash(): RoleKey {
  const key = window.location.hash.replace(/^#\//, '');
  return (ROLES as readonly string[]).includes(key) ? (key as RoleKey) : 'executor';
}

function pickSelectedOrder(data: Dashboard | null, selectedId: number | null): Order | null {
  if (!data || data.orders.length === 0) return null;
  if (selectedId !== null) {
    const found = data.orders.find((o) => o.id === selectedId);
    if (found) return found;
  }
  return data.orders.find((o) => o.isSelected) ?? data.orders[0];
}

export default function App() {
  const [role, setRole] = useState<RoleKey>(roleFromHash);
  const [data, setData] = useState<Dashboard | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setSelectedId(null);
    setError(null);
    fetchDashboard(role)
      .then((dashboard) => {
        if (!cancelled) setData(dashboard);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const selectedOrder = useMemo(() => pickSelectedOrder(data, selectedId), [data, selectedId]);

  const changeRole = (next: RoleKey) => {
    window.location.hash = `#/${next}`;
    setRole(next);
  };

  return (
    <div className="flex h-screen flex-col">
      {data && (
        <Header
          fullName={data.fullName}
          roleSubtitle={data.roleSubtitle}
          initials={data.initials}
          notificationCount={data.notificationCount}
          currentRole={role}
          onRoleChange={changeRole}
        />
      )}

      {error && (
        <div className="m-6 rounded-md border border-warn bg-warn-bg p-4 text-sm text-warn">
          {error}
        </div>
      )}

      {!data && !error && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted">
          Загрузка дашборда…
        </div>
      )}

      {data && selectedOrder && (
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[232px_380px_minmax(0,1fr)]">
          <Sidebar
            roleBadge={data.roleBadge}
            actionLabel={data.actionLabel}
            actionIcon={data.actionIcon}
            navItems={data.navItems}
            wallet={data.wallet}
          />
          {role === 'executor' && (
            <ExecutorDashboard data={data} selectedOrder={selectedOrder} onSelect={setSelectedId} />
          )}
          {role === 'customer' && (
            <CustomerDashboard data={data} selectedOrder={selectedOrder} onSelect={setSelectedId} />
          )}
          {role === 'applicant' && (
            <ApplicantDashboard data={data} selectedOrder={selectedOrder} onSelect={setSelectedId} />
          )}
        </div>
      )}
    </div>
  );
}
