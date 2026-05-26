## Problem

Site Vercel a deploy korar pore "Continue with Google" click korle 404 ashe.

Code review theke (`src/pages/Auth.tsx:76`):
```ts
lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` })
```

Eta `https://<your-app>.vercel.app/dashboard` e callback pathate chaay. But Lovable Cloud (Supabase Auth) shudhu shei redirect URL-gulo accept kore jegulo **Site URL** ba **Additional Redirect URLs** list a add kora ache. Vercel domain ekhono add kora nai → Supabase callback fail kore / Google "redirect_uri_mismatch" dey, ar user shesh porjonto 404 page a chole jay.

`vercel.json` te SPA fallback (`/.*` → `/index.html`) already ache, tai SPA routing er problem na — problem **auth redirect whitelist**.

## Fix (no code change needed)

1. **Lovable Cloud → Authentication → URL Configuration** a jao.
2. **Site URL** set koro tomar Vercel production URL diye, jemon:
   `https://your-app.vercel.app`
3. **Additional Redirect URLs** a ei pattern gulo add koro (ja ja use korte chao):
   - `https://your-app.vercel.app/**`
   - `https://*-your-team.vercel.app/**` (preview deploys er jonno, optional)
   - `https://ecomstation.lovable.app/**` (Lovable published URL — already kaaj korche)
   - `http://localhost:5173/**` (local dev)
4. Save koro. Notun OAuth attempt sathe sathe kaaj korbe — re-deploy lage na.

## Managed vs Custom Google credentials

- Default a Lovable Cloud **managed Google OAuth** use hocche → Google Cloud Console a kichu korar dorkar nai.
- Jodi tumi nijer Google Client ID/Secret use korcho, tahole **Google Cloud Console → Credentials → OAuth Client → Authorized redirect URIs** a Supabase callback URL (Lovable Cloud Auth Settings → Google provider section a dekhabe, ending `/auth/v1/callback`) thaka lagbe. Vercel domain ta authorized JavaScript origins a add koro.

## Verify

Vercel URL theke login try koro:
1. `/auth` page a jao
2. "Continue with Google" click koro
3. Google account select korar pore `https://your-app.vercel.app/dashboard` a redirect howa uchit, session set thakbe.

## Bonus (optional)

`Auth.tsx` te `/dashboard` hardcoded redirect ache — admin user holeo `/dashboard` a jabe. Chaile ami `useAuth` er `isAdmin` check kore admin hole `/admin` a pathate pari. Eta alada kaaj, ekhon scope er baire.
