import { Link, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell.jsx';
import { Button } from '@/views/components/ui/button';
/**
 * Renders email-verification guidance and the resend action.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.email Email address associated with the account.
 * @param {string} root0.status Optional outcome message displayed after an account action.
 * @param {Record<string, string>} root0.errors Validation errors keyed by form field.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <VerifyEmail />
 */
export default function VerifyEmail({ email, status, errors }) {
    const { post, processing } = useForm({});
    /**
     * Handle resend.
     *
     * @param {import('react').FormEvent<HTMLFormElement>} e Form submission event.
     */
    const handleResend = (e) => {
        e.preventDefault();
        post('/email/resend-verification');
    };
    return (<AuthShell title="Verify your email" description={<>We sent a verification link to <strong>{email}</strong>. Check your inbox and click the link to activate your account.</>}>
            {status && (<div className="mb-4 rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-sm text-foreground">{status}</p>
                </div>)}

            {errors?.email && (<div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{errors.email[0]}</p>
                </div>)}

            <form onSubmit={handleResend} className="space-y-4">
                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Sending...' : 'Resend verification email'}
                </Button>
            </form>

            <div className="mt-4 text-center">
                <Link href="/logout" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Sign out
                </Link>
            </div>
        </AuthShell>);
}
