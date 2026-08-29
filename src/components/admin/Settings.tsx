import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Mail, Save, Check, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Settings() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [notificationEmail, setNotificationEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (!mounted) return;
                setEmail(user?.email ?? '');
                const meta: any = (user as any)?.user_metadata ?? {};
                setUsername(meta?.username ?? '');
                setNotificationEmail(meta?.notificationEmail ?? '');
            } catch (err: any) {
                console.error('Failed to load user:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const meta = { username: username.trim(), notificationEmail: notificationEmail.trim() };
            const { error } = await supabase.auth.updateUser({ data: meta });
            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error('Profile update failed:', err);
            setError(err.message ?? 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newPassword || !confirmPassword) { setError('Please fill both password fields.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setNewPassword('');
            setConfirmPassword('');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error('Password change failed:', err);
            setError(err.message ?? 'Failed to change password.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading settings…</div>;

    return (
        <div className="space-y-6">
            <div className="reveal">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80"><SettingsIcon className="h-3.5 w-3.5" /> Configuration</div>
                <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Settings & Credentials</h1>
                <p className="mt-2 text-sm text-slate-500">Update your admin login credentials and notification preferences. Changes are saved to your Supabase account metadata.</p>
            </div>

            <form onSubmit={handleProfileSave} className="reveal delay-1 glass-card max-w-2xl space-y-6 rounded-2xl p-6">
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-4 w-4 text-slate-400" /> Admin Email</label>
                    <input type="email" value={email} readOnly className="form-input bg-slate-50 cursor-not-allowed" />
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-4 w-4 text-slate-400" /> Admin Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail className="h-4 w-4 text-slate-400" /> Notification Email</label>
                    <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="zel.brush.studio@gmail.com" className="form-input" />
                    <p className="mt-1.5 text-xs text-slate-400">New customer inquiries will be sent to this email address.</p>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)]"><Save className="h-4 w-4" /> Save Profile</button>
                </div>

                <div className="border-t border-slate-200 pt-6">
                    <div className="mb-4 flex items-center gap-2 text-violet-700"><Lock className="h-4 w-4" /><h3 className="font-display text-sm font-semibold">Change Password</h3></div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="form-input" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="form-input" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handlePasswordChange} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white"><Save className="h-4 w-4" /> Change Password</button>
                        </div>
                    </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600 animate-fade-in"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
                {saved && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 animate-fade-in"><Check className="h-4 w-4 flex-shrink-0" />Settings saved successfully!</div>}

            </form>
        </div>
    );
}
