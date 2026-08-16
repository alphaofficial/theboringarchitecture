import { Link, router, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';

/**
 * Renders the login form and development administrator shortcut.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.status Optional outcome message displayed after an account action.
 * @param {Record<string, string>} root0.errors Validation errors keyed by form field.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <Login />
 */
export default function Login({ status, errors }) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: ''
    });
    /**
     * Submits the form.
     *
     * @param {import('react').FormEvent<HTMLFormElement>} e Form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };
    /**
     * Handle admin login.
     *
     */
    const handleAdminLogin = () => {
        router.visit('/login/admin');
    };
    return (<AuthShell eyebrow={null} title="Welcome back" description={<>Don't have an account? <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link></>}>
        {status && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Enter your email" />
                {errors?.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Enter your password" />
                {errors?.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
            </div>
            <Button type="submit" disabled={processing} className="w-full">{processing ? 'Signing in...' : 'Sign in'}</Button>
            <Button type="button" variant="outline" onClick={handleAdminLogin} disabled={processing} className="w-full">Login as admin</Button>
            <div className="text-center">
                <Link href="/forgot-password" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot your password?</Link>
            </div>
        </form>
    </AuthShell>);
}
