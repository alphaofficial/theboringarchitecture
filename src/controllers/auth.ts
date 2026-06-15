import { Request, Response } from 'express';
import * as auth from '@/core/auth';

/**
 * Render the login page and optionally show a password reset success message.
 */
export async function showLogin(req: Request, res: Response) {
	const status = req.query.reset === '1' ? 'Your password has been reset. You may now sign in.' : undefined;
	return res.render('Auth/Login', { status });
}

/**
 * Render the registration page.
 */
export async function showRegister(req: Request, res: Response) {
	return res.render('Auth/Register');
}

/**
 * Attempt to authenticate the current request and start a session on success.
 */
export async function login(req: Request, res: Response) {
	const result = await auth.attemptLogin(req.database, req.body);
	if (!result.ok) {
		return res.render('Auth/Login', { errors: result.errors });
	}
	await req.authenticate(result.user);
	return res.redirect('/home');
}

/**
 * Attempt to register a new user and authenticate them into the current session.
 */
export async function register(req: Request, res: Response) {
	const result = await auth.attemptRegister(req.database, req.body);
	if (!result.ok) {
		return res.render('Auth/Register', { errors: result.errors });
	}

	await req.authenticate(result.user);
	return res.redirect('/verify-email');
}

/**
 * End the current authenticated session.
 */
export async function logout(req: Request, res: Response) {
	try {
		await req.logout();
		res.redirect('/login');
	} catch (err: any) {
		console.error('Session destruction error:', err);
		res.redirect('/login');
	}
}

/**
 * Render the authenticated dashboard.
 */
export async function dashboard(req: Request, res: Response) {
	const user = await req.user();
	return res.render('Dashboard', { user });
}

/**
 * Render the forgot password page.
 */
export async function showForgotPassword(req: Request, res: Response) {
	return res.render('Auth/ForgotPassword');
}

/**
 * Attempt to create and email a password reset link.
 */
export async function forgotPassword(req: Request, res: Response) {
	const result = await auth.attemptForgotPassword(req.database, req.body);
	if (!result.ok) {
		return res.render('Auth/ForgotPassword', { errors: result.errors });
	}

	return res.render('Auth/ForgotPassword', {
		status: 'We have emailed your password reset link!',
	});
}

/**
 * Render the reset password page with the incoming token and email.
 */
export async function showResetPassword(req: Request, res: Response) {
	return res.render('Auth/ResetPassword', {
		token: req.params.token,
		email: typeof req.query.email === 'string' ? req.query.email : '',
	});
}

/**
 * Attempt to replace the user's password using a reset token.
 */
export async function resetPassword(req: Request, res: Response) {
	const result = await auth.attemptResetPassword(req.database, req.body);
	if (!result.ok) {
		return res.render('Auth/ResetPassword', result);
	}

	return res.redirect('/login?reset=1');
}

/**
 * Render the email verification page for the current user.
 */
export async function showVerifyEmail(req: Request, res: Response) {
	const user = await req.user();
	return res.render('Auth/VerifyEmail', { email: user?.email });
}

/**
 * Attempt to verify the email address represented by the signed token.
 */
export async function verifyEmail(req: Request, res: Response) {
	const token = typeof req.params.token === 'string' ? req.params.token : '';
	const result = await auth.attemptVerifyEmail(req.database, token);

	if (!result.ok) {
		const user = result.error === 'expired' ? await req.user() : null;
		const message =
			result.error === 'expired'
				? 'This verification link has expired. Please request a new one.'
				: 'This verification link is invalid.';

		return res.render('Auth/VerifyEmail', {
			email: user?.email,
			errors: { email: [message] },
		});
	}

	return res.redirect('/home');
}

/**
 * Send a fresh verification email to the current authenticated user.
 */
export async function resendVerification(req: Request, res: Response) {
	const user = await req.user();

	if (!user) {
		return res.redirect('/login');
	}

	const result = await auth.resendVerification(user);

	return res.render('Auth/VerifyEmail', {
		email: user.email,
		status: result.status,
	});
}
