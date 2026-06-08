.PHONY: up down build logs ps restart shell seed migrate dev link run-agent link\:antigravity plugin-unlink

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
	$(MAKE) link:antigravity

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

# Run database migrations (prisma migrate deploy)
migrate:
	docker compose exec synapse-portal npx prisma migrate deploy


# Full database refresh (Wipe + Seed)
db-refresh:
	docker compose exec synapse-portal npx prisma migrate reset --force
	docker compose exec synapse-portal npx prisma db seed

test:
	cd synapse-portal && npm run test:silent

check:
	@if [ ! -d "synapse-portal/node_modules" ]; then \
		echo "📦 synapse-portal node_modules not found. Running npm install on host..."; \
		cd synapse-portal && npm install; \
	fi
	# Format files in workspace, excluding build outputs like .next
	cd synapse-portal && npx prettier --write .
	cd synapse-portal && npx prettier --write "../.agent/**/*.{md,json}" "../*.md"
	cd synapse-portal && npx prisma generate && npm run check
	$(MAKE) test

# Run local development with hot reload
dev:
	#$(MAKE) check
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	docker image prune -f --filter "label=com.docker.compose.project=synapse"
	@echo "⏳ Waiting for synapse-portal to start in development mode..."
	@until [ "$$(docker inspect -f '{{.State.Status}}' synapse-portal 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	@echo "🚀 Running database migrations and seeding..."
	$(MAKE) migrate
	$(MAKE) seed
	$(MAKE) link
	$(MAKE) link:antigravity

link:
	python3 scripts/utils/link_agents.py

link\:antigravity:
	@mkdir -p ~/.gemini/config/plugins
	$(MAKE) unlink:antigravity
	@mkdir -p ~/.gemini/config/plugins/synapse
	@ln -sf "$(shell pwd)/plugin.json" ~/.gemini/config/plugins/synapse/plugin.json
	@ln -sf "$(shell pwd)/.agent/skills" ~/.gemini/config/plugins/synapse/skills
	@ln -sf "$(shell pwd)/scripts" ~/.gemini/config/plugins/synapse/scripts
	@ln -sf "$(shell pwd)/.agent" ~/.gemini/config/plugins/synapse/.agent
	@ln -sf "$(shell pwd)/.env" ~/.gemini/config/plugins/synapse/.env
	@echo "✅ Linked plugin.json, skills, scripts, .agent, and .env directly to ~/.gemini/config/plugins/synapse"

# Remove the plugin link from ~/.gemini/config/plugins
unlink\:antigravity:
	@rm -rf ~/.gemini/config/plugins/synapse
	@echo "✅ Unlinked synapse plugin from ~/.gemini/config/plugins/synapse"
