// src/components/workspace/shell/hooks/useWorkspaceUIState.ts (дополненный)
import { useState, useRef } from 'react';
import type { WorkspaceView } from '../../model/data';

type OrderFilter = 'all' | 'active' | 'paused';

const sidebarCollapsedStorageKey = 'workspace-sidebar-collapsed-v1';

function readInitialSidebarCollapsedState(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(sidebarCollapsedStorageKey) === '1';
    } catch {
        return false;
    }
}

export function useWorkspaceUIState() {
    const [searchValue, setSearchValue] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readInitialSidebarCollapsedState);
    const [orderFilter] = useState<OrderFilter>('all');
    const [isViewLoading, setIsViewLoading] = useState(false);
    const [isCreateOrderPageOpen, setIsCreateOrderPageOpen] = useState(false);
    const [isCreateVacancyPageOpen, setIsCreateVacancyPageOpen] = useState(false);
    const [isCreateCandidatePageOpen, setIsCreateCandidatePageOpen] = useState(false);
    const [isCreateApplicantResponsePageOpen, setIsCreateApplicantResponsePageOpen] = useState(false);
    const [preferredOrderId, setPreferredOrderId] = useState<string | null>(null);
    const [preferredChatId, setPreferredChatId] = useState<string | null>(null);
    const [chatDraft, setChatDraft] = useState('');
    const [createVacancyOrderId, setCreateVacancyOrderId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<WorkspaceView>('dashboard');
    const [purchasedCandidateIds, setPurchasedCandidateIds] = useState<string[]>([]);
    const [threadsByRole, setThreadsByRole] = useState<any>({});
    const [manualCandidatesByRole, setManualCandidatesByRole] = useState<any>({});
    const [executorGlobalCandidates, setExecutorGlobalCandidates] = useState<any[]>([]);
    const [executorGlobalBaseCandidates, setExecutorGlobalBaseCandidates] = useState<any[]>([]);
    const [counters, setCounters] = useState<Partial<Record<WorkspaceView, number>>>({});


    const transitionTimeoutRef = useRef<number | null>(null);

    const startViewTransition = () => {
        if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
        setIsViewLoading(true);
        transitionTimeoutRef.current = window.setTimeout(() => {
            setIsViewLoading(false);
            transitionTimeoutRef.current = null;
        }, 280);
    };

    const setDetailsInUrl = (params: { orderId?: string | null; candidateId?: string | null }, replace?: boolean) => {
        // реализация
    };

    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    return {
        searchValue, setSearchValue,
        isSidebarCollapsed, toggleSidebar,
        orderFilter,
        isViewLoading, setIsViewLoading,
        startViewTransition,
        transitionTimeoutRef,
        isCreateOrderPageOpen, setIsCreateOrderPageOpen,
        isCreateVacancyPageOpen, setIsCreateVacancyPageOpen,
        isCreateCandidatePageOpen, setIsCreateCandidatePageOpen,
        isCreateApplicantResponsePageOpen, setIsCreateApplicantResponsePageOpen,
        preferredOrderId, setPreferredOrderId,
        preferredChatId, setPreferredChatId,
        chatDraft, setChatDraft,
        createVacancyOrderId, setCreateVacancyOrderId,
        activeView, setActiveView,
        purchasedCandidateIds, setPurchasedCandidateIds,
        threadsByRole, setThreadsByRole,
        manualCandidatesByRole, setManualCandidatesByRole,
        executorGlobalCandidates, setExecutorGlobalCandidates,
        executorGlobalBaseCandidates, setExecutorGlobalBaseCandidates,
        setDetailsInUrl,
        counters, setCounters,
    };
}