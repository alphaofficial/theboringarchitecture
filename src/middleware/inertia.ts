import { type Request, type Response, type NextFunction } from 'express';
import { InertiaExpressAdapter } from '../adapters/InertiaExpressAdapter';
import variables from '../config/variables';
import * as fs from 'fs';
import * as path from 'path';

const templatePath = path.join(process.cwd(), 'public', 'template.html');

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

function renderToHtml(result: any, title?: string, head?: string): string {
	const template = fs.readFileSync(templatePath, 'utf-8');
	return template
		.replace('{{TITLE}}', escapeHtml(title || variables.APP_NAME))
		.replace('{{HEAD}}', head || '')
		.replace('{{PAGE_DATA}}', escapeHtml(JSON.stringify(result)))
		.replace('{{CLIENT_ENTRY}}', '/app.js');
}

declare module 'express-serve-static-core' {
	interface Request {
		inertia: InertiaExpressAdapter;
	}
}

export class InertiaExpressMiddleware {
	static async apply(req: Request, res: Response, next: NextFunction) {
		const inertia = new InertiaExpressAdapter({ version: '1' });

		const user = await req.user();
		const isAuthenticated = req.is_authenticated();

		inertia.share({
			applicationName: variables.APP_NAME,
			isAuthenticated,
			user: user ? { id: user.id, name: user.name, email: user.email } : null,
		});

		req.inertia = inertia;

		// Override res.render so controllers can call res.render('Page', props)
		res.render = ((view: string, props: Record<string, any> = {}) => {
			const result = inertia.render(req, res, view, props);

			if (!res.headersSent) {
				res.send(renderToHtml(result, props._title, props._head));
			}
		}) as any;

		next();
	}
}
