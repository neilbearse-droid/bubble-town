import { useEffect, useState } from 'react';
import { signUp, signIn, signOut, currentUser, getProfile, onAuthChange, uploadAvatar,
  listFriends, incomingRequests, sendFriendRequest, acceptRequest, declineRequest,
  inbox, markNotesRead } from '../lib/account.js';
import { generateAvatarBlob, generateAvatarUrl } from '../lib/avatar.js';
import { presetText } from '../lib/notes.js';
import { randomChar } from '../data/buildings.js';

// Palette (matches the game)
const DARK = '#2E2059', LIGHT = '#ECE7FA', CARD = '#ffffff';
const ACCENT = '#A24BFF', PINK = '#FF6FB5';

const field = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '2px solid #E3DCF5', fontSize: 15, outline: 'none', background: '#FBFAFF', boxSizing: 'border-box' };
const btn = (bg) => ({ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: bg, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 6px 14px rgba(60,40,90,.18)' });
const linkBtn = { border: 'none', background: 'transparent', color: '#9A8FBF', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' };

const lookOf = (c) => `${c.skinKey}|${c.hairKey}|${c.topKey}|${c.hatKey}`;
// Build ~6 distinct avatar looks: the player's own characters first, padded with
// freshly generated ones so there's always a nice spread to pick from.
function buildOptions(chars) {
  const seen = new Set(), opts = [];
  for (const c of chars) { const k = lookOf(c); if (!seen.has(k)) { seen.add(k); opts.push(c); } }
  let guard = 0;
  while (opts.length < 6 && guard++ < 40) { const r = randomChar(); const k = lookOf(r); if (!seen.has(k)) { seen.add(k); opts.push(r); } }
  return opts.slice(0, 6);
}

export default function Account({ onClose, chars = [], onBadge, onAuthEvent, onVisit, onUnread }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('login');           // 'login' | 'signup'
  const [form, setForm] = useState({ screenname: '', parentEmail: '', password: '' });
  const [options] = useState(() => buildOptions(chars)); // stable photo options for this session
  const [pick, setPick] = useState(0);                  // which look → avatar
  const [preview, setPreview] = useState('');
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

  useEffect(() => {
    let url;
    if (options[pick]) generateAvatarUrl(options[pick], 200).then((u) => { url = u; setPreview(u); }).catch(() => {});
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [pick, options]);

  useEffect(() => {
    if (!onBadge || loading) return;
    onBadge(profile ? { avatar_url: profile.avatar_url, screenname: profile.screenname } : null);
  }, [profile, loading, onBadge]);

  const fail = (e) => { setErr(e?.message || String(e)); setBusy(false); };

  const doSignup = async () => {
    setErr(''); setBusy(true);
    try {
      await signUp(form);
      if (options[pick]) { const blob = await generateAvatarBlob(options[pick], 256); await uploadAvatar(blob); }
      setProfile(await getProfile());
      onAuthEvent?.('signup');
      setNote('Account created! 🎉');
    } catch (e) { fail(e); return; }
    setBusy(false);
  };

  const doLogin = async () => {
    setErr(''); setBusy(true);
    try { await signIn(form); setProfile(await getProfile()); onAuthEvent?.('login'); } catch (e) { fail(e); return; }
    setBusy(false);
  };

  const doSignout = async () => { setBusy(true); await signOut().catch(() => {}); onAuthEvent?.('logout'); setProfile(null); setUser(null); setBusy(false); };

  const setPhotoFromChar = async (c) => {
    setBusy(true); setErr('');
    try { const blob = await generateAvatarBlob(c, 256); const url = await uploadAvatar(blob); setProfile((p) => ({ ...p, avatar_url: url })); setNote('Photo updated!'); }
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

  const optionRow = (onTap, selectedIdx) => (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0 4px' }}>
      {options.map((c, i) => <CharHead key={i} c={c} selected={i === selectedIdx} onClick={() => onTap(c, i)} />)}
    </div>
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

        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 6 }}>Change photo</div>
          {optionRow((c) => setPhotoFromChar(c), -1)}
        </div>

        <InboxSection onUnread={onUnread} />
        <FriendsSection onVisit={(f) => onVisit?.(f)} />

        {err && <div style={{ color: '#D6336C', fontSize: 13, marginTop: 10 }}>{err}</div>}
        {note && <div style={{ color: '#2B9348', fontSize: 13, marginTop: 8 }}>{note}</div>}

        <button disabled={busy} onClick={onClose} style={{ ...btn(`linear-gradient(${ACCENT},${PINK})`), marginTop: 18, opacity: busy ? 0.6 : 1 }}>Let's go! 🎉</button>
        <div style={{ marginTop: 12 }}>
          <button disabled={busy} onClick={doSignout} style={linkBtn}>Log out</button>
        </div>
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
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ width: 92, height: 92, margin: '0 auto 8px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${PINK}`, background: '#cfeaff' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div style={{ fontSize: 12, color: '#9A8FBF', marginBottom: 6 }}>pick your photo</div>
          {optionRow((_c, i) => setPick(i), pick)}
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

// Inbox: preset notes friends left you. Opening it marks them read.
function InboxSection({ onUnread }) {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const items = await inbox();
        setNotes(items);
        if (items.some((n) => !n.read)) { await markNotesRead().catch(() => {}); onUnread?.(0); }
      } catch { /* offline */ }
    })();
  }, []);
  if (notes.length === 0) return null;
  return (
    <div style={{ marginTop: 18, textAlign: 'left', borderTop: '1px solid #EEE9FA', paddingTop: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 900, color: '#2E2059', marginBottom: 8 }}>Notes 💌</div>
      {notes.slice(0, 30).map((n) => (
        <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
          <Avatar url={n.avatar_url} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#9A8FBF', fontWeight: 800 }}>{n.screenname}</div>
            <div style={{ fontSize: 14, color: '#2E2059', fontWeight: 700 }}>{presetText(n.preset_id)} {n.sticker || ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Friends: add by code, accept/decline requests, see your friends.
const SEND_MSG = {
  sent: 'Request sent! 🎉', not_found: "Hmm, no one has that code.", self: "That's your own code! 😄",
  already_friends: "You're already friends! 🎉", incoming: 'They already asked you — see below!',
};
function Avatar({ url, size = 38 }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto', background: '#cfeaff', border: '2px solid #E3DCF5' }}>
    {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
  </div>;
}
function FriendsSection({ onVisit }) {
  const [friends, setFriends] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = async () => { try { setFriends(await listFriends()); setReqs(await incomingRequests()); } catch { /* offline */ } };
  useEffect(() => { reload(); }, []);

  const add = async () => {
    if (!code.trim()) return;
    setBusy(true); setMsg('');
    try { const r = await sendFriendRequest(code.trim()); setMsg(SEND_MSG[r] || r); if (r === 'sent') setCode(''); if (r === 'incoming') reload(); }
    catch (e) { setMsg(e?.message || 'Could not send.'); }
    setBusy(false);
  };
  const accept = async (id) => { setBusy(true); try { await acceptRequest(id); } catch { /* ignore */ } await reload(); setBusy(false); };
  const decline = async (id) => { setBusy(true); try { await declineRequest(id); } catch { /* ignore */ } await reload(); setBusy(false); };

  return (
    <div style={{ marginTop: 18, textAlign: 'left', borderTop: '1px solid #EEE9FA', paddingTop: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 900, color: '#2E2059', marginBottom: 8 }}>Friends</div>

      {reqs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#9A8FBF', marginBottom: 6 }}>Friend requests</div>
          {reqs.map((r) => (
            <div key={r.req_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <Avatar url={r.avatar_url} />
              <div style={{ flex: 1, fontWeight: 800, color: '#2E2059' }}>{r.screenname}</div>
              <button disabled={busy} onClick={() => accept(r.req_id)} style={{ border: 'none', borderRadius: 10, padding: '7px 12px', background: '#6FE7B7', color: '#0E3B2C', fontWeight: 800, cursor: 'pointer' }}>Accept</button>
              <button disabled={busy} onClick={() => decline(r.req_id)} style={{ border: 'none', borderRadius: 10, padding: '7px 10px', background: '#F0EAFB', color: '#7A6CA8', fontWeight: 800, cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter a friend code"
          autoCapitalize="characters"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '2px solid #E3DCF5', fontSize: 14, outline: 'none', background: '#FBFAFF', letterSpacing: 1 }} />
        <button disabled={busy} onClick={add} style={{ border: 'none', borderRadius: 12, padding: '0 16px', background: 'linear-gradient(#A24BFF,#FF6FB5)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Add</button>
      </div>
      {msg && <div style={{ fontSize: 12, color: '#6B5B95', marginTop: 6 }}>{msg}</div>}

      <div style={{ marginTop: 12 }}>
        {friends.length === 0
          ? <div style={{ fontSize: 12, color: '#9A8FBF' }}>No friends yet — share your code or add one above.</div>
          : friends.map((f) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <Avatar url={f.avatar_url} />
                <div style={{ flex: 1, fontWeight: 800, color: '#2E2059' }}>{f.screenname}</div>
                <button onClick={() => onVisit?.(f)} style={{ border: 'none', borderRadius: 10, padding: '7px 13px', background: 'linear-gradient(#A24BFF,#FF6FB5)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Visit ›</button>
              </div>
            ))}
      </div>
    </div>
  );
}

// Small circular head preview for the avatar picker.
function CharHead({ c, onClick, selected }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let u; generateAvatarUrl(c, 120).then((x) => { u = x; setUrl(x); }).catch(() => {});
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [c]);
  return (
    <button onClick={onClick} style={{ flex: '0 0 auto', width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${selected ? ACCENT : '#E3DCF5'}`, cursor: 'pointer', background: '#cfeaff', padding: 0 }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
    </button>
  );
}
