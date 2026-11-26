using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Application.Orders;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class OrderConversationAccessRulesTests
{
    [Theory]
    [InlineData(UserRole.Customer)]
    [InlineData(UserRole.Executor)]
    public void CurrentOrderParticipantsCanStartConversation(UserRole role)
    {
        var order = CreateAssignedOrder();
        var requesterId = role == UserRole.Customer ? order.CustomerId : order.ExecutorId!.Value;

        Assert.True(OrderConversationAccessRules.CanStartOrReadOrderConversation(role, requesterId, order));
    }

    [Theory]
    [InlineData(UserRole.Customer)]
    [InlineData(UserRole.Executor)]
    [InlineData(UserRole.Applicant)]
    [InlineData(UserRole.Admin)]
    public void NonParticipantsCannotStartConversation(UserRole role)
    {
        var order = CreateAssignedOrder();

        Assert.False(OrderConversationAccessRules.CanStartOrReadOrderConversation(role, Guid.NewGuid(), order));
    }

    [Fact]
    public void ExecutorCannotReadConversationFromPreviousAssignment()
    {
        var order = CreateAssignedOrder();
        var previousConversation = new OrderConversation
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId!.Value,
            CreatedAtUtc = DateTime.UtcNow
        };
        order.ExecutorId = Guid.NewGuid();

        Assert.False(OrderConversationAccessRules.CanReadConversation(
            UserRole.Executor, order.ExecutorId.Value, order, previousConversation));
        Assert.False(OrderConversationAccessRules.CanReadConversation(
            UserRole.Customer, order.CustomerId, order, previousConversation));
    }

    [Fact]
    public void AttachmentPolicyAllowsKnownTypesAndRemovesPathComponents()
    {
        var accepted = OrderMessageAttachmentPolicy.TryNormalize(
            "C:\\resume\\profile.pdf", 256, out var safeName, out var extension, out var contentType);

        Assert.True(accepted);
        Assert.Equal("profile.pdf", safeName);
        Assert.Equal(".pdf", extension);
        Assert.Equal("application/pdf", contentType);
    }

    [Theory]
    [InlineData("script.exe", 100)]
    [InlineData("large.mp4", OrderMessageAttachmentPolicy.MaximumLength + 1)]
    [InlineData("empty.txt", 0)]
    public void AttachmentPolicyRejectsUnsupportedFiles(string fileName, long length)
    {
        Assert.False(OrderMessageAttachmentPolicy.TryNormalize(fileName, length, out _, out _, out _));
    }

    private static Order CreateAssignedOrder() => new()
    {
        Id = Guid.NewGuid(),
        CustomerId = Guid.NewGuid(),
        ExecutorId = Guid.NewGuid()
    };
}
