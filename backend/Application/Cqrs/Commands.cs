namespace SelectProfi.backend.Application.Cqrs;

public interface ICommand<TResult>;

public interface ICommandHandler<in TCommand, TResult>
    where TCommand : ICommand<TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken cancellationToken);
}

public interface ICommandDispatcher
{
    Task<TResult> DispatchAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken)
        where TCommand : ICommand<TResult>;
}

public sealed class CommandDispatcher(Func<Type, object?> serviceResolver) : ICommandDispatcher
{
    public Task<TResult> DispatchAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken)
        where TCommand : ICommand<TResult>
    {
        ArgumentNullException.ThrowIfNull(command);

        var handler = serviceResolver(typeof(ICommandHandler<TCommand, TResult>)) as ICommandHandler<TCommand, TResult>;
        if (handler is null)
            throw new InvalidOperationException(
                $"Command handler is not registered for {typeof(TCommand).FullName} -> {typeof(TResult).FullName}.");

        return handler.HandleAsync(command, cancellationToken);
    }
}
