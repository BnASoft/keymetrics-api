all: keymetrics.js keymetrics.min.js

keymetrics.js: 
	@./node_modules/.bin/browserify \
		lib/keymetrics.js \
		--standalone keymetrics \
		--outfile dist/keymetrics.js

keymetrics.min.js:
	@./node_modules/.bin/browserify \
		lib/keymetrics.js \
		--standalone keymetrics | \
		./node_modules/.bin/uglifyjs > ./dist/keymetrics.min.js

clean:
	rm dist/*

.PHONY: clean
