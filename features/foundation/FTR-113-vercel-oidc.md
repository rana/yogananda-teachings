---
ftr: 113
title: "Vercel OIDC Federation — Zero Long-Lived AWS Credentials"
summary: "Vercel OIDC federation for runtime AWS auth via AssumeRoleWithWebIdentity, eliminating static access keys"
state: implemented
domain: foundation
governed-by: [PRI-10]
---

# FTR-113: Vercel OIDC Federation

## Rationale

### Context

The portal authenticates to AWS from two contexts:

1. **GitHub Actions → AWS:** OIDC federation (FTR-106). Ephemeral tokens scoped by repo and branch. No stored credentials.
2. **Vercel functions → AWS Bedrock + Secrets Manager (FTR-112):** Needs an authentication mechanism.

The standard approach for Vercel → AWS is an IAM user with static access keys stored as Vercel env vars. But Vercel OIDC federation is GA and available on all plans:

- Uses `AssumeRoleWithWebIdentity` — the same mechanism as GitHub Actions OIDC
- Supports **team issuer mode** with environment-scoped `sub` claims (production, preview, development)
- SDK helper: `@vercel/functions/oidc` provides `awsCredentialsProvider` with automatic STS exchange and credential refresh

Using OIDC for both CI and runtime achieves **zero long-lived AWS credentials anywhere**.

### Decision

Adopt **Vercel OIDC federation** as the exclusive runtime AWS authentication mechanism. No IAM user access keys.

#### Architecture

```
Vercel Function
  → getVercelOidcToken()                    # Short-lived JWT from Vercel IdP
  → AWS STS AssumeRoleWithWebIdentity       # Exchange JWT for temporary credentials
  → Temporary IAM credentials (auto-refreshed, ~1hr TTL)
  → Bedrock / Secrets Manager calls
```

#### AWS Configuration

**1. Register Vercel as an OIDC Identity Provider:**

| Parameter | Value |
|-----------|-------|
| Provider URL | `https://oidc.vercel.com/{TEAM_SLUG}` (team issuer mode) |
| Audience | `https://vercel.com/{TEAM_SLUG}` |

**2. Create IAM role `portal-vercel-runtime`:**

Trust policy scopes by team, project, and environment:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::{ACCOUNT_ID}:oidc-provider/oidc.vercel.com/{TEAM_SLUG}"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "oidc.vercel.com/{TEAM_SLUG}:aud": "https://vercel.com/{TEAM_SLUG}"
    },
    "StringLike": {
      "oidc.vercel.com/{TEAM_SLUG}:sub": "owner:{TEAM_SLUG}:project:{PROJECT_NAME}:environment:*"
    }
  }
}
```

**3. Attach permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:Converse",
        "bedrock:ConverseStream"
      ],
      "Resource": "arn:aws:bedrock:us-west-2:*:inference-profile/*"
    },
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-west-2:{ACCOUNT_ID}:secret:/portal/*"
    }
  ]
}
```

#### Application Code

```typescript
import { awsCredentialsProvider } from '@vercel/functions/oidc';

const credentials = awsCredentialsProvider({
  roleArn: process.env.AWS_ROLE_ARN,  // Not a secret — just a resource identifier
});

// Bedrock client
const bedrock = new BedrockRuntimeClient({ region: 'us-west-2', credentials });

// Secrets Manager client
const secrets = new SecretsManagerClient({ region: 'us-west-2', credentials });
```

The `awsCredentialsProvider` handles STS exchange and credential refresh transparently. It falls back to the standard AWS credential chain when no OIDC token is present (local dev, CI).

#### Environment Variables

| Variable | Purpose | Secret? |
|----------|---------|---------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC assumption | No — resource identifier, set by Platform MCP |
| `AWS_REGION` | Bedrock and Secrets Manager region | No — static `us-west-2` |

No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in any deployed environment. Dependency: `@vercel/functions` (for OIDC helper).

#### Environment-Scoped Security

The OIDC `sub` claim includes the Vercel environment: `owner:{TEAM}:project:{PROJECT}:environment:{ENV}`. This enables environment-scoped IAM roles:

| Environment | Role | Secrets Access |
|-------------|------|---------------|
| Production | `portal-vercel-runtime-prod` | `/portal/production/*` only |
| Preview | `portal-vercel-runtime-preview` | `/portal/preview/*` only |
| Development | `portal-vercel-runtime-dev` | `/portal/development/*` only |

A preview deployment cannot assume the production role — environment isolation enforced at the IAM level.

#### Local Development

OIDC tokens only exist inside Vercel's runtime. For local development:

- The `awsCredentialsProvider` falls back to the standard AWS credential chain
- Developers use `~/.aws/credentials` with an `srf-dev` profile, or `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` in `.env.local`
- This is the same pattern Lambda-based services use when running locally
- The `/lib/config.ts` facade's env-var-first resolution order means `.env.local` secrets override Secrets Manager lookups, so local dev works without AWS Secrets Manager access

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Vercel OIDC (chosen)** | Zero stored credentials; environment-scoped; auto-refresh; no rotation needed; GA on all plans | Requires OIDC provider setup; local dev uses different auth path |
| **IAM user with static access keys** | Simple setup; works everywhere identically | Long-lived credentials; quarterly rotation; environment-agnostic (same keys work in any env); credential in state files |

### Consequences

- `bootstrap.sh` creates the Vercel OIDC identity provider alongside existing GitHub OIDC provider (FTR-106)
- `bootstrap.sh` creates `portal-vercel-runtime` IAM role(s) with Bedrock + Secrets Manager permissions, scoped per environment
- `AWS_ROLE_ARN` set as Vercel env var by Platform MCP (non-secret)
- `@vercel/functions` added as project dependency
- **Zero long-lived AWS credentials in any environment** — GitHub OIDC (CI) + Vercel OIDC (runtime)
- **Extends:** FTR-106 (OIDC pattern), FTR-112 (Secrets Manager access via role)
