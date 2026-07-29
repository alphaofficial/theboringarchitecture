import { Link, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell.jsx';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';
/**
 * Renders the form for replacing a password from an emailed reset link.
 *
 * @param {{
 *   token: string,
 *   email: string,
 *   errors?: {token?: string[], password?: string[], password_confirmation?: string[]}
 * }} props - Reset-link identity and field errors.
 * @returns {import('react').ReactElement} The password-reset page.
 */
export default function ResetPassword({ token, email, errors }) {
    const { data, setData, post, processing } = useForm({
        token,
        email,
        password: '',
        password_confirmation: ''
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };
    return (<AuthShell title="Reset your password" description="Enter a new password for your account.">
            {errors?.token && (<div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{errors.token[0]}</p>
                </div>)}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <input type="hidden" value={data.token} onChange={() => { }}/>
                <input type="hidden" value={data.email} onChange={() => { }}/>

                <div>
                    <Label htmlFor="password">
									New password
							</Label>
                    <Input id="password" name="password" type="password" autoComplete="new-password" required value={data.password} onChange={e => setData('password', e.target.value)} className="mt-2" placeholder="At least 8 characters"/>
                    {errors?.password && (<p className="mt-2 text-sm text-destructive">{errors.password[0]}</p>)}
                </div>

                <div>
                    <Label htmlFor="password_confirmation">
									Confirm password
							</Label>
                    <Input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="mt-2" placeholder="Repeat your new password"/>
                    {errors?.password_confirmation && (<p className="mt-2 text-sm text-destructive">{errors.password_confirmation[0]}</p>)}
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Resetting...' : 'Reset password'}
                </Button>

                <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthShell>);
}
