.PHONY: docker
.PHONY: docker-down

build:
	@echo "Building Next.js application"
	docker build -t leetgaming.pro .

start:
	@echo "Starting Next.js application"
	docker run -d --name leetgaming-pro -p 3030:3030 leetgaming.pro

stop:
	@echo "Stopping Next.js application"
	docker stop leetgaming-pro

rm:
	@echo "Removing Next.js application container"
	docker rm leetgaming-pro

rebuild: stop rm build start
	@echo "Rebuilding and restarting Next.js application"

docker:
	@clear
	@printf "$(NEW_BUFFER)"
	@echo $(LOGO)
	@echo "♻️ $(CG)Removing$(CEND) containers and volumes"
	docker-compose down -v
	@echo "🔨 $(CC)Building$(CEND) new containers"
	docker-compose build
	@echo "🚀 $(CR)⦿ Running$(CEND) containers"
	docker-compose up -d

docker-down:
	@clear
	@printf "$(NEW_BUFFER)"
	@echo $(LOGO)
	@echo "♻️ $(CG)Removing$(CEND) containers and volumes"
	docker-compose down -v --remove-orphans

docker-clean: docker-down ## Clean containers, volumes, and images
	@echo "🧹 $(CC)Removing$(CEND) images and pruning..."
	docker rmi -f leetgaming.pro 2>/dev/null || true
	docker rmi -f leetgaming-web:latest 2>/dev/null || true
	docker system prune -f --volumes 2>/dev/null || true
	@echo "$(CG)✓ Clean complete$(CEND)"

kill-ports: ## Kill processes on web ports (3030)
	@echo "🔪 $(CC)Killing$(CEND) processes on port 3030..."
	@pids=$$(lsof -ti :3030 2>/dev/null || true); \
	if [ -n "$$pids" ]; then \
		echo "  Killing PIDs: $$pids"; \
		echo "$$pids" | xargs kill -9 2>/dev/null || true; \
	else \
		echo "  No processes on port 3030"; \
	fi
	@echo "$(CG)✓ Port 3030 cleared$(CEND)"

nuke: kill-ports docker-clean ## Full cleanup: kill ports, remove all containers and images
	@rm -rf .next node_modules/.cache 2>/dev/null || true
	@echo "$(CG)✓ Nuke complete$(CEND)"

# Color and formatting
CG = \033[0;32m
CR = \033[0;36m
CEND = \033[0m
CC = \033[0;31m
B = \033[1m
NEW_BUFFER = \033[H\033[2J
LOGO = "\n\t$(CR)🚀 LeetGaming$(CEND).PRO\n\n"