// src/components/workspace/shell/hooks/useWorkspaceEffects.ts
import { useEffect } from 'react';

type UseWorkspaceEffectsProps = {
    authMe: any;
    uiState: any;
    forms: any;
    apiQueries: any;
};

const sidebarCollapsedStorageKey = 'workspace-sidebar-collapsed-v1';

export function useWorkspaceEffects({ authMe, uiState, forms, apiQueries }: UseWorkspaceEffectsProps) {
    const transitionTimeoutRef = uiState.transitionTimeoutRef;
    // Сохранение состояния сайдбара
    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(sidebarCollapsedStorageKey, uiState.isSidebarCollapsed ? '1' : '0');
    }, [uiState.isSidebarCollapsed]);

    // Сохранение черновика вакансии
    useEffect(() => {
        const userId = authMe?.userId;
        const orderId = uiState.createVacancyOrderId;
        if (!userId || !orderId) return;

        const hasMeaningfulDraft =
            forms.createVacancyFormValues.title.trim().length > 0 ||
            forms.createVacancyFormValues.description.trim().length > 0;

        if (!hasMeaningfulDraft) {
            // clearVacancyCreateDraft(userId, orderId)
            return;
        }
        // saveVacancyCreateDraft(userId, orderId, forms.createVacancyFormValues)
    }, [authMe?.userId, forms.createVacancyFormValues, uiState.createVacancyOrderId]);

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (transitionTimeoutRef?.current) {
                window.clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, [transitionTimeoutRef]);
}
