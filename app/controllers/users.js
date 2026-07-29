const userDirectory = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' }
];
/**
 * Renders the example user directory.
 *
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered users-page response.
 */
export async function index(req, res) {
    return res.render('Users', { users: userDirectory });
}
/**
 * Renders one example user or returns a JSON 404 when no ID matches.
 *
 * @param {import('express').Request} req - Request whose `id` route parameter identifies the user.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} A rendered user page or JSON error response.
 */
export async function show(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = userDirectory.find((entry) => entry.id === parseInt(id, 10));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.render('User', { user });
}
