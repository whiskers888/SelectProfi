const config = {
  schemaFile: process.env.OPENAPI_SCHEMA_URL ?? 'http://localhost:5268/openapi/v1.json',
  apiFile: './src/shared/api/emptyApi.ts',
  apiImport: 'emptyApi',
  outputFile: './src/shared/api/generated/openapi.ts',
  exportName: 'api',
  hooks: true,
}

export default config
