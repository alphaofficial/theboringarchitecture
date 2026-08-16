import { Link, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell.jsx';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';
/**
 * Renders the email form used to request a password-reset link.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.status Optional outcome message displayed after an account action.
 * @param {Record<string, string>} root0.errors Validation errors keyed by form field.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <ForgotPassword />
 */
export default function ForgotPassword({ status, errors }) {
    const { data, setData, post, processing } = useForm({
        email: ''
    });
    /**
     * Submits the form.
     *
     * @param {import('react').FormEvent<HTMLFormElement>} e Form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };
    return (<AuthShell title="Forgot your password?" description="Enter your email and we'll send you a reset link.">
            {status && (<div className="mb-4 rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-sm text-foreground">{status}</p>
                </div>)}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="email">
									Email address
							</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" required value={data.email} onChange={e => setData('email', e.target.value)} className="mt-2" placeholder="Enter your email"/>
                    {errors?.email && (<p className="mt-2 text-sm text-destructive">{errors.email[0]}</p>)}
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Sending...' : 'Send reset link'}
                </Button>

                <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthShell>);
}
