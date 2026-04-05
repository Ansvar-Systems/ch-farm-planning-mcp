# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

We support only the latest minor version. Upgrade to receive security patches.

## Security Scanning

This project uses multiple layers of automated security scanning:

### Dependency Vulnerabilities
- **Dependabot:** Automated dependency updates (weekly)
- **npm audit:** Runs on every CI build

### Code Analysis
- **CodeQL:** Static analysis for security vulnerabilities (weekly + on PRs)
- **Gitleaks:** Secret detection across git history

### What We Scan For
- Known CVEs in dependencies
- SQL injection vulnerabilities
- Path traversal attacks
- Hardcoded secrets and credentials
- Supply chain attacks

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **Do NOT open a public GitHub issue**
2. Email: hello@ansvar.ai
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

We will respond within 48 hours and provide a timeline for a fix.

## Security Best Practices

This project follows security best practices:

- All database queries use prepared statements (no SQL injection)
- Input validation on all user-provided parameters via Zod schemas
- Read-only database access at runtime (no write operations)
- No execution of user-provided code
- Automated security testing in CI/CD
- Regular dependency updates via Dependabot

## Database Security

### Agricultural Database (SQLite)

The database (`data/database.db`) is:
- Pre-built and version-controlled (tamper evident)
- Source data from official Swiss federal agencies (Agroscope, BLW, Fedlex)
- Ingestion scripts require manual execution (no auto-download at runtime)

## Third-Party Dependencies

We minimize dependencies and regularly audit:
- Core runtime: Node.js, better-sqlite3
- MCP SDK: Official Anthropic package
- Validation: Zod
- No unnecessary dependencies

All dependencies are tracked via `package-lock.json` and scanned for vulnerabilities.

---

**Last Updated:** 2026-04-05
