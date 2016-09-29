all: keymetrics.js keymetrics.min.js

keymetrics.js: 
	@./node_modules/.bin/browserify \
		lib/keymetrics.js \
		--standalone Keymetrics \
		--outfile dist/keymetrics.js

keymetrics.min.js:
	@./node_modules/.bin/browserify \
		lib/keymetrics.js \
		--standalone Keymetrics | \
		./node_modules/.bin/uglifyjs > ./dist/keymetrics.min.js

clean:
	rm dist/*

push:
	mv ./dist/keymetrics.js ../km-front/app/lib

.PHONY: clean
