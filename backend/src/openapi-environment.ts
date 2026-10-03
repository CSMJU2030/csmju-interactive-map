// ConfigModule validates configuration during import. Schema export needs no
// database, so this tooling-only module must load before AppModule.
process.env.SKIP_DATABASE_CONNECT = "true";
