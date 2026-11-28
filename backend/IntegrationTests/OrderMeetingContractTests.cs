using System.Text.Json;
using SelectProfi.backend.Contracts.Meetings;
using SelectProfi.backend.Domain.Orders;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class OrderMeetingContractTests
{
    [Theory]
    [InlineData(OrderMeetingFormat.AudioCall)]
    [InlineData(OrderMeetingFormat.VideoCall)]
    [InlineData(OrderMeetingFormat.Chat)]
    [InlineData(OrderMeetingFormat.InPerson)]
    public void MeetingFormatsRoundTripAsNames(OrderMeetingFormat format)
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var request = JsonSerializer.Deserialize<CreateOrderMeetingRequest>(
            $$"""{"format":"{{format}}"}""", options);

        Assert.NotNull(request);
        Assert.Equal(format, request.Format);

        var response = new OrderMeetingResponse(
            Guid.NewGuid(), Guid.NewGuid(), "Демо", Guid.NewGuid(), "Участник", Guid.NewGuid(),
            "Встреча", format, DateTime.UtcNow.AddHours(1), string.Empty, DateTime.UtcNow);
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(response, options));

        Assert.Equal(format.ToString(), json.RootElement.GetProperty("format").GetString());
    }
}
