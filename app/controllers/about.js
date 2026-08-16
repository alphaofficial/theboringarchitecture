/**
 * Renders the public About page.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/about', index);
 */
export async function index(req, res) {
    return res.render('About', {
        title: 'About',
        description: 'This app uses Express for routing, Inertia for page responses, and React for views.',
    });
}
