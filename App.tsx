import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [credits, setCredits] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { setUser(null); return; }
      setUser(fbUser);
      // ensure credit row exists
      await fetch('/api/ensureUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: fbUser.uid, email: fbUser.email }) });
      // fetch credits and images
      const { data: c } = await supabase.from('user_credits').select('*').eq('user_id', fbUser.uid).single();
      setCredits(c?.credits ?? 0);
      const { data: imgs } = await supabase.from('images').select('*').eq('user_id', fbUser.uid).order('created_at', { ascending: false }).limit(50);
      setImages(imgs || []);
    });
  }, []);

  async function login() {
    await signInWithPopup(auth, provider);
  }
  async function logout(){ await signOut(auth); }

  async function generate() {
    if (!user) return alert('login first');
    const resp = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, userId: user.uid }) });
    const j = await resp.json();
    if (j.imageUrl) {
      setImages(p => [{ public_url: j.imageUrl, id: Date.now().toString() }, ...p]);
      // refresh credits
      const { data: c } = await supabase.from('user_credits').select('*').eq('user_id', user.uid).single();
      setCredits(c?.credits ?? 0);
    } else {
      alert('Generation failed');
    }
  }

  return (<div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: 20 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>DigPikasoClone</h1>
      <div>
        {user ? (<>
          <span style={{ marginRight: 10 }}>Credits: {credits}</span>
          <button onClick={logout}>Logout</button>
        </>) : (<button onClick={login}>Login with Google</button>)}
      </div>
    </header>
    <main style={{ marginTop: 20 }}>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} style={{ width: '100%' }} placeholder="Describe the image..."></textarea>
      <button onClick={generate} style={{ marginTop: 10 }}>Generate (cost 1 credit)</button>
      <section style={{ marginTop: 20 }}>
        <h2>Your Gallery</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {images.map((img:any)=>(<img key={img.id} src={img.public_url} style={{ width: '100%', height: 120, objectFit: 'cover' }} />))}
        </div>
      </section>
    </main>
  </div>);
}
