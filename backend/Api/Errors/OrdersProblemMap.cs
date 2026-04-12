using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.GetOrderResponses;
using SelectProfi.backend.Application.Orders.RejectOrderResponse;
using SelectProfi.backend.Application.Orders.RespondToOrder;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

namespace SelectProfi.backend.Errors;

public static class OrdersProblemMap
{
    private static readonly ApiProblemDescriptor CustomerNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "customer_not_found",
        "Профиль заказчика не найден.");

    private static readonly ApiProblemDescriptor OrderNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "order_not_found",
        "Заказ не найден.");

    private static readonly ApiProblemDescriptor ExecutorNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "executor_not_found",
        "Рекрутер не найден.");

    private static readonly ApiProblemDescriptor OrderAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "order_access_forbidden",
        "У вас нет доступа к этому заказу.");

    private static readonly ApiProblemDescriptor OrderListAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "order_list_access_forbidden",
        "У вас нет доступа к списку заказов.");

    private static readonly ApiProblemDescriptor OrderExecutorsAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "order_executors_access_forbidden",
        "У вас нет доступа к списку исполнителей.");

    private static readonly ApiProblemDescriptor OrderHasActiveVacancy = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_has_active_vacancy",
        "У заказа есть активная вакансия, удаление невозможно.");

    private static readonly ApiProblemDescriptor CreateOrderConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_conflict",
        "Не удалось создать заказ из-за конфликта данных.");

    private static readonly ApiProblemDescriptor UpdateOrderConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_conflict",
        "Не удалось обновить заказ из-за конфликта данных.");

    private static readonly ApiProblemDescriptor DeleteOrderConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_conflict",
        "Не удалось удалить заказ из-за конфликта данных.");

    private static readonly ApiProblemDescriptor OrderResponseAlreadyExists = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_response_already_exists",
        "Вы уже откликались на этот заказ.");

    private static readonly ApiProblemDescriptor OrderResponseNotAvailable = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_response_not_available",
        "Заказ недоступен для отклика.");

    private static readonly ApiProblemDescriptor OrderResponseCannotWithdraw = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_response_cannot_withdraw",
        "Отклик нельзя отменить в текущем статусе.");

    private static readonly ApiProblemDescriptor OrderResponseCannotReject = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "order_response_cannot_reject",
        "Отклик нельзя отклонить в текущем статусе.");

    private static readonly ApiProblemDescriptor OrderResponseNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "order_response_not_found",
        "Отклик не найден.");

    private static readonly ApiProblemDescriptor OrderResponsesAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "order_responses_access_forbidden",
        "У вас нет доступа к откликам этого заказа.");

    public static ApiProblemDescriptor Resolve(CreateOrderErrorCode errorCode)
    {
        return errorCode switch
        {
            CreateOrderErrorCode.CustomerNotFound => CustomerNotFound,
            _ => CreateOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(GetOrderByIdErrorCode errorCode)
    {
        return errorCode switch
        {
            GetOrderByIdErrorCode.NotFound => OrderNotFound,
            _ => OrderAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(GetOrdersErrorCode errorCode)
    {
        return errorCode switch
        {
            GetOrdersErrorCode.Forbidden => OrderListAccessForbidden,
            _ => OrderListAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(GetOrderExecutorsErrorCode errorCode)
    {
        return errorCode switch
        {
            GetOrderExecutorsErrorCode.Forbidden => OrderExecutorsAccessForbidden,
            _ => OrderExecutorsAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(UpdateOrderErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateOrderErrorCode.NotFound => OrderNotFound,
            UpdateOrderErrorCode.ExecutorNotFound => ExecutorNotFound,
            UpdateOrderErrorCode.Forbidden => OrderAccessForbidden,
            _ => UpdateOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(DeleteOrderErrorCode errorCode)
    {
        return errorCode switch
        {
            DeleteOrderErrorCode.NotFound => OrderNotFound,
            DeleteOrderErrorCode.Forbidden => OrderAccessForbidden,
            DeleteOrderErrorCode.HasActiveVacancy => OrderHasActiveVacancy,
            _ => DeleteOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(RespondToOrderErrorCode errorCode)
    {
        return errorCode switch
        {
            RespondToOrderErrorCode.NotFound => OrderNotFound,
            RespondToOrderErrorCode.Forbidden => OrderAccessForbidden,
            RespondToOrderErrorCode.NotAvailable => OrderResponseNotAvailable,
            RespondToOrderErrorCode.AlreadyResponded => OrderResponseAlreadyExists,
            _ => UpdateOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(RejectOrderResponseErrorCode errorCode)
    {
        return errorCode switch
        {
            RejectOrderResponseErrorCode.NotFound => OrderNotFound,
            RejectOrderResponseErrorCode.Forbidden => OrderResponsesAccessForbidden,
            RejectOrderResponseErrorCode.ResponseNotFound => OrderResponseNotFound,
            RejectOrderResponseErrorCode.NotAvailable => OrderResponseNotAvailable,
            RejectOrderResponseErrorCode.CannotReject => OrderResponseCannotReject,
            _ => UpdateOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(WithdrawOrderResponseErrorCode errorCode)
    {
        return errorCode switch
        {
            WithdrawOrderResponseErrorCode.NotFound => OrderResponseNotFound,
            WithdrawOrderResponseErrorCode.Forbidden => OrderAccessForbidden,
            WithdrawOrderResponseErrorCode.CannotWithdraw => OrderResponseCannotWithdraw,
            _ => UpdateOrderConflict
        };
    }

    public static ApiProblemDescriptor Resolve(GetOrderResponsesErrorCode errorCode)
    {
        return errorCode switch
        {
            GetOrderResponsesErrorCode.NotFound => OrderNotFound,
            GetOrderResponsesErrorCode.Forbidden => OrderResponsesAccessForbidden,
            _ => OrderResponsesAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(GetMyOrderResponseErrorCode errorCode)
    {
        return errorCode switch
        {
            GetMyOrderResponseErrorCode.NotFound => OrderNotFound,
            GetMyOrderResponseErrorCode.Forbidden => OrderAccessForbidden,
            _ => OrderAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(SelectOrderResponseExecutorErrorCode errorCode)
    {
        return errorCode switch
        {
            SelectOrderResponseExecutorErrorCode.NotFound => OrderNotFound,
            SelectOrderResponseExecutorErrorCode.Forbidden => OrderResponsesAccessForbidden,
            SelectOrderResponseExecutorErrorCode.ResponseNotFound => OrderResponseNotFound,
            SelectOrderResponseExecutorErrorCode.NotAvailable => OrderResponseNotAvailable,
            _ => UpdateOrderConflict
        };
    }
}
