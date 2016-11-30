/**
 * Created by jack on 16-11-27.
 */

import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import { createRenderer, createBundleRenderer } from 'vue-server-renderer';

const app = new Koa();

const PUBLIC_PATH = path.resolve(__dirname, '../client');
const indexHTML = fs.readFileSync(PUBLIC_PATH + '/index.temp.html', 'utf8');
const render = createBundleRenderer(fs.readFileSync(PUBLIC_PATH + '/server.app.js', 'utf-8'));

const generatorHtml = (str, initState) => {
	const [header, footer] = indexHTML.split('<blog></blog>');
	return `${header}${str}<script>window.__INITIAL_STATE__=${JSON.stringify(initState)}</script>${footer}`;
};

const renderServer = async ctx => {
	// Have to create a promise, because koa don't wait for render callback
	await new Promise((resolve, reject) => {
		const context = { url: ctx.url };
		render.renderToString(
			context,
			(error, vueApp) => {
				if (error) {
					// server console
					console.error(error);

					// response error message
					ctx.status = 500;
					ctx.body = error;

					reject(error);
				}
				ctx.body = generatorHtml(vueApp, context.initialState);
				resolve();
			});
	});
};

app.use(renderServer);

export default app;