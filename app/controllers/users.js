const userDirectory = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' }
];

/**
 * Renders the example user directory.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/users', index);
 */
export async function index(req, res) {
    return res.render('Users', { users: userDirectory });
}

/**
 * Renders one example user or returns a JSON 404 when no ID matches.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/users/:id', show);
 */
export async function show(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = userDirectory.find((entry) => entry.id === parseInt(id, 10));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.render('User', { user });
}
