# FBI Portal — Local Development

Quick steps to run the site locally.

Options:

- Run with Vercel (recommended for API parity):

```bash
# install vercel CLI if not installed
npm i -g vercel

# set environment variables in Vercel or locally
export SUPABASE_URL=your-supabase-url
export SUPABASE_KEY=your-supabase-key

# start local Vercel dev server
vercel dev
```

- Or run a simple static server (no serverless API):

```bash
# using npx serve
npx serve .

# or Python
python -m http.server 8000
```

Notes:
- Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set in your hosting environment so `/api/config` returns them.
- Use the `.env.example` as a template for local environment variables.

Node test script
----------------

To run a Node-based connectivity test (requires Node/npm):

```bash
npm install
# then either
SUPABASE_URL=your-supabase-url SUPABASE_KEY=your-supabase-key npm run test:supabase

# or
npm run test:supabase -- your-supabase-url your-supabase-key
```

