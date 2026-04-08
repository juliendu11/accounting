DATA_DIR := data/mariadb
MARIADB_UID := 999

.PHONY: dev down

dev:
	@mkdir -p $(DATA_DIR)
	@if [ "$$(stat -c '%u' $(DATA_DIR))" != "$(MARIADB_UID)" ]; then \
		echo "Fixing $(DATA_DIR) ownership to $(MARIADB_UID):$(MARIADB_UID)..."; \
		sudo chown -R $(MARIADB_UID):$(MARIADB_UID) $(DATA_DIR); \
	fi
	docker compose -f docker-compose.dev.yml up

down:
	docker compose -f docker-compose.dev.yml down
