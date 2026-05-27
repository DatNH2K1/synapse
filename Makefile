.PHONY: up down build logs ps restart shell seed migrate dev link run-agent plugin-link plugin-unlink

# Start containers in background
up:
	docker compose up -d --build
	docker image prune -f --filter "label=com.docker.compose.project=synapse"
	@echo "⏳ Waiting for synapse-portal to start..."
	@until [ "$$(docker inspect -f '{{.State.Status}}' synapse-portal 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	@echo "🚀 Running database migrations and seeding..."
	$(MAKE) check
	$(MAKE) migrate
	$(MAKE) seed
	$(MAKE) link
	$(MAKE) plugin-link

# Stop and remove containers
down:
	docker compose down

# Rebuild images
build:
	docker compose build

# View container logs
logs:
	docker compose logs -f

# List running containers
ps:
	docker compose ps

# Restart all containers
restart:
	docker compose restart

# Access synapse-portal container shell
shell:
	docker compose exec synapse-portal sh

# Run database seed
seed:
	docker compose exec synapse-portal npx prisma db seed

# Run database migrations (prisma push)
migrate:
	docker compose exec synapse-portal npx prisma db push --accept-data-loss


# Full database refresh (Wipe + Seed + Push Lessons)
db-refresh:
	docker compose exec synapse-portal npx prisma db push --force-reset
	docker compose exec synapse-portal npx prisma db seed

check:
	@if [ ! -d "synapse-portal/node_modules" ]; then \
		echo "📦 synapse-portal node_modules not found. Running npm install on host..."; \
		cd synapse-portal && npm install; \
	fi
	cd synapse-portal && npx prisma generate && npm run check
	cd synapse-portal && npm run test:silent

# Run local development with hot reload
dev:
	$(MAKE) check
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	docker image prune -f --filter "label=com.docker.compose.project=synapse"
	@echo "⏳ Waiting for synapse-portal to start in development mode..."
	@until [ "$$(docker inspect -f '{{.State.Status}}' synapse-portal 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	@echo "🚀 Running database migrations and seeding..."
	$(MAKE) migrate
	$(MAKE) seed

link:
	python3 scripts/utils/link_agents.py

plugin-link:
	@mkdir -p ~/.gemini/config/plugins
	$(MAKE) plugin-unlink
	@ln -sf "$(shell pwd)" ~/.gemini/config/plugins/synapse
	@echo "✅ Linked $(shell pwd) to ~/.gemini/config/plugins/synapse"

# Remove the plugin link from ~/.gemini/config/plugins
plugin-unlink:
	@rm -f ~/.gemini/config/plugins/synapse
	@echo "✅ Unlinked synapse plugin from ~/.gemini/config/plugins/synapse"



