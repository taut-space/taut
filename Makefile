ESLINT=./node_modules/.bin/eslint
KNEX=./node_modules/.bin/knex
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
	$(TAP) ./test/{unit,functional,integration}/*.js

coverage:
	$(TAP) ./test/{unit,functional,integration}/*.js --coverage --coverage-report=lcov

# ------------------------------------------------------------------------------

load:
	$(WRK) -t 1 -c 1 -d 60m --latency -s ./test/fixtures/post.lua http://scratch-projects-stage.us-east-1.elasticbeanstalk.com

# ------------------------------------------------------------------------------

.PHONY: start lint test coverage load
