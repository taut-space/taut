ESLINT=./node_modules/.bin/eslint
TAP=./node_modules/.bin/tap
WRK=/usr/local/bin/wrk

# ------------------------------------------------------------------------------

start:
	node server.js

# ------------------------------------------------------------------------------

lint:
	$(ESLINT) ./*.js
	$(ESLINT) ./lib/*.js
	$(ESLINT) ./test/**/*.js

test:
	@make lint
	$(TAP) ./test/unit/*.js

coverage:
	$(TAP) ./test/unit/*.js --coverage --coverage-report=lcov

# ------------------------------------------------------------------------------

smoke:
	@echo 'Running smoke tests against SMOKE_HOST'
	@echo 'Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set when targeting `localhost`.'
	@echo 'See README.md for details.'
	$(TAP) ./test/smoke/*.js

docker-build:
	docker build -t taut:latest .

docker-quick-bash:
	docker run --hostname taut --rm -v $(PWD):/var/current/app -it taut bash

docker-run:
	docker-compose up -d

getload:
	$(WRK) -t 2 -c 2 -d 10s --latency http://$(TAUT_AWS_EB_STAGING)/health
	$(WRK) -t 2 -c 2 -d 10s --latency http://$(TAUT_AWS_EB_STAGING)/eed459aa6ca84d7403768731519d60d3.png

upload:
	rm -f ./tmp/*.dat
	./test/fixtures/gen_random_md5_files.sh
	$(WRK) -t 2 -c 4 -d 20s --latency --timeout 5s -s ./test/fixtures/post_a_lot.lua http://$(TAUT_AWS_EB_STAGING)/
# ------------------------------------------------------------------------------

.PHONY: start lint test coverage smoke load
