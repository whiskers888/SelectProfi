using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Errors;

public static class OrdersActionResultExtensions
{
    public static IActionResult ToActionResult(this CreateOrderResult result, ControllerBase controller)
    {
        if (result.ErrorCode == CreateOrderErrorCode.None)
            return controller.Created($"/api/orders/{result.OrderId}", result.ToResponse());

        return controller.ToProblem(OrdersProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetOrderByIdResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetOrderByIdErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(OrdersProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetOrdersResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetOrdersErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(OrdersProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this UpdateOrderResult result, ControllerBase controller)
    {
        if (result.ErrorCode == UpdateOrderErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(OrdersProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this DeleteOrderResult result, ControllerBase controller)
    {
        if (result.ErrorCode == DeleteOrderErrorCode.None)
            return controller.NoContent();

        return controller.ToProblem(OrdersProblemMap.Resolve(result.ErrorCode));
    }
}
