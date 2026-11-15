import { useState } from 'react'
import { ApplicantResponseCreatePagePanel } from '../panels/ApplicantResponseCreatePagePanel'
import { CalendarPanel } from '../panels/CalendarPanel'
import { CandidateCreatePagePanel } from '../panels/CandidateCreatePagePanel'
import { CandidateDetailsPagePanel } from '../panels/CandidateDetailsPagePanel'
import { MainFeedPanel } from '../panels/MainFeedPanel'
import { OrderCreatePagePanel } from '../panels/OrderCreatePagePanel'
import { OrderDetailsPagePanel } from '../panels/OrderDetailsPagePanel'
import { presetCandidateStageFilter } from '../panels/hooks/useMainFeedPanelController'
import { PipelinePanel } from '../panels/PipelinePanel'
import { StatsGrid } from '../panels/StatsGrid'
import { VacancyCreatePagePanel } from '../panels/VacancyCreatePagePanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ProfilePage } from '@/pages/ProfilePage'
import { Header } from './Header'
import { useWorkspaceShellController } from './hooks/useWorkspaceShellController'
import { Sidebar } from './Sidebar'
import { createActionLabel, createHeaderTitle } from './workspaceShell.helpers'

type WorkspaceShellViewProps = ReturnType<typeof useWorkspaceShellController>

export function WorkspaceShellView({
  activeThread,
  activeView,
  analyticsError,
  applicantDashboardStats,
  applicantDashboardVacancies,
  authMe,
  applicantRespondedOrderIds,
  canLoadExecutorBaseCandidates,
  canManageOrder,
  canManageOrderResponses,
  canSwitchApplicantExecutor,
  canCreateCandidateFromSelectedOrder,
  canManageCandidatesFromSelectedOrder,
  canCreateVacancyFromSelectedOrder,
  canPublishVacancyForSelectedOrder,
  hasCreateVacancyDraftForSelectedOrder,
  canRespondToSelectedOrder,
  candidateSourceOrderId,
  candidateSourceVacancyId,
  candidateViewOrders,
  candidateViewSelectedOrderId,
  closeCandidateDetails,
  closeCreateApplicantResponsePage,
  closeCreateCandidatePage,
  closeCreateOrderPage,
  closeCreateVacancyPage,
  closeOrderDetails,
  counters,
  createApplicantResponseFormValues,
  createCandidateFormValues,
  createOrderFormValues,
  orderSpecializationOptions,
  isOrderSpecializationsLoading,
  createVacancyFormValues,
  executorBaseCandidates,
  executorDashboardCandidates,
  executorMyCandidates,
  filteredBaseCandidates,
  filteredCandidates,
  filteredOrders,
  filteredThreads,
  handleActivateOrders,
  handleArchiveOrders,
  handleCreateApplicantResponseFormFieldChange,
  handleCreateApplicantResponseFromPage,
  handleCreateCandidateFormFieldChange,
  handleCreateCandidateFromPage,
  handleCreateCandidateFromOrder,
  handleAddCandidateFromOrder,
  handleRemoveCandidateFromOrder,
  handleSubmitCandidateListFromOrder,
  handleCreateOrderFormFieldChange,
  handleCreateOrderFromPage,
  handleCreateVacancyAndSendToCustomerFromPage,
  handleCreateVacancyFormFieldChange,
  handleCreateVacancyFromPage,
  handleCreateVacancyFromOrder,
  handlePublishVacancyForSelectedOrder,
  handleHeaderCreateAction,
  handleHeaderMenuAction,
  handleRetryCustomerDashboardStats,
  handleRetryApplicantDashboardStats,
  handleOpenCandidateDetails,
  handleOpenOrderDetails,
  handlePauseOrders,
  handleRetryOrders,
  handleRetryVacancyCandidates,
  handleRetryCustomerShortlist,
  handleRetryExecutorDashboardStats,
  handleRetryExecutorCandidates,
  handleRejectOrderExecutor,
  handleRespondToOrder,
  handleRespondToSelectedVacancy,
  handleSetApplicantResponderStage,
  handleSelectVacancyCandidate,
  handleRetryAnalytics,
  handleSelectOrderExecutor,
  handleSendMessage,
  handleToggleRole,
  handleViewChange,
  hasRespondedToSelectedOrder,
  isCandidatesApiLoading,
  isCreatingOrder,
  isCreatingVacancy,
  isPublishingVacancyForCustomer,
  isSendingVacancyToCustomer,
  isDeletingOrder,
  isOrderResponsesFetching,
  isOrderStatusUpdating,
  isOrdersApiLoading,
  isOrdersError,
  isCustomerDashboardStatsError,
  isCustomerDashboardStatsLoading,
  isCustomerShortlistError,
  isCustomerShortlistLoading,
  isExecutorCandidateSummaryError,
  isExecutorCandidateSummaryLoading,
  isExecutorDashboardStatsError,
  isExecutorDashboardStatsLoading,
  isApplicantDashboardStatsError,
  isApplicantDashboardStatsLoading,
  isRejectingOrderExecutor,
  isRespondingToOrder,
  isUpdatingApplicantResponderStage,
  isAddingCandidateFromBase,
  isRemovingVacancyCandidate,
  isSubmittingCandidateList,
  isVacancyCandidatesError,
  isVacancyCandidatesFetching,
  isSelectingOrderExecutor,
  isSelectingVacancyCandidate,
  canSelectFinalist,
  hasSelectedFinalist,
  isSwitchingRole,
  isSidebarCollapsed,
  isViewLoading,
  orderResponses,
  profileDisplayName,
  profileEmail,
  profileRoleLabel,
  role,
  runtimeStats,
  searchValue,
  linkedCreateVacancyOrder,
  selectedCandidate,
  selectedOrder,
  selectedOrderExecutorName,
  selectedOrderId,
  selectedOrderApplicantResponders,
  selectedOrderCandidateIds,
  selectedOrderCandidates,
  selectedOrderVacancyPreview,
  selectedOrderWithResponses,
  setPreferredChatId,
  setPreferredOrderId,
  setSearchValue,
  toggleSidebar,
  workspaceScreen,
}: WorkspaceShellViewProps) {
  // Мобильный drawer навигации (<=900px) — отдельное локальное состояние, не нужно персистить.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const sidebarRoleProps =
    role === 'Executor'
      ? {
          role,
          executorReward: {
            stat: runtimeStats.find((stat) => stat.id === 'balance') ?? null,
            isLoading: isExecutorDashboardStatsLoading,
            isError: isExecutorDashboardStatsError,
            onRetry: handleRetryExecutorDashboardStats,
          },
        }
      : { role }

  let workspaceTitle = createHeaderTitle(role)
  if (workspaceScreen === 'profile') {
    workspaceTitle = 'Мой профиль'
  } else if (workspaceScreen === 'create-candidate') {
    workspaceTitle = 'Добавить кандидата'
  }

  function closeMobileNav() {
    setIsMobileNavOpen(false)
  }

  function handleSidebarCreateAction() {
    closeMobileNav()
    handleHeaderCreateAction()
  }

  function handleMobileNavViewChange(view: Parameters<typeof handleViewChange>[0]) {
    handleViewChange(view)
    closeMobileNav()
  }

  function handleStatOverview(statId: string) {
    presetCandidateStageFilter(statId === 'shortlist' ? 'shortlist' : 'all')
    handleViewChange('candidates')
  }

  // Один renderer выбирает единственный полноэкранный surface.
  return (
    <div className="preview11-html">
      <div className="preview11-app flex min-h-screen flex-col">
        <Header
          activeView={activeView}
          meetingsCount={counters.meetings ?? 0}
          notificationsCount={counters.chats ?? 0}
          onOpenMeetings={() => handleViewChange('meetings')}
          onOpenNotifications={() => handleViewChange('chats')}
          onMenuAction={handleHeaderMenuAction}
          onSearchChange={setSearchValue}
          onToggleMobileNav={() => setIsMobileNavOpen((open) => !open)}
          profileDisplayName={profileDisplayName}
          profileEmail={profileEmail}
          profileRoleLabel={profileRoleLabel}
          canSwitchRole={canSwitchApplicantExecutor}
          isSwitchingRole={isSwitchingRole}
          onSwitchRole={() => void handleToggleRole()}
          searchValue={searchValue}
        />

        <div className="flex min-h-0 flex-1">
          <Sidebar
            activeView={activeView}
            collapsed={isSidebarCollapsed}
            counters={counters}
            createLabel={workspaceScreen === 'feed' ? createActionLabel(role) : null}
            mobileOpen={isMobileNavOpen}
            onCloseMobile={closeMobileNav}
            onCreateAction={handleSidebarCreateAction}
            onToggleCollapse={toggleSidebar}
            onViewChange={handleMobileNavViewChange}
            roleLabel={profileRoleLabel}
            {...sidebarRoleProps}
          />

          <div className="preview11-main">

          <main className="preview11-content flex-1 space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold leading-tight text-foreground">
                {workspaceTitle}
              </h1>
              {workspaceScreen === 'profile' ? (
                <p className="text-sm text-muted-foreground">Личные данные и настройки роли</p>
              ) : null}
            </div>
            {workspaceScreen === 'order-details' && selectedOrder ? (
              <OrderDetailsPagePanel
                key={`${selectedOrder.id}:${selectedOrder.executorId ?? 'none'}`}
                assignedExecutorName={selectedOrderExecutorName}
                projectCandidates={selectedOrderCandidates}
                isCustomerViewer={role === 'Customer'}
                isProjectCandidatesLoading={isVacancyCandidatesFetching}
                isProjectCandidatesError={isVacancyCandidatesError}
                onRetryProjectCandidates={handleRetryVacancyCandidates}
                canCreateVacancyFromOrder={canCreateVacancyFromSelectedOrder}
                canCreateCandidateFromOrder={canCreateCandidateFromSelectedOrder}
                canManageCandidatesFromOrder={canManageCandidatesFromSelectedOrder}
                canPublishVacancyForCustomer={canPublishVacancyForSelectedOrder}
                hasCreateVacancyDraft={hasCreateVacancyDraftForSelectedOrder}
                canManageOrderResponses={canManageOrderResponses}
                isOrderResponsesLoading={isOrderResponsesFetching}
                isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
                isRejectingOrderExecutor={isRejectingOrderExecutor}
                isSelectingOrderExecutor={isSelectingOrderExecutor}
                onBack={closeOrderDetails}
                onOpenChat={() => handleViewChange('chats')}
                onCreateVacancyFromOrder={() => handleCreateVacancyFromOrder(selectedOrder.id)}
                onCreateCandidateFromOrder={() => handleCreateCandidateFromOrder(selectedOrder.id)}
                onRemoveCandidateFromVacancy={(candidateId) =>
                  handleRemoveCandidateFromOrder(selectedOrder.id, candidateId)
                }
                isSubmittingCandidateList={isSubmittingCandidateList}
                onSubmitCandidateList={() => handleSubmitCandidateListFromOrder(selectedOrder.id)}
                onPublishVacancyForCustomer={handlePublishVacancyForSelectedOrder}
                onRespondToOrder={() => {
                  if (role === 'Applicant') {
                    void handleRespondToSelectedVacancy(selectedOrder.id)
                    return
                  }
                  void handleRespondToOrder(selectedOrder.id)
                }}
                onOpenApplicantResponder={handleOpenCandidateDetails}
                onMoveApplicantResponderToShortlist={(candidateId) =>
                  handleSetApplicantResponderStage(selectedOrder.id, candidateId, 'Shortlist')
                }
                onRejectApplicantResponder={(candidateId) =>
                  handleSetApplicantResponderStage(selectedOrder.id, candidateId, 'Pool')
                }
                onRejectOrderExecutor={(executorId) =>
                  handleRejectOrderExecutor(selectedOrder.id, executorId)
                }
                onSelectOrderExecutor={(executorId) =>
                  handleSelectOrderExecutor(selectedOrder.id, executorId)
                }
                isUpdatingApplicantResponderStage={isUpdatingApplicantResponderStage}
                isRemovingVacancyCandidate={isRemovingVacancyCandidate}
                isExecutorViewer={role === 'Executor'}
                isApplicantViewer={role === 'Applicant'}
                order={selectedOrderWithResponses ?? selectedOrder}
                orderResponses={orderResponses}
                applicantResponders={selectedOrderApplicantResponders}
                vacancyPreview={selectedOrderVacancyPreview}
              />
            ) : null}

            {workspaceScreen === 'candidate-details' && selectedCandidate ? (
              <CandidateDetailsPagePanel
                candidate={selectedCandidate}
                onBack={closeCandidateDetails}
              />
            ) : null}

            {workspaceScreen === 'create-candidate' ? (
              <CandidateCreatePagePanel
                applicantResponders={selectedOrderApplicantResponders}
                assignedCandidateIds={selectedOrderCandidateIds}
                availableCandidates={executorMyCandidates}
                canAddToProject={
                  role === 'Executor' &&
                  Boolean(candidateSourceVacancyId) &&
                  canManageCandidatesFromSelectedOrder
                }
                formValues={createCandidateFormValues}
                isAddingCandidateFromBase={isAddingCandidateFromBase}
                orderTitle={selectedOrder?.title}
                onAddCandidateFromBase={
                  candidateSourceOrderId
                    ? (candidateId) => handleAddCandidateFromOrder(candidateSourceOrderId, candidateId)
                    : undefined
                }
                specializationOptions={orderSpecializationOptions}
                onBack={closeCreateCandidatePage}
                onFieldChange={handleCreateCandidateFormFieldChange}
                onSubmit={handleCreateCandidateFromPage}
                vacancyTitle={selectedOrderVacancyPreview?.title}
              />
            ) : null}

            {workspaceScreen === 'create-applicant-response' ? (
              <ApplicantResponseCreatePagePanel
                formValues={createApplicantResponseFormValues}
                onBack={closeCreateApplicantResponsePage}
                onFieldChange={handleCreateApplicantResponseFormFieldChange}
                onSubmit={handleCreateApplicantResponseFromPage}
              />
            ) : null}

            {workspaceScreen === 'create-order' ? (
              <OrderCreatePagePanel
                formValues={createOrderFormValues}
                specializationOptions={orderSpecializationOptions}
                isSpecializationsLoading={isOrderSpecializationsLoading}
                isCreatingOrder={isCreatingOrder}
                onBack={closeCreateOrderPage}
                onFieldChange={handleCreateOrderFormFieldChange}
                onSubmit={handleCreateOrderFromPage}
              />
            ) : null}
            {workspaceScreen === 'create-vacancy' && linkedCreateVacancyOrder ? (
              <VacancyCreatePagePanel
                formValues={createVacancyFormValues}
                isCreatingVacancy={isCreatingVacancy}
                isSendingVacancyToCustomer={isSendingVacancyToCustomer}
                linkedOrder={{
                  id: linkedCreateVacancyOrder.id,
                  title: linkedCreateVacancyOrder.title,
                }}
                onBack={closeCreateVacancyPage}
                onFieldChange={handleCreateVacancyFormFieldChange}
                hasDraftIndicator={hasCreateVacancyDraftForSelectedOrder}
                onSubmitDraft={handleCreateVacancyFromPage}
                onSendToCustomer={handleCreateVacancyAndSendToCustomerFromPage}
              />
            ) : null}

            {workspaceScreen === 'profile' ? (
              <ProfilePage />
            ) : workspaceScreen === 'feed' ? (
              <>
                {(activeView === 'dashboard' ||
                  activeView === 'orders' ||
                  activeView === 'candidates') && (
                  <>
                    {activeView === 'dashboard' ? (
                      role === 'Customer' ? (
                        <>
                          {isCustomerDashboardStatsLoading && runtimeStats.length === 0 ? (
                            <div className="preview11-card">
                              <div className="preview11-loading" role="status">
                                <span aria-hidden="true" className="preview11-loading-spin" />
                                <span>Загружаем показатели...</span>
                              </div>
                            </div>
                          ) : null}
                          {isCustomerDashboardStatsError ? (
                            <div className="preview11-error-card" role="alert">
                              <h3>Не удалось загрузить показатели</h3>
                              <p>Повторите запрос, чтобы обновить баланс и статистику.</p>
                              <button
                                className="preview11-btn preview11-btn-primary"
                                onClick={handleRetryCustomerDashboardStats}
                                type="button"
                              >
                                Повторить
                              </button>
                            </div>
                          ) : null}
                          {runtimeStats.length > 0 ? (
                            <StatsGrid stats={runtimeStats} onOverview={handleStatOverview} />
                          ) : !isCustomerDashboardStatsLoading && !isCustomerDashboardStatsError ? (
                            <div className="preview11-empty-state" role="status">
                              <p>Показатели пока недоступны.</p>
                            </div>
                          ) : null}
                        </>
                      ) : role === 'Executor' ? null : role === 'Applicant' ? (
                        <>
                          {isApplicantDashboardStatsLoading && runtimeStats.length === 0 ? (
                            <div className="preview11-card">
                              <div className="preview11-loading" role="status">
                                <span aria-hidden="true" className="preview11-loading-spin" />
                                <span>Загружаем данные резюме и откликов...</span>
                              </div>
                            </div>
                          ) : null}
                          {isApplicantDashboardStatsError ? (
                            <div className="preview11-error-card" role="alert">
                              <h3>Не удалось загрузить показатели</h3>
                              <p>Повторите запрос, чтобы обновить данные резюме и откликов.</p>
                              <button
                                className="preview11-btn preview11-btn-primary"
                                onClick={handleRetryApplicantDashboardStats}
                                type="button"
                              >
                                Повторить
                              </button>
                            </div>
                          ) : null}
                          {runtimeStats.length > 0 ? (
                            <StatsGrid stats={runtimeStats} />
                          ) : !isApplicantDashboardStatsLoading && !isApplicantDashboardStatsError ? (
                            <div className="preview11-empty-state" role="status">
                              <p>Показатели резюме и откликов пока недоступны.</p>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <StatsGrid
                          stats={runtimeStats}
                          onOverview={role === 'Applicant' ? undefined : handleStatOverview}
                        />
                      )
                    ) : null}
                    <MainFeedPanel
                      key={activeView}
                      baseCandidates={
                        role === 'Executor' ? executorBaseCandidates : filteredBaseCandidates
                      }
                      applicantRespondedOrderIds={applicantRespondedOrderIds}
                      applicantDashboardApplications={applicantDashboardStats?.applications ?? []}
                      applicantDashboardVacancies={applicantDashboardVacancies}
                      unclassifiedCandidateLinksCount={
                        applicantDashboardStats?.unclassifiedCandidateLinksCount ?? 0
                      }
                      isApplicantDashboardStatsError={isApplicantDashboardStatsError}
                      isApplicantDashboardStatsLoading={isApplicantDashboardStatsLoading}
                      onRetryApplicantDashboardStats={handleRetryApplicantDashboardStats}
                      canManageOrderResponses={canManageOrderResponses}
                      canSelectFinalist={canSelectFinalist}
                      canPublishVacancyForCustomer={canPublishVacancyForSelectedOrder}
                      canManageOrders={canManageOrder}
                      canRespondToOrder={canRespondToSelectedOrder}
                      canViewBaseCandidates={canLoadExecutorBaseCandidates}
                      candidates={role === 'Executor' ? executorMyCandidates : filteredCandidates}
                      executorDashboardCandidates={executorDashboardCandidates}
                      hasRespondedToOrder={hasRespondedToSelectedOrder}
                      isLoading={
                        isViewLoading ||
                        (activeView === 'dashboard' && (role === 'Customer' || role === 'Executor') && isOrdersApiLoading) ||
                        (activeView === 'orders' && isOrdersApiLoading) ||
                        (activeView === 'candidates' && isCandidatesApiLoading)
                      }
                      isCandidateDataLoading={
                        role === 'Customer'
                          ? isCustomerShortlistLoading
                          : role === 'Executor'
                            ? isExecutorCandidateSummaryLoading
                            : isCandidatesApiLoading
                      }
                      isCandidateDataError={
                        role === 'Customer'
                          ? isCustomerShortlistError
                          : role === 'Executor' && isExecutorCandidateSummaryError
                      }
                      isOrdersError={(role === 'Customer' || role === 'Executor') && isOrdersError}
                      isOrderResponsesLoading={isOrderResponsesFetching}
                      isOrdersArchiving={isDeletingOrder}
                      isOrdersStateUpdating={isOrderStatusUpdating}
                      isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
                      isRejectingOrderExecutor={isRejectingOrderExecutor}
                      isRespondingToOrder={isRespondingToOrder}
                      isSelectingOrderExecutor={isSelectingOrderExecutor}
                      isSelectingVacancyCandidate={isSelectingVacancyCandidate}
                      hasSelectedFinalist={hasSelectedFinalist}
                      onActivateOrders={handleActivateOrders}
                      onArchiveOrders={handleArchiveOrders}
                      onCreateVacancyFromOrder={handleCreateVacancyFromOrder}
                      onOpenChat={() => handleViewChange('chats')}
                      onCloseOrderDetails={closeOrderDetails}
                      onOpenCandidate={handleOpenCandidateDetails}
                      onOpenOrder={handleOpenOrderDetails}
                      onRetryCandidateData={
                        role === 'Customer'
                          ? handleRetryCustomerShortlist
                          : role === 'Executor'
                            ? handleRetryExecutorCandidates
                            : handleRetryVacancyCandidates
                      }
                      onRetryOrders={handleRetryOrders}
                      onPauseOrders={handlePauseOrders}
                      onPublishVacancyForCustomer={handlePublishVacancyForSelectedOrder}
                      onMoveApplicantResponderToShortlist={(orderId, candidateId) =>
                        handleSetApplicantResponderStage(orderId, candidateId, 'Shortlist')
                      }
                      onRejectApplicantResponder={(orderId, candidateId) =>
                        handleSetApplicantResponderStage(orderId, candidateId, 'Pool')
                      }
                      onRejectOrderExecutor={handleRejectOrderExecutor}
                      onSelectVacancyCandidate={handleSelectVacancyCandidate}
                      onRespondToOrder={(orderId) => {
                        if (role === 'Applicant') {
                          return handleRespondToSelectedVacancy(orderId)
                        }
                        return handleRespondToOrder(orderId)
                      }}
                      onSelectOrder={setPreferredOrderId}
                      onSelectOrderExecutor={handleSelectOrderExecutor}
                      orderResponses={orderResponses}
                      orders={activeView === 'candidates' ? candidateViewOrders : filteredOrders}
                      requesterUserId={authMe?.userId}
                      role={role}
                      selectedOrderDetails={selectedOrderWithResponses ?? selectedOrder}
                      selectedOrderApplicantResponders={selectedOrderApplicantResponders}
                      selectedOrderExecutorName={selectedOrderExecutorName}
                      selectedOrderId={
                        activeView === 'candidates' ? candidateViewSelectedOrderId : selectedOrderId
                      }
                      selectedOrderVacancyPreview={selectedOrderVacancyPreview}
                      isUpdatingApplicantResponderStage={isUpdatingApplicantResponderStage}
                      isUpdatingCandidateStage={isUpdatingApplicantResponderStage}
                      onSetCandidateStage={handleSetApplicantResponderStage}
                      view={activeView === 'dashboard' ? 'dashboard' : activeView}
                    />
                  </>
                )}

                {activeView === 'meetings' ? <CalendarPanel meetings={null} /> : null}

                {activeView === 'chats' ? (
                  <Card className="rounded-xl border-border p-4 shadow-none">
                    <h3 className="text-base font-semibold text-foreground">Чаты</h3>

                    {isViewLoading ? (
                      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-blue-600"
                        />
                          Открываем раздел...
                      </div>
                    ) : filteredThreads.length === 0 ? (
                      <div className="mt-4 rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground" role="status">
                        Чаты пока не подключены. История и отправка сообщений недоступны.
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-3 lg:grid-cols-[320px_1fr]">
                        <div className="space-y-2">
                          {filteredThreads.map((thread) => (
                            <button
                              key={thread.id}
                              className={cn(
                                'w-full rounded-xl border p-3 text-left transition-colors',
                                activeThread?.id === thread.id
                                  ? 'border-primary/30 bg-primary/10'
                                  : 'border-border bg-card hover:bg-muted',
                              )}
                              onClick={() => setPreferredChatId(thread.id)}
                              type="button"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                  {thread.participant}
                                </p>
                                {thread.unread > 0 ? (
                                  <Badge variant="default">{thread.unread}</Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{thread.preview}</p>
                            </button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-border bg-card">
                          <p className="border-b border-border px-4 py-3 text-sm text-muted-foreground" role="status">
                            Отправка сообщений недоступна: чат не подключён.
                          </p>
                          <div className="border-b border-border px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">
                              {activeThread?.participant}
                            </p>
                          </div>
                          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
                            {activeThread?.messages.map((message) => (
                              <article
                                key={message.id}
                                className={cn(
                                  'max-w-[78%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                                  message.author === 'me'
                                    ? 'ml-auto bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground',
                                )}
                              >
                                <p>{message.text}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{message.time}</p>
                              </article>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                            <Input
                              className="h-10 rounded-xl border-border text-foreground"
                              aria-label="Сообщение"
                              disabled
                              placeholder="Чат не подключён"
                              value=""
                            />
                            <Button
                              className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={handleSendMessage}
                              disabled
                              type="button"
                            >
                              Отправить
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ) : null}

                {activeView === 'analytics' ? (
                  <PipelinePanel
                    errorMessage={analyticsError}
                    onRetry={handleRetryAnalytics}
                    pipeline={[]}
                    title={role === 'Applicant' ? 'Статистика поиска работы' : 'Воронка подбора'}
                  />
                ) : null}

                {activeView === 'documents' ? (
                  <Card className="rounded-xl border-border p-4 shadow-none">
                    <h3 className="text-base font-semibold text-foreground">Документооборот</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Управление документами и контрактами по заказам.
                    </p>
                    <div className="mt-4 rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
                      Документы будут отображаться здесь.
                    </div>
                  </Card>
                ) : null}
              </>
            ) : null}
          </main>
        </div>
      </div>
      </div>
    </div>
  )
}
