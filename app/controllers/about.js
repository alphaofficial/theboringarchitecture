/**
 * Renders the public About page.
 *
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered Inertia response.
 */
export async function index(req, res) {
    return res.render('About', {
        title: 'About',
        description: 'This app uses Express for routing, Inertia for page responses, and React for views.',
    });
}
