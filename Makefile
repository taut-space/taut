ESLINT=./node_modules/.bin/eslint
KNEX=./node_modules/.bin/knex
TAP=./node_modules/.bin/tap

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

.PHONY: start lint test coverage
