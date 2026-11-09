# Shared runtime support

CommonJS helpers shared by Node services and Electron. This package provides runtime paths, diagnostic codes, redaction, managed logs and the legacy namespace bridge. Configuration readers retain YAML schema and storage ownership.

Entry points: [index.cjs](index.cjs), [errors.cjs](errors.cjs), [runtimeLogs.cjs](runtimeLogs.cjs). Declarations are shipped with the package.

[legacyNamespace.cjs](legacyNamespace.cjs) copies owned legacy state to the new namespace only when the destination is absent, preserves source files and explicit paths, and maps old environment overrides without replacing current values. Failed copies never publish a partial new profile. Project configuration and instruction names follow the same precedence.

Run `pnpm --filter @g9agent/config test` from the repository root. Changes to these helpers require checking both Web and desktop consumers; see [testing](../../docs/testing.md).
