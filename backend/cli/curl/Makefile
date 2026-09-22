BASE_URL ?= http://127.0.0.1:8080/api
COOKIE_JAR ?= cookies.txt
REDIS_CONTAINER ?= clocess_redis
ENV_FILE ?= ../../../.env
REDIS_PASSWORD ?= $(shell grep -E '^REDIS_PASSWORD=' $(ENV_FILE) 2>/dev/null | cut -d '=' -f2-)
SESSION_ID = $(shell awk -F'\t' '$$6=="session_id"{print $$7}' $(COOKIE_JAR) 2>/dev/null)

.PHONY: ping register login logout deactivate list upload delete download get-key add-remote redis-check

ping:
	curl -s $(BASE_URL)/health/ping -w "\nHTTP %{http_code}\n"

register:
	curl -s -c $(COOKIE_JAR) -X POST $(BASE_URL)/user/create \
		-H "Content-Type: application/json" \
		-d '{"email":"$(EMAIL)","password":"$(PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"

login:
	curl -s -c $(COOKIE_JAR) -X POST $(BASE_URL)/user/login \
		-H "Content-Type: application/json" \
		-d '{"email":"$(EMAIL)","password":"$(PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"

logout:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/user/logout \
		-w "\nHTTP %{http_code}\n"

me:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/user/me \
		-w "\nHTTP %{http_code}\n"


change-password:
	curl -s -b $(COOKIE_JAR) -X PATCH $(BASE_URL)/user/settings/change_password \
		-H "Content-Type: application/json" \
		-d '{"old_password":"$(OLD_PASSWORD)","password":"$(NEW_PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"


deactivate:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/user/settings/deactivate \
		-w "\nHTTP %{http_code}\n"


list:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/file/get_all \
		-w "\nHTTP %{http_code}\n"

upload:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/file/upload \
		-F "file=@$(FILE)" \
		-F "server_host=$(SERVER_ID)" \
		-w "\nHTTP %{http_code}\n"

delete:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/file/delete \
		-H "Content-Type: application/json" \
		-d '{"file_id":$(FILE_ID)}' \
		-w "\nHTTP %{http_code}\n"

download:
	curl -s -b $(COOKIE_JAR) "$(BASE_URL)/file/download?file_id=$(FILE_ID)" \
		-o $(OUT) \
		-w "\nHTTP %{http_code}\n"

get-key:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/remote/get_key \
		-w "\nHTTP %{http_code}\n"

get-remotes:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/remote/get_remotes \
		-w "\nHTTP %{http_code}\n"

# PUBLIC_KEY must be the exact "publicClientKey" value from `make get-key`
# (valid 10 min, one shot per add-remote call) — session forgets it after.
add-remote:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/remote/add_remote \
		-H "Content-Type: application/json" \
		-d '{"host":"$(HOST)","host_user":"$(HOST_USER)","host_port":$(HOST_PORT),"base_path":"$(BASE_PATH)","public_key":"$(PUBLIC_KEY)"}' \
		-w "\nHTTP %{http_code}\n"
