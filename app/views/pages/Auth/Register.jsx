import { Link, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';

/**
 * Renders the account-registration form.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {Record<string, string>} root0.errors Validation errors keyed by form field.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <Register />
 */
export default function Register({ errors }) {
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    /**
     * Submits the form.
     *
     * @param {import('react').FormEvent<HTMLFormElement>} e Form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };
    return (<AuthShell title="Create account" description={<>Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link></>}>
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" type="text" autoComplete="name" required value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Enter your full name" />
                {errors?.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Enter your email" />
                {errors?.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Create a password" />
                {errors?.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Confirm your password" />
                {errors?.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation[0]}</p>}
            </div>
            <Button type="submit" disabled={processing} className="w-full">{processing ? 'Creating account...' : 'Create account'}</Button>
        </form>
    </AuthShell>);
}
