// Firebase adapter: Email/Password + Google sign-in and a private Firestore document per user.
// If firebase-config.js still has placeholder values, the app runs in local-only mode.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,doc,onSnapshot,setDoc} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG || {};
const FB = { enabled: !!cfg.apiKey && !/^(PASTE|YOUR)/.test(cfg.apiKey) };
if (FB.enabled) {
  try {
    const app = initializeApp(cfg);
    const auth = getAuth(app);
    // Offline-first: reads and writes keep working without a connection and sync when back online.
    const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    Object.assign(FB, {
      onAuth: cb => onAuthStateChanged(auth, cb),
      signIn: (e, p) => signInWithEmailAndPassword(auth, e, p),
      signUp: (e, p) => createUserWithEmailAndPassword(auth, e, p),
      google: () => signInWithPopup(auth, new GoogleAuthProvider()),
      signOut: () => signOut(auth),
      // The whole app state is stored as one JSON string (avoids Firestore's nested-array limits).
      doc: path => {
        const ref = doc(db, path);
        return {
          onSnapshot: (cb, err) => onSnapshot(ref, snap => {
            const d = snap.exists() ? snap.data() : null;
            cb({ exists: !!d, data: () => (d ? { t: d.t, state: JSON.parse(d.json) } : null) });
          }, err),
          set: ({ t, state }) => setDoc(ref, { t, json: JSON.stringify(state) })
        };
      }
    });
  } catch (e) { console.error('Firebase init failed', e); FB.enabled = false; }
}
window.FB = FB;
window.__fbResolve && window.__fbResolve();
