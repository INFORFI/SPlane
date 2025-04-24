up:
	docker compose -f docker-compose.dev.yml up

up-build:
	docker compose -f docker-compose.dev.yml up --build

down-volumes:
	docker compose -f docker-compose.dev.yml down -v

down:
	docker compose -f docker-compose.dev.yml down


