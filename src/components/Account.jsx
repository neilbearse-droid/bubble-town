import { useEffect, useState } from 'react';
import { signUp, signIn, signOut, currentUser, getProfile, onAuthChange, uploadAvatar } from '../lib/account.js';
import { generateAvatarBlob, generateAvatarUrl } from '../lib/avatar.js';

// Palette (matches the game)
const DARK = '#2E2059', LIGHT = '#ECE7FA', CARD = '#ffffff';
const ACCENT = '#A24BFF', PINK = '#FF6FB5';

const field = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '2px solid #E3DCF5', fontSize: 15, outline: 'none', background: '#FBFAFF', boxSizing: 'border-box' };
const btn = (bg) => ({ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: bg, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 6px 14px rgba(60,40,90,.18)' });

// Account / sign-in panel. `chars` are the player's characters (used to make the
// head avatar). The game works fully without ever opening this.
export default function Account({ onClose, chars = [], onBadge }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('login');           // 'login' | 'signup'
  const [form, setForm] = useState({ screenname: '', parentEmail: '', password: '' });
  const [pick, setPick] = useState(0);                  // which character → avatar
  const [preview, setPreview] = useState('');           // local avatar preview url
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const off = onAuthChange(async (u) => {
      setUser(u);
      setProfile(u ? await getProfile().catch(() => null) : null);
      setLoading(false);
    });
    (async () => {
      const u = await currentUser().catch(() => null);
      setUser(u);
      if (u) setProfile(await getProfile().catch(() => null));
      setLoading(false);
    })();
    return off;
  }, []);

  // local avatar preview for the chosen character (no upload)
  useEffect(() => {
    let url;
    if (chars[pick]) generateAvatarUrl(chars[pick], 200).then((u) => { url = u; setPreview(u); }).catch(() => {});
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [pick, chars]);

  // Keep the header badge (avatar + screenname) in sync once we know the real state.
  useEffect(() => {
    if (!onBadge || loading) return;
    onBadge(profile ? { avatar_url: profile.avatar_url, screenname: profile.screenname } : null);
  }, [profile, loading, onBadge]);

  const fail = (e) => { setErr(e?.message || String(e)); setBusy(false); };

  const doSignup = async () => {
    setErr(''); setBusy(true);
    try {
      await signUp(form);
      // generate + upload the head avatar from the chosen character
      if (chars[pick]) { const blob = await generateAvatarBlob(chars[pick], 256); await uploadAvatar(blob); }
      setProfile(await getProfile());
      setNote('Account created! 🎉');
    } catch (e) { fail(e); return; }
    setBusy(false);
  };

  const doLogin = async () => {
    setErr(''); setBusy(true);
    try { await signIn(form); setProfile(await getProfile()); } catch (e) { fail(e); return; }
    setBusy(false);
  };

  const doSignout = async () => { setBusy(true); await signOut().catch(() => {}); setProfile(null); setUser(null); setBusy(false); };

  const setPhotoFrom = async (i) => {
    setBusy(true); setErr('');
    try { const blob = await generateAvatarBlob(chars[i], 256); const url = await uploadAvatar(blob); setProfile((p) => ({ ...p, avatar_url: url })); }
    catch (e) { fail(e); return; }
    setBusy(false);
  };

  const Backdrop = (inner) => (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,50,.55)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: CARD, borderRadius: 24, padding: 22, boxShadow: '0 20px 50px rgba(20,10,40,.45)', maxHeight: '92vh', overflowY: 'auto' }}>
        {inner}
      </div>
    </div>
  );

  const closeBtn = (
    <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#9A8FBF' }}>✕</button>
  );

  if (loading) return Backdrop(<div style={{ textAlign: 'center', padding: 24, color: DARK }}>…</div>);

  // ── signed in: profile ──────────────────────────────────────────────────
  if (profile) {
    return Backdrop(
      <div style={{ position: 'relative', textAlign: 'center' }}>
        {closeBtn}
        <div style={{ width: 104, height: 104, margin: '4px auto 10px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${ACCENT}`, boxShadow: '0 6px 16px rgba(60,40,90,.25)', background: '#cfeaff' }}>
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: DARK }}>{profile.screenname}</div>
        <div style={{ marginTop: 10, display: 'inline-block', background: LIGHT, borderRadius: 12, padding: '8px 14px', color: DARK, fontWeight: 800, letterSpacing: 1 }}>
          {profile.friend_code}
          <button onClick={() => { navigator.clipboard?.writeText(profile.friend_code); setNote('Friend code copied!'); }}
            style={{ marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>📋</button>
        </div>
        <div style={{ fontSize: 12, color: '#9A8FBF', marginTop: 4 }}>your friend code — share it with a friend to connect</div>

        {chars.length > 0 && (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 6 }}>Change photo</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {chars.map((c, i) => <CharHead key={i} c={c} onClick={() => setPhotoFrom(i)} />)}
            </div>
          </div>
        )}

        {err && <div style={{ color: '#D6336C', fontSize: 13, marginTop: 10 }}>{err}</div>}
        {note && <div style={{ color: '#2B9348', fontSize: 13, marginTop: 8 }}>{note}</div>}
        <button disabled={busy} onClick={doSignout} style={{ ...btn('#6B5B95'), marginTop: 16, opacity: busy ? 0.6 : 1 }}>Log out</button>
      </div>
    );
  }

  // ── signed out: login / signup ──────────────────────────────────────────
  return Backdrop(
    <div style={{ position: 'relative' }}>
      {closeBtn}
      <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: DARK, marginBottom: 4 }}>{mode === 'login' ? 'Welcome back!' : 'Create your account'}</div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#9A8FBF', marginBottom: 16 }}>Accounts let you save online and visit friends.</div>

      {mode === 'signup' && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ width: 92, height: 92, margin: '0 auto 6px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${PINK}`, background: '#cfeaff' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          {chars.length > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {chars.map((_, i) => <button key={i} onClick={() => setPick(i)} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === pick ? ACCENT : '#D9D0F0' }} />)}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#9A8FBF' }}>your photo — pick which character</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        <input style={field} placeholder="Screenname" autoCapitalize="none" value={form.screenname}
          onChange={(e) => setForm({ ...form, screenname: e.target.value })} />
        {mode === 'signup' && (
          <input style={field} placeholder="Parent's email" type="email" autoCapitalize="none" value={form.parentEmail}
            onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
        )}
        <input style={field} placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>

      {err && <div style={{ color: '#D6336C', fontSize: 13, marginTop: 10 }}>{err}</div>}

      <div style={{ marginTop: 16 }}>
        <button disabled={busy} onClick={mode === 'login' ? doLogin : doSignup} style={{ ...btn(`linear-gradient(${ACCENT},${PINK})`), opacity: busy ? 0.6 : 1 }}>
          {busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: DARK }}>
        {mode === 'login' ? "New here? " : 'Already have an account? '}
        <button onClick={() => { setErr(''); setMode(mode === 'login' ? 'signup' : 'login'); }} style={{ border: 'none', background: 'transparent', color: ACCENT, fontWeight: 800, cursor: 'pointer' }}>
          {mode === 'login' ? 'Create one' : 'Log in'}
        </button>
      </div>
      {mode === 'login' && <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#9A8FBF' }}>Forgot password? Ask a parent (reset coming soon).</div>}
    </div>
  );
}

// Small circular head preview for the character picker.
function CharHead({ c, onClick }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let u; generateAvatarUrl(c, 120).then((x) => { u = x; setUrl(x); }).catch(() => {});
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [c]);
  return (
    <button onClick={onClick} style={{ flex: '0 0 auto', width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid #E3DCF5', cursor: 'pointer', background: '#cfeaff', padding: 0 }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
    </button>
  );
}
