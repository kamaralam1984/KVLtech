#!/usr/bin/env bash
# scripts/k8s-deploy.sh
# Deploy the KVL TECH application to Kubernetes.
# Usage: ./scripts/k8s-deploy.sh [--dry-run]
# Make executable: chmod +x scripts/k8s-deploy.sh

set -euo pipefail

NAMESPACE="kvltech-prod"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../k8s" && pwd)"
DRY_RUN=false

# ── Argument parsing ─────────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=true
      ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: $0 [--dry-run]"
      exit 1
      ;;
  esac
done

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
info() { log "INFO  $*"; }
warn() { log "WARN  $*"; }
err()  { log "ERROR $*" >&2; }

# ── Preflight checks ──────────────────────────────────────────────────────────
info "Running preflight checks..."

if ! command -v kubectl &>/dev/null; then
  err "kubectl is not installed or not in PATH. Please install kubectl first."
  exit 1
fi

info "kubectl version: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"

if [ ! -d "$K8S_DIR" ]; then
  err "k8s directory not found: $K8S_DIR"
  exit 1
fi

if $DRY_RUN; then
  warn "DRY RUN mode — no changes will be applied to the cluster."
fi

# ── Apply namespace first ──────────────────────────────────────────────────────
info "Applying namespace..."
if $DRY_RUN; then
  kubectl apply -f "$K8S_DIR/namespace.yaml" --dry-run=client
else
  kubectl apply -f "$K8S_DIR/namespace.yaml"
fi

# ── Apply full kustomization ───────────────────────────────────────────────────
info "Applying kustomization from $K8S_DIR..."
if $DRY_RUN; then
  kubectl apply -k "$K8S_DIR" --dry-run=client
else
  kubectl apply -k "$K8S_DIR"
fi

# ── Wait for rollout ───────────────────────────────────────────────────────────
if ! $DRY_RUN; then
  info "Waiting for deployment rollout..."
  if ! kubectl rollout status deployment/kvltech-app -n "$NAMESPACE" --timeout=300s; then
    err "Rollout did not complete within 5 minutes."
    err "Check pod events with: kubectl describe pods -n $NAMESPACE -l app=kvltech"
    exit 1
  fi
  info "Rollout complete."
fi

# ── Show pod status ────────────────────────────────────────────────────────────
info "Current pod status in namespace '$NAMESPACE':"
kubectl get pods -n "$NAMESPACE" -l app=kvltech -o wide

info "Deployment finished successfully."
