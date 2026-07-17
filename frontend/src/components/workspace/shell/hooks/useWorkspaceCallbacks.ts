// src/components/workspace/shell/hooks/useWorkspaceCallbacks.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '@/app/authSessionSlice';
import { routePaths } from '@/app/routePaths';
import type { AppDispatch } from '@/app/store';
import { api } from '@/shared/api/generated/openapi';
import type { WorkspaceCandidate, WorkspaceRole, WorkspaceView } from '../../model/data';
import { getRequestErrorMessage, todayTimeLabel } from '../workspaceShell.helpers';

type UseWorkspaceCallbacksProps = {
    role: WorkspaceRole;
    activeView: WorkspaceView;
    authMe: any;
    profile: any;
    uiState: any;
    forms: any;
    apiQueries: any;
    notify: any;
    dispatch: AppDispatch;
    navigate: ReturnType<typeof useNavigate>;
    location: any;

    filteredOrders: any[];
    filteredCandidates: any[];
    filteredThreads: any[];
};

export function useWorkspaceCallbacks({
                                          role,
                                          uiState,
                                          apiQueries,
                                          notify,
                                          dispatch,
                                          navigate,
                                          location,
                                      }: UseWorkspaceCallbacksProps) {
    const setBanner = useCallback(
        (banner: { message: string; variant: 'default' | 'success' | 'destructive' }) => {
            notify({ message: banner.message, variant: banner.variant });
        },
        [notify],
    );

    const handleToggleRole = useCallback(async () => {
        const canSwitch = role === 'Applicant' || role === 'Executor';
        if (!canSwitch) return;

        const nextRole: 'Applicant' | 'Executor' = role === 'Applicant' ? 'Executor' : 'Applicant';
        try {
            await apiQueries.switchMyActiveRole({ activeRole: nextRole }).unwrap();
            await apiQueries.refetchProfile();
            setBanner({
                variant: 'success',
                message: `Активная роль изменена на «${nextRole === 'Applicant' ? 'Соискатель' : 'Исполнитель'}».`,
            });
        } catch (error) {
            setBanner({ variant: 'destructive', message: getRequestErrorMessage(error) });
        }
    }, [role, apiQueries, setBanner]);

    const handlePurchaseCandidate = useCallback(
        (candidate: WorkspaceCandidate) => {
            uiState.setPurchasedCandidateIds((prev: string[]) => {
                if (prev.includes(candidate.id)) return prev;
                setBanner({ variant: 'success', message: 'Доступ к комментариям кандидата открыт.' });
                return [...prev, candidate.id];
            });
        },
        [uiState, setBanner],
    );

    const handleRetryAnalytics = useCallback(() => {
        setBanner({ variant: 'success', message: 'Отчет аналитики успешно обновлен.' });
    }, [setBanner]);

    const handleViewChange = useCallback(
        (view: WorkspaceView) => {
            uiState.setActiveView(view);
            uiState.startViewTransition();
        },
        [uiState],
    );

    const handleHeaderCreateAction = useCallback(() => {
        if (role === 'Customer') {
            uiState.setIsCreateOrderPageOpen(true);
        } else if (role === 'Executor') {
            uiState.setIsCreateCandidatePageOpen(true);
        } else if (role === 'Applicant') {
            uiState.setIsCreateApplicantResponsePageOpen(true);
        }
    }, [role, uiState]);

    const handleHeaderMenuAction = useCallback(
        (action: string) => {
            if (action === 'profile') {
                navigate(routePaths.profile);
            } else if (action === 'workspace') {
                if (location.pathname === routePaths.profile) {
                    navigate(routePaths.app, { replace: true });
                }
            } else if (action === 'logout') {
                dispatch(clearAuthSession());
                dispatch(api.util.resetApiState());
                navigate(routePaths.auth, { replace: true });
            }
        },
        [navigate, location, dispatch],
    );

    const handleSendMessage = useCallback(() => {
        if (!uiState.activeThread || !uiState.chatDraft.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: uiState.chatDraft,
            time: todayTimeLabel(),
            author: 'me' as const,
        };

        uiState.setThreadsByRole((prev: any) => ({
            ...prev,
            [role]: prev[role].map((thread: any) =>
                thread.id === uiState.activeThread?.id
                    ? { ...thread, messages: [...thread.messages, newMessage], preview: uiState.chatDraft }
                    : thread,
            ),
        }));
        uiState.setChatDraft('');
        setBanner({ variant: 'default', message: 'Сообщение отправлено.' });
    }, [uiState, role, setBanner]);

    const closeCreateOrderPage = useCallback(() => {
        uiState.setIsCreateOrderPageOpen(false);
        uiState.setActiveView('dashboard');
    }, [uiState]);

    const closeCreateVacancyPage = useCallback(() => {
        uiState.setIsCreateVacancyPageOpen(false);
        uiState.setCreateVacancyOrderId(null);
    }, [uiState]);

    const closeCreateCandidatePage = useCallback(() => {
        uiState.setIsCreateCandidatePageOpen(false);
    }, [uiState]);

    const closeCreateApplicantResponsePage = useCallback(() => {
        uiState.setIsCreateApplicantResponsePageOpen(false);
    }, [uiState]);

    const closeOrderDetails = useCallback(() => {
        uiState.setDetailsInUrl({ orderId: null });
    }, [uiState]);

    const closeCandidateDetails = useCallback(() => {
        uiState.setDetailsInUrl({ candidateId: null });
    }, [uiState]);

    // Вычислять counters на основе filteredOrders, filteredCandidates, filteredThreads
    // const counters = useMemo(() => ({
    //     dashboard: 0,
    //     orders: filteredOrders?.length ?? 0,
    //     candidates: filteredCandidates?.length ?? 0,
    //     meetings: 0,
    //     chats: filteredThreads?.reduce((sum, thread) => sum + (thread.unread ?? 0), 0) ?? 0,
    // }), [filteredOrders, filteredCandidates, filteredThreads]);

    return {
        setBanner,
        handleToggleRole,
        handlePurchaseCandidate,
        handleRetryAnalytics,
        handleViewChange,
        handleHeaderCreateAction,
        handleHeaderMenuAction,
        handleSendMessage,
        closeCreateOrderPage,
        closeCreateVacancyPage,
        closeCreateCandidatePage,
        closeCreateApplicantResponsePage,
        closeOrderDetails,
        closeCandidateDetails,
        // Эти будут добавлены позже
        handleOpenCandidateDetails: () => {},
        handleOpenOrderDetails: () => {},
        handleRespondToOrder: () => {},
        handleRespondToSelectedVacancy: () => {},
        handleSetApplicantResponderStage: () => {},
        handleCreateOrderFromPage: () => {},
        handleCreateCandidateFromPage: () => {},
        handleCreateApplicantResponseFromPage: () => {},
        handleCreateVacancyFromPage: () => {},
        handleCreateVacancyAndSendToCustomerFromPage: () => {},
        handleCreateVacancyFromOrder: () => {},
        handlePublishVacancyForSelectedOrder: () => {},
        handleActivateOrders: () => {},
        handleArchiveOrders: () => {},
        handlePauseOrders: () => {},
        handleRejectOrderExecutor: () => {},
        handleSelectOrderExecutor: () => {},
    };
}
