import { Link, useForm } from '@inertiajs/react';
import AuthShell from '@/views/components/AuthShell';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';

function FieldError({ errors, name }) {
    return errors?.[name] ? <p className="text-sm text-destructive">{errors[name][0]}</p> : null;
}

export default function Settings({ user, status, errors }) {
    const profile = useForm({ name: user?.name || '', email: user?.email || '' });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });
    const deletion = useForm({ password: '' });

    return (<AuthShell title="Account settings" description="Manage account details, password, and account removal.">
        {status && <div className="mb-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">{status}</div>}

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); profile.post('/settings/profile'); }}>
            <h3 className="font-semibold text-foreground">Profile</h3>
            <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={profile.data.name} onChange={e => profile.setData('name', e.target.value)} />
                <FieldError errors={errors} name="name" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={profile.data.email} onChange={e => profile.setData('email', e.target.value)} />
                <FieldError errors={errors} name="email" />
            </div>
            <Button type="submit" disabled={profile.processing}>Save profile</Button>
        </form>

        <form className="mt-8 space-y-4 border-t border-border pt-6" onSubmit={(e) => { e.preventDefault(); password.post('/settings/password'); }}>
            <h3 className="font-semibold text-foreground">Password</h3>
            <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input id="current_password" type="password" value={password.data.current_password} onChange={e => password.setData('current_password', e.target.value)} />
                <FieldError errors={errors} name="current_password" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password.data.password} onChange={e => password.setData('password', e.target.value)} />
                <FieldError errors={errors} name="password" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input id="password_confirmation" type="password" value={password.data.password_confirmation} onChange={e => password.setData('password_confirmation', e.target.value)} />
                <FieldError errors={errors} name="password_confirmation" />
            </div>
            <Button type="submit" disabled={password.processing}>Update password</Button>
        </form>

        <form className="mt-8 space-y-4 border-t border-border pt-6" onSubmit={(e) => { e.preventDefault(); deletion.post('/settings/delete'); }}>
            <h3 className="font-semibold text-destructive">Delete account</h3>
            <p className="text-sm text-muted-foreground">This permanently removes your user account and active sessions.</p>
            <div className="space-y-2">
                <Label htmlFor="delete_password">Confirm password</Label>
                <Input id="delete_password" type="password" value={deletion.data.password} onChange={e => deletion.setData('password', e.target.value)} />
                <FieldError errors={errors} name="password" />
            </div>
            <Button type="submit" disabled={deletion.processing} variant="destructive">Delete account</Button>
        </form>

        <p className="mt-6 text-center text-sm"><Link href="/home" className="font-medium underline">Back to dashboard</Link></p>
    </AuthShell>);
}
