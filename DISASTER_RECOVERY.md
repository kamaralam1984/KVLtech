# KVL TECH — Disaster Recovery Runbook

**Version:** 1.0  
**Last Updated:** 2026-06-07  
**Owner:** KVL TECH DevOps  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Emergency Contacts](#2-emergency-contacts)
3. [Incident Severity Levels](#3-incident-severity-levels)
4. [Infrastructure Topology](#4-infrastructure-topology)
5. [Backup Strategy](#5-backup-strategy)
6. [Recovery Procedures](#6-recovery-procedures)
7. [Health Check URLs](#7-health-check-urls)
8. [Rollback Procedure](#8-rollback-procedure)
9. [Post-Incident Checklist](#9-post-incident-checklist)
10. [Backup Verification](#10-backup-verification)

---

## 1. Overview

| Parameter | Value |
|-----------|-------|
| **RTO** (Recovery Time Objective) | 1 hour |
| **RPO** (Recovery Point Objective) | 24 hours (daily backups) |
| **Production URL** | https://kvlbusinesssolutions.com |
| **Namespace** | `kvltech-prod` |
| **Registry** | `ghcr.io/kvltech/kvl-tech-website` |

This runbook covers recovery procedures for the KVL TECH website, a Next.js 16 application backed by PostgreSQL 16 and Redis 7, deployed on Kubernetes.

---

## 2. Emergency Contacts

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|--------------|
| Primary On-Call Engineer | _REPLACE_ | _REPLACE_ | _REPLACE_ | 24/7 |
| Secondary On-Call Engineer | _REPLACE_ | _REPLACE_ | _REPLACE_ | 24/7 |
| Database Administrator | _REPLACE_ | _REPLACE_ | _REPLACE_ | Business hours |
| Kubernetes Administrator | _REPLACE_ | _REPLACE_ | _REPLACE_ | Business hours |
| Business Owner | _REPLACE_ | _REPLACE_ | _REPLACE_ | Business hours |
| Hosting Provider Support | _REPLACE_ | _REPLACE_ | support@_REPLACE_ | 24/7 |

---

## 3. Incident Severity Levels

| Level | Name | Description | Response Time | Resolution Target |
|-------|------|-------------|---------------|-------------------|
| **P1** | Critical | Complete site outage; all users affected; data loss risk | 15 minutes | 1 hour |
| **P2** | High | Major feature unavailable (payments, auth); partial outage | 30 minutes | 4 hours |
| **P3** | Medium | Non-critical feature broken; degraded performance | 2 hours | 24 hours |
| **P4** | Low | Cosmetic issue; single user affected; non-production | Next business day | 72 hours |

### Escalation Path

```
Alert fired
    → On-call engineer notified (PagerDuty / phone)
    → If no response in 15 min → Secondary on-call
    → If no response in 30 min → Business owner
    → If P1 unresolved in 1 hour → All contacts
```

---

## 4. Infrastructure Topology

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│         Nginx Ingress Controller        │
│   (nginx.ingress.kubernetes.io)         │
│   TLS: cert-manager / letsencrypt-prod  │
│   Rate limit: 100 req/min               │
└────────────────┬────────────────────────┘
                 │ ClusterIP :80
                 ▼
        ┌─────────────────┐
        │ kvltech-service  │  (ClusterIP, port 80 → 3001)
        └────────┬────────┘
                 │
        ┌────────▼────────────────────────────┐
        │         kvltech-app Deployment       │
        │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
        │  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │ │
        │  │ :3001    │  │ :3001    │  │ :3001    │ │
        │  │ Next.js  │  │ Next.js  │  │ Next.js  │ │
        │  └──────────┘  └──────────┘  └──────────┘ │
        │  HPA: 2–10 replicas | PDB: minAvailable 1  │
        └────────┬───────────────┬──────────────────┘
                 │               │
    ┌────────────▼───┐   ┌───────▼────────────────┐
    │ kvltech-postgres│   │    kvltech-redis        │
    │  postgres:16    │   │    redis:7-alpine       │
    │  PVC: 20Gi      │   │    PVC: 5Gi             │
    │  :5432          │   │    :6379                │
    └─────────────────┘   └────────────────────────┘
```

---

## 5. Backup Strategy

### Schedule

| Backup Type | Frequency | Retention | Tool |
|-------------|-----------|-----------|------|
| PostgreSQL full dump | Daily at 02:00 UTC | 7 days | `pg_dump` + `gzip` |
| Redis (AOF) | Continuous (appendonly yes) | N/A — in-cluster PVC | Redis AOF |

### Backup Locations

| Location | Path | Notes |
|----------|------|-------|
| Production server | `/backups/kvltech_YYYY-MM-DD_HH-MM.sql.gz` | Local 7-day rolling |
| Remote (recommended) | S3 / GCS bucket `kvltech-backups/` | Configure separately |

### Triggering a Manual Backup

```bash
# On the production server (or via kubectl exec)
PGPASSWORD="$DB_PASSWORD" /opt/kvltech/scripts/backup.sh

# Via kubectl
kubectl exec -n kvltech-prod deployment/kvltech-postgres -- \
  pg_dump -U kvluser kvltech | gzip > /backups/kvltech_manual_$(date +%Y-%m-%d).sql.gz
```

---

## 6. Recovery Procedures

### 6.1 Complete Outage Recovery

**Symptoms:** Site returns 502/503, all pods down, or cluster unreachable.

**Steps:**

1. **Assess the situation**
   ```bash
   kubectl get nodes
   kubectl get pods -n kvltech-prod
   kubectl get events -n kvltech-prod --sort-by='.lastTimestamp' | tail -30
   ```

2. **Check pod logs**
   ```bash
   kubectl logs -n kvltech-prod -l app=kvltech --previous --tail=100
   kubectl describe pods -n kvltech-prod -l app=kvltech
   ```

3. **If nodes are down — restore cluster first**
   - Contact hosting provider / cloud console
   - Restore node group from snapshot if available
   - Re-join nodes: follow cloud provider runbook

4. **Re-apply all Kubernetes manifests**
   ```bash
   cd /opt/kvltech
   ./scripts/k8s-deploy.sh
   ```

5. **Verify database connectivity**
   ```bash
   kubectl exec -n kvltech-prod deployment/kvltech-postgres -- \
     pg_isready -U kvluser -d kvltech
   ```

6. **Run Prisma migrations**
   ```bash
   kubectl exec -n kvltech-prod deployment/kvltech-app -- \
     npx prisma migrate deploy
   ```

7. **Verify health endpoint**
   ```bash
   curl -f https://kvlbusinesssolutions.com/api/health
   ```

8. **Monitor for 15 minutes** — watch pod restarts and error rates.

---

### 6.2 Database Corruption Recovery

**Symptoms:** App returns 500 errors, Prisma client throws database errors, pg_isready fails.

**Steps:**

1. **Scale down the app to prevent further writes**
   ```bash
   kubectl scale deployment/kvltech-app -n kvltech-prod --replicas=0
   ```

2. **Identify the most recent clean backup**
   ```bash
   ls -lht /backups/kvltech_*.sql.gz | head -10
   ```

3. **Restore the database**
   ```bash
   PGPASSWORD="$DB_PASSWORD" /opt/kvltech/scripts/restore.sh \
     /backups/kvltech_YYYY-MM-DD_HH-MM.sql.gz
   ```

4. **Run Prisma migrations to bring schema up to date**
   ```bash
   cd /opt/kvltech && npx prisma migrate deploy
   ```

5. **Scale the app back up**
   ```bash
   kubectl scale deployment/kvltech-app -n kvltech-prod --replicas=3
   ```

6. **Verify**
   ```bash
   kubectl rollout status deployment/kvltech-app -n kvltech-prod
   curl -f https://kvlbusinesssolutions.com/api/health
   ```

7. **Assess data loss** — determine what was written between the backup and the corruption event, notify affected users if required.

---

### 6.3 Redis Failure

**Symptoms:** Redis pod in CrashLoopBackOff or OOMKilled; app may show degraded performance.

> The application is designed to operate without Redis (sessions fall back to database; caching is skipped). User impact: slower response times, no in-memory rate limiting.

**Steps:**

1. **Check Redis pod status**
   ```bash
   kubectl get pods -n kvltech-prod -l component=redis
   kubectl logs -n kvltech-prod deployment/kvltech-redis --previous
   ```

2. **If OOM — increase memory limit** (edit `k8s/redis-deployment.yaml`, re-apply)

3. **Restart the Redis pod**
   ```bash
   kubectl rollout restart deployment/kvltech-redis -n kvltech-prod
   kubectl rollout status deployment/kvltech-redis -n kvltech-prod
   ```

4. **If PVC is corrupted — recreate**
   ```bash
   kubectl delete deployment kvltech-redis -n kvltech-prod
   kubectl delete pvc redis-pvc -n kvltech-prod
   kubectl apply -f k8s/redis-deployment.yaml
   ```
   > Note: Redis data (cache/sessions) will be lost; this is acceptable.

5. **Verify the app is healthy** — Redis failure should not cause a P1.

---

### 6.4 Single Pod Failure

**Symptoms:** One pod in `Error` or `CrashLoopBackOff`; other pods serve traffic normally.

> Kubernetes will automatically reschedule the failed pod. No manual intervention is required in most cases.

**Verify auto-healing:**
```bash
kubectl get pods -n kvltech-prod -l app=kvltech -w
```

**If the pod does not recover within 5 minutes:**
```bash
# Get the failing pod name
POD=$(kubectl get pods -n kvltech-prod -l app=kvltech --field-selector=status.phase!=Running -o name | head -1)
kubectl logs -n kvltech-prod "$POD" --previous
kubectl describe -n kvltech-prod "$POD"

# Force delete if stuck in Terminating
kubectl delete pod -n kvltech-prod "$POD" --grace-period=0 --force
```

---

## 7. Health Check URLs

| URL | Auth | Purpose |
|-----|------|---------|
| `https://kvlbusinesssolutions.com/api/health` | None (public) | Basic liveness — returns 200 if app is up |
| `https://kvlbusinesssolutions.com/api/admin/health` | `Authorization: Bearer <ADMIN_JWT>` | Deep health — checks DB and Redis connectivity |

**Expected response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T02:00:00.000Z"
}
```

**Quick check:**
```bash
curl -sf https://kvlbusinesssolutions.com/api/health | jq .
```

---

## 8. Rollback Procedure

### Rollback the Application Deployment

```bash
# Roll back to the previous deployment revision
kubectl rollout undo deployment/kvltech-app -n kvltech-prod

# Verify the rollback
kubectl rollout status deployment/kvltech-app -n kvltech-prod

# Check which image is now running
kubectl describe deployment/kvltech-app -n kvltech-prod | grep Image
```

### Roll Back to a Specific Revision

```bash
# List revision history
kubectl rollout history deployment/kvltech-app -n kvltech-prod

# Roll back to revision N
kubectl rollout undo deployment/kvltech-app -n kvltech-prod --to-revision=<N>
```

### Roll Back via Image Tag

```bash
# Pin to a specific SHA-tagged image
kubectl set image deployment/kvltech-app \
  kvltech-app=ghcr.io/kvltech/kvl-tech-website:<sha-tag> \
  -n kvltech-prod

kubectl rollout status deployment/kvltech-app -n kvltech-prod
```

### Roll Back Database Migrations

If the new code introduced a destructive migration, restore from backup (see [6.2](#62-database-corruption-recovery)) before rolling back the deployment image.

---

## 9. Post-Incident Checklist

Complete within 24 hours of incident resolution.

- [ ] Incident timeline documented (start, detection, response, resolution)
- [ ] Root cause identified and written up
- [ ] All affected services confirmed healthy (`/api/health` returning 200)
- [ ] Data integrity verified (spot-check critical tables/records)
- [ ] Any data loss quantified and stakeholders notified
- [ ] Monitoring/alerting rules updated to catch this class of issue earlier
- [ ] Runbook updated with any new steps discovered during the incident
- [ ] Blameless post-mortem meeting scheduled (within 48 hours for P1/P2)
- [ ] Action items created and assigned with due dates
- [ ] DISASTER_RECOVERY.md updated with new RTO/RPO if changed

---

## 10. Backup Verification

Perform a restore test monthly in a **staging environment** to confirm backups are valid.

### Monthly Restore Test Procedure

1. **Provision a staging PostgreSQL instance** (Docker or separate cluster namespace)

2. **Copy the latest backup**
   ```bash
   LATEST=$(ls -t /backups/kvltech_*.sql.gz | head -1)
   echo "Testing backup: $LATEST"
   ```

3. **Restore to staging**
   ```bash
   export PGPASSWORD="$STAGING_DB_PASSWORD"
   export DB_HOST="staging-db-host"
   export DB_NAME="kvltech_restore_test"
   export DB_USER="kvluser"

   /opt/kvltech/scripts/restore.sh "$LATEST"
   ```

4. **Verify row counts match production** (approximate)
   ```bash
   psql -h "$DB_HOST" -U kvluser -d kvltech_restore_test -c \
     "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20;"
   ```

5. **Run smoke test against the restored DB**
   - Start a test app instance pointing at the restored database
   - Exercise `GET /api/health` and a representative authenticated endpoint

6. **Log the result**
   ```
   [YYYY-MM-DD] Restore test: PASSED — Backup file: kvltech_YYYY-MM-DD_HH-MM.sql.gz
   Restored size: X rows in Y tables. RTO measured: N minutes.
   ```

7. **Tear down** the staging instance.

### Backup Health Alerts (Recommended)

Set up a monitoring alert if no backup file newer than 25 hours exists in `/backups/`:

```bash
# Add to cron (runs at 03:00 UTC, 1 hour after backup window)
0 3 * * * [ $(find /backups -name 'kvltech_*.sql.gz' -mtime -1 | wc -l) -ge 1 ] || \
  echo "ALERT: No recent backup found" | mail -s "KVL TECH backup missing" ops@kvlbusinesssolutions.com
```

---

*This runbook is a living document. Update it whenever infrastructure changes or a new incident reveals gaps.*
