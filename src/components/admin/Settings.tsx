import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Mail, Save, Check, CircleAlert as AlertCircle } from 'lucide-react';
import { onAuthStateChanged, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Settings() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [notificationEmail, setNotificationEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            setEmail(user?.email ?? '');
            setUsername(user?.displayName ?? '');

            // Load notification email from Firestore settings document
            if (user) {
                try {
                    const snap = await getDoc(doc(db, 'settings', 'admin'));
                    if (snap.exists()) {
                        setNotificationEmail((snap.data()?.notificationEmail as string) ?? '');
                    }
                } catch {
                    // Settings doc may not exist yet — silently ignore
                }
            }

            setLoading(false);
        });
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSaving(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No authenticated user.');
            await updateProfile(user, { displayName: username.trim() });

            // Persist notification email to Firestore
            await setDoc(doc(db, 'settings', 'admin'), { notificationEmail: notificationEmail.trim() }, { merge: true });

            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Profile update failed:', err);
            setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (!currentPassword) {
            setPasswordError('Please enter your current password.');
            return;
        }
        if (!newPassword || !confirmPassword) {
            setPasswordError('Please fill both new password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            return;
        }
        setPasswordSaving(true);
        try {
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error('No active user session.');

            // 1. Create credential with current password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // 2. Re-authenticate
            await reauthenticateWithCredential(user, credential);

            // 3. Update to new password
            await updatePassword(user, newPassword);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSaved(true);
            setTimeout(() => setPasswordSaved(false), 3000);
        } catch (err) {
            console.error('Password change failed:', err);
            let message = 'Failed to change password.';
            if (err && typeof err === 'object' && 'code' in err) {
                const code = (err as { code: string }).code;
                if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                    message = 'Current password is incorrect. Please verify and try again.';
                } else if (code === 'auth/weak-password') {
                    message = 'Password is too weak. Please choose a stronger password.';
                } else if (code === 'auth/requires-recent-login') {
                    message = 'Security timeout. Please log in again to update your password.';
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            setPasswordError(message);
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="reveal">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80"><SettingsIcon className="h-3.5 w-3.5" /> Configuration</div>
                <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Settings & Credentials</h1>
                <p className="mt-2 text-sm text-slate-500">Update your admin login credentials and notification preferences.</p>
            </div>

            {/* Profile & Notification Email */}
            <form onSubmit={handleProfileSave} className="reveal delay-1 glass-card max-w-2xl space-y-6 rounded-2xl p-6">
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-4 w-4 text-slate-400" /> Admin Email</label>
                    <input type="email" value={email} readOnly className="form-input bg-slate-50 cursor-not-allowed" />
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-4 w-4 text-slate-400" /> Display Name</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail className="h-4 w-4 text-slate-400" /> Notification Email</label>
                    <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="zel.brush.studio@gmail.com" className="form-input" />
                    <p className="mt-1.5 text-xs text-slate-400">Saved to your Firestore settings — reference this in server-side notification logic.</p>
                </div>

                {profileError && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600 animate-fade-in"><AlertCircle className="h-4 w-4 flex-shrink-0" />{profileError}</div>}
                {profileSaved && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 animate-fade-in"><Check className="h-4 w-4 flex-shrink-0" />Profile saved successfully!</div>}

                <div className="flex justify-end">
                    <button type="submit" disabled={profileSaving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)] disabled:opacity-70">
                        {profileSaving ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</> : <><Save className="h-4 w-4" /> Save Profile</>}
                    </button>
                </div>
            </form>

            {/* Password Change — its own <form> */}
            <form onSubmit={handlePasswordChange} className="reveal delay-2 glass-card max-w-2xl space-y-4 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-violet-700"><Lock className="h-4 w-4" /><h3 className="font-display text-sm font-semibold">Change Password</h3></div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min. 6 characters)" className="form-input" required />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="form-input" />
                </div>

                {passwordError && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600 animate-fade-in"><AlertCircle className="h-4 w-4 flex-shrink-0" />{passwordError}</div>}
                {passwordSaved && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 animate-fade-in"><Check className="h-4 w-4 flex-shrink-0" />Password changed successfully!</div>}

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={passwordSaving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70">
                        {passwordSaving ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</> : <><Save className="h-4 w-4" /> Change Password</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
