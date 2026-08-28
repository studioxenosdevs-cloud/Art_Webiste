import { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Mail, Save, Check, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { credentials, updateCredentials } = useAuth();
  const [username, setUsername] = useState(credentials.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationEmail, setNotificationEmail] = useState(credentials.notificationEmail);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username cannot be empty.'); return; }
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (newPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    }
    const patch: { username: string; notificationEmail: string; password?: string } = { username: username.trim(), notificationEmail: notificationEmail.trim() };
    if (newPassword) patch.password = newPassword;
    updateCredentials(patch);
    setNewPassword('');
    setConfirmPassword('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="reveal">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80"><SettingsIcon className="h-3.5 w-3.5" /> Configuration</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Settings & Credentials</h1>
        <p className="mt-2 text-sm text-slate-500">Update your admin login credentials and notification preferences. Changes are stored locally.</p>
      </div>

      <form onSubmit={handleSave} className="reveal delay-1 glass-card max-w-2xl space-y-6 rounded-2xl p-6">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-4 w-4 text-slate-400" /> Admin Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail className="h-4 w-4 text-slate-400" /> Notification Email</label>
          <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="zel.brush.studio@gmail.com" className="form-input" />
          <p className="mt-1.5 text-xs text-slate-400">New customer inquiries will be sent to this email address.</p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4 flex items-center gap-2 text-violet-700"><Lock className="h-4 w-4" /><h3 className="font-display text-sm font-semibold">Change Password</h3></div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="form-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="form-input" />
            </div>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600 animate-fade-in"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
        {saved && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 animate-fade-in"><Check className="h-4 w-4 flex-shrink-0" />Settings saved successfully!</div>}

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)]"><Save className="h-4 w-4" /> Save Changes</button>
        </div>
      </form>
    </div>
  );
}
