/**
 * Renders the public home page with the current server timestamp.
 *
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered Inertia response.
 */
export async function index(req, res) {
    return res.render('Home', {
        timestamp: new Date().toISOString(),
    });
}
