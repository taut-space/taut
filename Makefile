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

load:
	$(WRK) -t 2 -c 2 -d 10s --latency http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/health
	$(WRK) -t 2 -c 2 -d 10s --latency http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/crossdomain.xml
	$(WRK) -t 2 -c 2 -d 10s --latency http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/114137267
	$(WRK) -t 2 -c 2 -d 10s --latency -s ./test/fixtures/post.lua http://scratch-projects-stage.us-east-1.elasticbeanstalk.com
	$(WRK) -t 2 -c 2 -d 10s --latency -s ./test/fixtures/put.lua http://scratch-projects-stage.us-east-1.elasticbeanstalk.com/114137267

# ------------------------------------------------------------------------------

.PHONY: start lint test coverage smoke load
