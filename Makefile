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
	$(WRK) -t 2 -c 2 -d 10s --latency http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/health
	$(WRK) -t 2 -c 2 -d 10s --latency http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/114137267
	$(WRK) -t 2 -c 2 -d 10s --latency -s ./test/fixtures/post.lua http://scratch-projects-stage.us-east-1.elasticbeanstalk.com
	$(WRK) -t 2 -c 2 -d 10s --latency -s ./test/fixtures/put.lua http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/114137267

# ------------------------------------------------------------------------------

.PHONY: start lint test coverage load
