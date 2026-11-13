FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY KadryTu.Api/KadryTu.Api.csproj KadryTu.Api/
RUN dotnet restore KadryTu.Api/KadryTu.Api.csproj

COPY KadryTu.Api/ KadryTu.Api/
RUN dotnet publish KadryTu.Api/KadryTu.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "KadryTu.Api.dll"]
