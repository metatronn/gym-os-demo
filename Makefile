# ─────────────────────────────────────────────────────────────
# GYM OS — Developer Environment
# Run `make help` to see available commands.
# ─────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help

COMPOSE       := docker compose
SENTINEL_SEED := .dev-seeded

.PHONY: help dev devstop dev-fresh dev-seed dev-studio dev-stripe dev-status \
        _check-docker _ensure-env _start-postgres _wait-for-postgres \
        _install-deps _run-migrations _maybe-seed _next-dev

# ── Help ─────────────────────────────────────────────────────

help: ## Show available commands
	@echo ""
	@echo "  GYM OS — Developer Commands"
	@echo "  ────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Primary commands ─────────────────────────────────────────

dev: _check-docker _ensure-env _start-postgres _wait-for-postgres _install-deps _run-migrations _maybe-seed _next-dev ## Start everything (Postgres, migrations, Next.js)

devstop: ## Stop Docker containers
	@echo "Stopping containers..."
	@$(COMPOSE) down
	@echo "Done."

dev-fresh: _check-docker ## Nuke database and rebuild from scratch
	@echo "Destroying Postgres volume..."
	@$(COMPOSE) down -v
	@rm -f $(SENTINEL_SEED)
	@$(MAKE) dev

dev-seed: _check-docker _start-postgres _wait-for-postgres ## Re-run the seed script
	@echo "Seeding database..."
	@npm run db:seed --silent
	@touch $(SENTINEL_SEED)
	@echo "Done."

dev-studio: ## Open Drizzle Studio (database browser)
	@npm run db:studio

dev-stripe: ## Start Stripe webhook forwarding
	@echo "Forwarding to http://localhost:3000/api/webhooks/stripe"
	@echo "Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET"
	@echo ""
	@stripe listen --forward-to localhost:3000/api/webhooks/stripe

dev-status: ## Show what's running
	@echo ""
	@echo "  Docker Containers"
	@echo "  ─────────────────"
	@$(COMPOSE) ps 2>/dev/null || echo "  No containers running."
	@echo ""
	@echo "  Ports"
	@echo "  ─────"
	@echo "  :5432 (Postgres)  $$(lsof -i :5432 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")"
	@echo "  :3000 (Next.js)   $$(lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")"
	@echo ""

# ── Internal targets ─────────────────────────────────────────

_check-docker:
	@if ! docker info >/dev/null 2>&1; then \
		echo ""; \
		echo "  Docker is not running. Start Docker Desktop and try again."; \
		echo ""; \
		exit 1; \
	fi

_ensure-env:
	@if [ ! -f .env.local ]; then \
		echo "Creating .env.local from .env.example..."; \
		cp .env.example .env.local; \
	else \
		echo ".env.local exists."; \
	fi

_start-postgres:
	@$(COMPOSE) up -d postgres --quiet-pull 2>/dev/null || $(COMPOSE) up -d postgres

_wait-for-postgres:
	@printf "Waiting for Postgres..."
	@until $(COMPOSE) exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do \
		printf "."; \
		sleep 1; \
	done
	@echo " ready."

_install-deps:
	@if [ ! -d node_modules ]; then \
		echo "Installing dependencies..."; \
		npm ci; \
	fi

_run-migrations:
	@printf "Running migrations..."
	@npm run db:migrate --silent > /dev/null 2>&1
	@echo " done."

_maybe-seed:
	@if [ ! -f $(SENTINEL_SEED) ]; then \
		echo "Seeding database..."; \
		npm run db:seed --silent; \
		touch $(SENTINEL_SEED); \
		echo "Seed complete."; \
	else \
		echo "Already seeded (run 'make dev-seed' to re-seed)."; \
	fi

_next-dev:
	@echo ""
	@echo "  http://localhost:3000"
	@echo "  Ctrl+C to stop"
	@echo ""
	@npm run dev
