const next = require('next');
const routes = require('./routes');
const { createServer } = require('http');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
	createServer(handler, (req, res) => {
		// Be sure to pass `true` as the second argument to `url.parse`.
		// This tells it to parse the query portion of the URL.
		const parsedUrl = parse(req.url, true);
		const { pathname, query } = parsedUrl;

		if (pathname === '/tour-detail/:tourId') {
			app.render(req, res, '/tour-detail', query);
		} else {
			handle(req, res, parsedUrl);
		}
	}).listen(process.env.PORT || 3000, err => {
		if (err) throw err;
			console.log('> Ready on http://localhost:3000');
	});
});
