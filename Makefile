up:
	docker compose -f docker-compose.yml -p tetris build --parallel && \
	docker compose -p tetris -f docker-compose.yml up --detach

down:
	docker compose -p fhir-dev -f docker-compose.yml down && \
	docker system prune -f

restart:
	make down && make up

logs:
	docker logs --follow tetris-express-1
