# 🧠 Synapse Portal: Centralized Knowledge Brain

Synapse Portal is the high-performance visual control center for your local-first knowledge graph. It is designed to scale with your project's intelligence, integrating business logic, technical lessons, and agent workflows into a single, production-grade dashboard.

## 🚀 Quick Start (Production Setup)

The portal is optimized for containerized deployment using **Docker** and **PostgreSQL + pgvector**.

### 1. Environment Configuration

Copy the template to create your local environment file:

```bash
# Run from the project root
cp .env.example .env
```

Open `.env` and fill in your **GEMINI_API_KEY** to enable intelligent vector similarity features.

The portal reads system configurations from environment variables in `.env`:

- `SYNAPSE_USER_NAME`: Set this to your name so the UI can display your profile name (defaults to `User`).
- `SYNAPSE_COMMUNICATION_LANGUAGE`: Language for agent communication (e.g. `English`, `Vietnamese`).
- `SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE`: Language for generated documentation.
- `SYNAPSE_OUTPUT_FOLDER`: Folder where agent outputs are generated.

You can override catalog paths with environment variables when needed:

- `AGENT_MANIFEST_PATH`
- `SKILL_MANIFEST_PATH`

### 2. Management Commands (Makefile)

The project includes a `Makefile` to simplify common operations:

| Command        | Description                                      |
| :------------- | :----------------------------------------------- |
| `make up`      | Start all containers in background               |
| `make dev`     | Start local development stack with hot reloading |
| `make down`    | Stop and remove containers                       |
| `make build`   | Rebuild images                                   |
| `make logs`    | View live logs                                   |
| `make restart` | Restart all containers                           |
| `make migrate` | Run database migrations (prisma push)            |
| `make seed`    | Seed the database                                |
| `make shell`   | Access the portal container shell                |

Access the dashboard at: **[http://localhost:3100](http://localhost:3100)** (or the port defined in `.env` as `SYNAPSE_PORTAL_PORT`)

---

## 🛠️ Local Development Setup (with Hot Reloading)

For developers making real-time changes to the dashboard UI, the project supports containerized Next.js development mode with instant hot-reloading:

```bash
# Starts the development stack with hot reloading
make dev
```

This command:

1. Cleans up and configures Synapse agent symlinks.
2. Checks local quality standards (`make check`).
3. Builds and runs the Docker containers using the `docker-compose.dev.yml` override (targeting the multi-stage `dev` stage inside `Dockerfile`).
4. Mounts the local `./synapse-portal` directory directly to `/app` inside the container for hot-reloading.
5. Keeps container-installed packages (`node_modules`) and Next.js compilation files (`.next`) isolated from your host system using anonymous volumes.
6. Runs database schema updates (`npx prisma db push`) and seeds initial database values automatically.

---

## 🛠 Features

- **Knowledge Graph (V2)**: Interactive 2D visualization with dynamic z-indexing and enhanced node hierarchy.
- **Smart Gate & Vector Scaling (Big Data Ready)**:
  - **Semantic Deduplication**: Uses Gemini embeddings to detect similar knowledge nodes across the system.
  - **Master-Shadow Merging**: Side-by-side comparison UI to merge redundant nodes while maintaining an archive trail.
  - **Dynamic Vector Pruning**: Embeddings of inactive `COLD` tier nodes are dynamically set to `NULL` to reduce vector storage overhead and keep retrieval focused on active knowledge.
  - **Throttled Concurrency Queue**: Embedding jobs run through a background queue (maximum 3 parallel tasks) with exponential backoff + jitter retries to reduce API burst failures.
  - **Tag-Scoped Retrieval**: Context retrieval combines status/tier filters with tag scopes (`project`, `technology`, `agent`, `scope`) for high-signal matching.
  - **Garbage Collection (GC)**: Automatically prunes archived merge paths and `ARCHIVE` nodes older than 90 virtual days during REM sleep cycles to prevent database bloat.
  - **Data Portability (Current + Planned)**:
    - Current: Context export API supports JSON and Markdown output of matched nodes and tags.
    - Planned: Full offline FTS/BM25 fallback, explicit pgvector ANN index tuning (HNSW/IVFFlat), and a complete import/rehydrate pipeline.
- **pgvector Integration**: Production-grade vector search for fast, scalable knowledge retrieval.
- **i18n Support**: Full support for **English** and **Vietnamese** with type-safe translations. Dynamic language selection is supported by the agents and tools by reading the `SYNAPSE_COMMUNICATION_LANGUAGE` setting from `.env`.
- **Multi-Project Ready**: Centralized manifests for agents, skills, and configurations.

## 📁 Architecture & Services

- **Database Layer**: PostgreSQL + `pgvector` via Prisma 7 (`lib/db.ts`) with UUID-based node/tag models.
- **Knowledge Core (`lib/services/knowledge-service.ts`)**:
  - Proposal intake (`PENDING`) and metadata/tag normalization.
  - Context retrieval by scoped tags with memory-tier filtering (`ACTIVE` / `CORE` / capped `COLD`).
  - Approval / reject / merge / undo and efficacy-driven promotion (`BETA` -> `GOLD`).
- **Vector Layer (`lib/services/vector-service.ts`)**:
  - Gemini embedding generation (3072 dimensions expected).
  - Similarity search against active statuses (`APPROVED`, `BETA`, `GOLD`) using pgvector distance queries.
- **Background Queue (`lib/services/queue-service.ts`)**:
  - In-process async queue for embedding jobs.
  - Concurrency cap (`3`) + retry policy (exponential backoff + jitter).
- **REM / Forgetting Loop (`lib/services/sleep-cycle-service.ts`)**:
  - Auto-approve or propose merge for `PENDING` nodes based on similarity threshold.
  - Decay loop (`ACTIVE` -> `COLD`) based on virtual age and reinforcement score.
  - COLD-node consolidation proposals and archive garbage collection.
- **Manifest & App Config (`lib/config.ts`, `lib/services/manifest-service.ts`)**:
  - Path resolution for `manifests` catalogs.
  - CSV manifest parsing for agents and skills.
- **API Surface (`app/api/*`)**:
  - `propose`, `gate`, `gate/merge`, `gate/synthesize`, `gate/sleep-cycle`, `nodes`, `nodes/efficacy`, `context/export`, `system-config`, `audit-logs`.

## 📜 Source of Truth

The system manages intelligence across:

- **Relational Knowledge Data**: `Node`, `Tag`, `NodeTag`, `Archive`, `SystemConfig` in PostgreSQL.
- **Vector Data**: 3072-dimension embeddings in `Node.embedding` (`pgvector`), pruned for archived/cold flows when required.
- **File-Based Project Metadata**:
  - `.agent/manifests/agent-manifest.csv` and `.agent/manifests/skill-manifest.csv`: manifest catalogs.
- **Runtime Behavioral Config**:
  - Stored in `SystemConfig` table (e.g. `rem_mode_enabled`, thresholds, forget mode flags), adjustable via `/api/system-config`.

---

_Built with precision for the Synapse Ecosystem._
