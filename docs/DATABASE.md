# Database

No database, migrations, schema, seed data, or disk-backed chat history is implemented. Phase 1 conversations exist only in frontend memory and disappear when the application closes or New chat is selected.

SQLite remains proposed for Phase 5 and has not been added as a dependency. Before persistence is introduced, define storage paths per platform, schema, privacy/deletion behavior, migration compatibility, and backup/export requirements. Never use real private conversation records in fixtures or documentation.
