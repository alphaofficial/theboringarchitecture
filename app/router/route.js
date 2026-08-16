import { Router } from './routing.js';
import * as PublicController from '../controllers/public.js';
import * as AboutController from '../controllers/about.js';
import * as UsersController from '../controllers/users.js';
import * as AuthController from '../controllers/auth.js';
import { applyInertia } from '../middleware/inertia.js';
import { auth, guest } from '../middleware/auth.js';
import { authRateLimit, featureRateLimit } from '../middleware/rateLimit.js';

const route = Router.create();

route.use(applyInertia);
route.post(['/login', '/register', '/forgot-password', '/reset-password'], authRateLimit());
route.post('/email/resend-verification', featureRateLimit());

route.group({ middleware: [guest] }, guests => {
    guests.get('/login', AuthController.showLogin);
    guests.get('/login/admin', AuthController.loginAsAdmin);
    guests.post('/login', AuthController.login);
    guests.get('/register', AuthController.showRegister);
    guests.post('/register', AuthController.register);
    guests.get('/forgot-password', AuthController.showForgotPassword);
    guests.post('/forgot-password', AuthController.forgotPassword);
    guests.get('/reset-password/:token', AuthController.showResetPassword);
    guests.post('/reset-password', AuthController.resetPassword);
});

route.get('/', PublicController.index);

route.group({ middleware: [auth] }, authenticated => {
    authenticated.get('/verify-email', AuthController.showVerifyEmail);
    authenticated.get('/verify-email/:token', AuthController.verifyEmail);
    authenticated.post('/email/resend-verification', AuthController.resendVerification);

    authenticated.group('/settings', settings => {
        settings.get('/', AuthController.showSettings);
        settings.post('/profile', AuthController.updateProfile);
        settings.post('/password', AuthController.updatePassword);
        settings.post('/delete', AuthController.deleteAccount);
    });

    authenticated.get('/about', AboutController.index);
    authenticated.get('/home', AuthController.dashboard);
    authenticated.post('/logout', AuthController.logout);
    authenticated.get('/users', UsersController.index);
    authenticated.get('/users/:id', UsersController.show);
});

/** Exports the application router with public, guest, and authenticated routes registered. */
export default route;
