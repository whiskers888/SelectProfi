import { ApplicantResponseCreatePagePanel } from '../panels/ApplicantResponseCreatePagePanel'
import { CalendarPanel } from '../panels/CalendarPanel'
import { CandidateCreatePagePanel } from '../panels/CandidateCreatePagePanel'
import { CandidateDetailsPagePanel } from '../panels/CandidateDetailsPagePanel'
import { MainFeedPanel } from '../panels/MainFeedPanel'
import { OrderCreatePagePanel } from '../panels/OrderCreatePagePanel'
import { OrderDetailsPagePanel } from '../panels/OrderDetailsPagePanel'
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
  authMe,
  applicantRespondedOrderIds,
  canLoadExecutorBaseCandidates,
  canManageOrder,
  canManageOrderResponses,
  canSwitchApplicantExecutor,
  canCreateVacancyFromSelectedOrder,
  canPublishVacancyForSelectedOrder,
  hasCreateVacancyDraftForSelectedOrder,
  canRespondToSelectedOrder,
  candidateViewOrders,
  candidateViewSelectedOrderId,
  chatDraft,
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
  handleCreateOrderFormFieldChange,
  handleCreateOrderFromPage,
  handleCreateVacancyAndSendToCustomerFromPage,
  handleCreateVacancyFormFieldChange,
  handleCreateVacancyFromPage,
  handleCreateVacancyFromOrder,
  handlePublishVacancyForSelectedOrder,
  handleHeaderCreateAction,
  handleHeaderMenuAction,
  handleOpenCandidateDetails,
  handleOpenOrderDetails,
  handlePauseOrders,
  handlePurchaseCandidate,
  handleRejectOrderExecutor,
  handleRespondToOrder,
  handleRespondToSelectedVacancy,
  handleSetApplicantResponderStage,
  handleRetryAnalytics,
  handleSelectOrderExecutor,
  handleSendMessage,
  handleToggleRole,
  handleViewChange,
  hasRespondedToSelectedOrder,
  isCandidatesApiLoading,
  isCreateApplicantResponsePageOpen,
  isCreateCandidatePageOpen,
  isCreateOrderPageOpen,
  isCreateVacancyPageOpen,
  isCreatingOrder,
  isCreatingVacancy,
  isPublishingVacancyForCustomer,
  isSendingVacancyToCustomer,
  isDeletingOrder,
  isDetailsPageOpen,
  isOrderResponsesFetching,
  isOrderStatusUpdating,
  isOrdersApiLoading,
  isProfileRoute,
  isRejectingOrderExecutor,
  isRespondingToOrder,
  isUpdatingApplicantResponderStage,
  isSelectedCandidatePurchased,
  isSelectingOrderExecutor,
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
  selectedOrderVacancyPreview,
  selectedOrderWithResponses,
  setChatDraft,
  setPreferredChatId,
  setPreferredOrderId,
  setSearchValue,
  toggleSidebar,
}: WorkspaceShellViewProps) {
  return (
    <div className="preview11-html">
      <div className="preview11-app">
        <Sidebar
          activeView={activeView}
          collapsed={isSidebarCollapsed}
          counters={counters}
          onToggleCollapse={toggleSidebar}
          onViewChange={handleViewChange}
          role={role}
        />

        <div className="preview11-main">
          <Header
            activeView={activeView}
            createLabel={createActionLabel(role)}
            meetingsCount={0}
            notificationsCount={counters.chats ?? 0}
            onCreateAction={handleHeaderCreateAction}
            onOpenMeetings={() => handleViewChange('meetings')}
            onOpenNotifications={() => handleViewChange('chats')}
            onMenuAction={handleHeaderMenuAction}
            onSearchChange={setSearchValue}
            profileDisplayName={profileDisplayName}
            profileEmail={profileEmail}
            profileRoleLabel={profileRoleLabel}
            canSwitchRole={canSwitchApplicantExecutor}
            isSwitchingRole={isSwitchingRole}
            onSwitchRole={() => void handleToggleRole()}
            role={role}
            searchValue={searchValue}
            subtitle={isProfileRoute ? 'Личные данные и настройки роли' : ''}
            title={isProfileRoute ? 'Мой профиль' : createHeaderTitle(role)}
          />

          <main className="preview11-content flex-1 space-y-4">
            {selectedOrder && activeView !== 'orders' && !isCreateVacancyPageOpen ? (
              <OrderDetailsPagePanel
                key={`${selectedOrder.id}:${selectedOrder.executorId ?? 'none'}`}
                assignedExecutorName={selectedOrderExecutorName}
                canCreateVacancyFromOrder={canCreateVacancyFromSelectedOrder}
                canPublishVacancyForCustomer={canPublishVacancyForSelectedOrder}
                hasCreateVacancyDraft={hasCreateVacancyDraftForSelectedOrder}
                canManageOrderResponses={canManageOrderResponses}
                isOrderResponsesLoading={isOrderResponsesFetching}
                isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
                isRejectingOrderExecutor={isRejectingOrderExecutor}
                isSelectingOrderExecutor={isSelectingOrderExecutor}
                onBack={closeOrderDetails}
                onCreateVacancyFromOrder={() => handleCreateVacancyFromOrder(selectedOrder.id)}
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
                order={selectedOrderWithResponses ?? selectedOrder}
                orderResponses={orderResponses}
                applicantResponders={selectedOrderApplicantResponders}
                vacancyPreview={selectedOrderVacancyPreview}
              />
            ) : null}

            {selectedCandidate ? (
              <CandidateDetailsPagePanel
                candidate={selectedCandidate}
                canPurchase={selectedCandidate.isOwnedByRequester !== true}
                isPurchased={isSelectedCandidatePurchased}
                onBack={closeCandidateDetails}
                onPurchase={() => handlePurchaseCandidate(selectedCandidate)}
              />
            ) : null}

            {role === 'Executor' && isCreateCandidatePageOpen ? (
              <CandidateCreatePagePanel
                formValues={createCandidateFormValues}
                onBack={closeCreateCandidatePage}
                onFieldChange={handleCreateCandidateFormFieldChange}
                onSubmit={handleCreateCandidateFromPage}
              />
            ) : null}

            {role === 'Applicant' && isCreateApplicantResponsePageOpen ? (
              <ApplicantResponseCreatePagePanel
                formValues={createApplicantResponseFormValues}
                onBack={closeCreateApplicantResponsePage}
                onFieldChange={handleCreateApplicantResponseFormFieldChange}
                onSubmit={handleCreateApplicantResponseFromPage}
              />
            ) : null}

            {role === 'Customer' && isCreateOrderPageOpen ? (
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
            {role === 'Executor' && isCreateVacancyPageOpen && linkedCreateVacancyOrder ? (
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

            {isProfileRoute ? (
              <ProfilePage />
            ) : (role === 'Customer' && isCreateOrderPageOpen) ||
              (role === 'Executor' && isCreateCandidatePageOpen) ||
              (role === 'Executor' && isCreateVacancyPageOpen) ||
              (role === 'Applicant' && isCreateApplicantResponsePageOpen) ||
              isDetailsPageOpen ? null : (
              <>
                {(activeView === 'dashboard' ||
                  activeView === 'orders' ||
                  activeView === 'candidates') && (
                  <>
                    {activeView !== 'candidates' ? (
                      <StatsGrid
                        stats={runtimeStats}
                        onOverview={() => handleViewChange('candidates')}
                      />
                    ) : null}
                    <MainFeedPanel
                      baseCandidates={
                        role === 'Executor' ? executorBaseCandidates : filteredBaseCandidates
                      }
                      applicantRespondedOrderIds={applicantRespondedOrderIds}
                      canManageOrderResponses={canManageOrderResponses}
                      canPublishVacancyForCustomer={canPublishVacancyForSelectedOrder}
                      canManageOrders={canManageOrder}
                      canRespondToOrder={canRespondToSelectedOrder}
                      canViewBaseCandidates={canLoadExecutorBaseCandidates}
                      candidates={role === 'Executor' ? executorMyCandidates : filteredCandidates}
                      hasRespondedToOrder={hasRespondedToSelectedOrder}
                      isLoading={
                        isViewLoading ||
                        (activeView === 'orders' && isOrdersApiLoading) ||
                        (activeView === 'candidates' && isCandidatesApiLoading)
                      }
                      isOrderResponsesLoading={isOrderResponsesFetching}
                      isOrdersArchiving={isDeletingOrder}
                      isOrdersStateUpdating={isOrderStatusUpdating}
                      isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
                      isRejectingOrderExecutor={isRejectingOrderExecutor}
                      isRespondingToOrder={isRespondingToOrder}
                      isSelectingOrderExecutor={isSelectingOrderExecutor}
                      onActivateOrders={handleActivateOrders}
                      onArchiveOrders={handleArchiveOrders}
                      onCreateVacancyFromOrder={handleCreateVacancyFromOrder}
                      onCloseOrderDetails={closeOrderDetails}
                      onOpenCandidate={handleOpenCandidateDetails}
                      onOpenOrder={handleOpenOrderDetails}
                      onPauseOrders={handlePauseOrders}
                      onPublishVacancyForCustomer={handlePublishVacancyForSelectedOrder}
                      onMoveApplicantResponderToShortlist={(orderId, candidateId) =>
                        handleSetApplicantResponderStage(orderId, candidateId, 'Shortlist')
                      }
                      onRejectApplicantResponder={(orderId, candidateId) =>
                        handleSetApplicantResponderStage(orderId, candidateId, 'Pool')
                      }
                      onRejectOrderExecutor={handleRejectOrderExecutor}
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
                      view={activeView === 'dashboard' ? 'dashboard' : activeView}
                    />
                  </>
                )}

                {activeView === 'meetings' ? <CalendarPanel meetings={[]} /> : null}

                {activeView === 'chats' ? (
                  <Card className="rounded-xl border-slate-200 p-4 shadow-none">
                    <h3 className="text-base font-semibold text-slate-900">Чаты</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Быстрая коммуникация между ролями и фиксация следующих шагов.
                    </p>

                    {isViewLoading ? (
                      <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                        />
                        Загружаем треды...
                      </div>
                    ) : filteredThreads.length === 0 ? (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                        По запросу «{searchValue}» чаты не найдены.
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
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50',
                              )}
                              onClick={() => setPreferredChatId(thread.id)}
                              type="button"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">
                                  {thread.participant}
                                </p>
                                {thread.unread > 0 ? (
                                  <Badge variant="default">{thread.unread}</Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-600">{thread.preview}</p>
                            </button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white">
                          <div className="border-b border-slate-200 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">
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
                                    ? 'ml-auto bg-blue-50 text-blue-900'
                                    : 'bg-slate-100 text-slate-700',
                                )}
                              >
                                <p>{message.text}</p>
                                <p className="mt-1 text-xs text-slate-500">{message.time}</p>
                              </article>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
                            <Input
                              className="h-10 rounded-xl border-slate-200 text-slate-900"
                              onChange={(event) => setChatDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                              placeholder="Написать сообщение..."
                              value={chatDraft}
                            />
                            <Button
                              className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                              onClick={handleSendMessage}
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
                  />
                ) : null}

                {activeView === 'documents' ? (
                  <Card className="rounded-xl border-slate-200 p-4 shadow-none">
                    <h3 className="text-base font-semibold text-slate-900">Документооборот</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Управление документами и контрактами по заказам.
                    </p>
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                      Документы будут отображаться здесь.
                    </div>
                  </Card>
                ) : null}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
