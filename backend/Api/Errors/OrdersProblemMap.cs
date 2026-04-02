using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;

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

    public static ApiProblemDescriptor Resolve(UpdateOrderErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateOrderErrorCode.NotFound => OrderNotFound,
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
}
