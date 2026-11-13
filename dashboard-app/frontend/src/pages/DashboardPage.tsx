import type { Dashboard, Order } from '../types';
import { OrderList } from '../components/OrderList';
import { DetailPane } from '../components/DetailPane';
import type { TableKind } from '../components/DetailPane';

export interface DashboardPageProps {
  data: Dashboard;
  selectedOrder: Order;
  onSelect: (id: number) => void;
}

interface DashboardPageInternalProps extends DashboardPageProps {
  tableKind: TableKind;
}

export function DashboardPage({ data, selectedOrder, onSelect, tableKind }: DashboardPageInternalProps) {
  return (
    <>
      <OrderList
        listTitle={data.listTitle}
        sortOptions={data.sortOptions}
        filterChips={data.filterChips}
        orders={data.orders}
        role={data.roleKey}
        selectedId={selectedOrder.id}
        onSelect={onSelect}
      />
      <DetailPane order={selectedOrder} tableKind={tableKind} />
    </>
  );
}
