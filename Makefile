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
	docker-compose down -v

# Color and formatting
CG = \033[0;32m
CR = \033[0;36m
CEND = \033[0m
CC = \033[0;31m
B = \033[1m
NEW_BUFFER = \033[H\033[2J
LOGO = "\n\t$(CR)🚀 LeetGaming$(CEND).PRO\n\n"