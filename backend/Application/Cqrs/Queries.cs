namespace SelectProfi.backend.Application.Cqrs;

public interface IQuery<TResult>;

public interface IQueryHandler<in TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken);
}

public interface IQueryDispatcher
{
    Task<TResult> DispatchAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken)
        where TQuery : IQuery<TResult>;
}

public sealed class QueryDispatcher(Func<Type, object?> serviceResolver) : IQueryDispatcher
{
    public Task<TResult> DispatchAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken)
        where TQuery : IQuery<TResult>
    {
        ArgumentNullException.ThrowIfNull(query);

        var handler = serviceResolver(typeof(IQueryHandler<TQuery, TResult>)) as IQueryHandler<TQuery, TResult>;
        if (handler is null)
            throw new InvalidOperationException(
                $"Query handler is not registered for {typeof(TQuery).FullName} -> {typeof(TResult).FullName}.");

        return handler.HandleAsync(query, cancellationToken);
    }
}
