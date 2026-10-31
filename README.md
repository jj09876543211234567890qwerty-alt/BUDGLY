# Budget Tracker (PWA)

An installable, offline-capable version of the Budget Tracker with optional Firebase sync.

```
budget-tracker-pwa/
├── index.html           app shell, PWA meta tags, script loading
├── css/styles.css       liquid-glass styles
├── js/app.js            the app (React + htm + Framer Motion)
├── js/firebase.js       Firebase Auth + Firestore sync adapter
├── firebase-config.js   YOUR Firebase keys (edit this)
├── manifest.json        install metadata
├── sw.js                service worker (offline cache)
├── firestore.rules      security rules to paste into Firebase
├── icons/               app icons
└── .nojekyll
```

Everything works without Firebase (data stays on the device). Firebase adds sign-in and sync between your phone and computer.

## Part 1: Firebase setup (about 10 minutes, free plan)

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Create a project**, name it (for example `budget-tracker`), skip Google Analytics, and click **Create**.
3. Click the **</>** (Web) icon on the project home page. Name the app `Budget Tracker`. Do NOT tick "Firebase Hosting". Click **Register app**.
4. Copy the `firebaseConfig` values shown (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) and paste them into `firebase-config.js`, replacing the placeholders. Keep the quotes.
5. **Authentication:** left menu > Build > **Authentication** > Get started > **Sign-in method** > enable **Email/Password** (and **Google** if you want it, choosing a support email).
6. **Firestore:** Build > **Firestore Database** > Create database > pick the region closest to you > **Start in production mode** > Enable.
7. In Firestore open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**. This makes each user's data readable and writable only by that user.
8. After you deploy (Part 2), go to Authentication > **Settings** > **Authorized domains** > **Add domain** and add `YOUR-USERNAME.github.io`. Without this, sign-in fails on your live site.

Firebase web keys are not secrets. Your protection is the rules in step 7.

## Part 2: Deploy on GitHub Pages

1. Create a GitHub account if needed, then click **New repository**. Name it `budget-tracker`, set it to **Public**, and click Create.
2. Click **uploading an existing file**, drag in everything inside this folder (keep the `css`, `js` and `icons` folders), and click **Commit changes**. Make sure `firebase-config.js` has your real keys first.
3. Go to the repo **Settings > Pages**. Under "Build and deployment" choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and click Save.
4. Wait a minute or two. Your app will be at `https://YOUR-USERNAME.github.io/budget-tracker/`.
5. Do step 8 of Part 1 now (add the `github.io` domain to Authorized domains).

Cloudflare Pages also works: connect the repo, leave the build command empty and set the output directory to `/`.

## Part 3: Install on your phone

- **iPhone (Safari only):** open your link in Safari > Share button > **Add to Home Screen** > Add.
- **Android (Chrome):** open your link > menu (⋮) > **Install app** / Add to Home screen.
- **Computer (Chrome/Edge):** click the install icon in the address bar.

It opens full screen like a normal app and works offline after the first load.

## Part 4: First use

1. Open the app > **Settings > Account & sync** > enter an email and password > **Create account**. The pill at the top right should change to **Synced**.
2. On your other devices, open the same link and **Sign in** with the same account. Your data appears.
3. On iPhone, use **Email/Password**. Google sign-in popups can be blocked inside home-screen apps.
4. Use **Settings > Data Management > Export backup** now and then as an extra safety copy.

## Updating the app later

1. Edit the files and upload them to the repo again.
2. Change `VERSION` in `sw.js` (for example `bt-v2`). Installed copies pick up the new files and reload once.

## Test locally (optional)

```
python3 -m http.server 8000
```
Open http://localhost:8000. Add `localhost` to Authorized domains (it is there by default).

## Troubleshooting

- **Pill says "This device only":** you are not signed in, or `firebase-config.js` still has placeholders.
- **"auth/unauthorized-domain":** add your `github.io` domain in Authentication > Settings > Authorized domains.
- **"Missing or insufficient permissions":** the Firestore rules were not published (Part 1, step 7).
- **Old version still showing:** close and reopen the app once, or bump `VERSION` in `sw.js`.
- **Offline on the very first visit:** open the app once while online so everything gets cached.
- **Tailwind CDN notice in the console:** expected. It is a convenience build; fine for a personal app.
