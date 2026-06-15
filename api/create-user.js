const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, authToken } = req.body;

    if (!email || !password || !authToken) {
        return res.status(400).json({ error: 'Missing email, password, or auth token' });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({ error: 'Missing Supabase credentials' });
        }

        // Initialize Supabase with service role (backend only)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the auth token belongs to a full admin
        const { data: { user: currentUser }, error: tokenError } = await supabase.auth.getUser(authToken);
        if (tokenError || !currentUser) {
            return res.status(401).json({ error: 'Invalid auth token' });
        }

        // Check if current user is a full admin
        const { data: adminRecord, error: checkError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('email', currentUser.email)
            .single();

        if (checkError || adminRecord?.role !== 'full') {
            return res.status(403).json({ error: 'Only full admins can create users' });
        }

        // Create new user with service role
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            password: password,
            email_confirm: true
        });

        if (createError) {
            return res.status(400).json({ error: createError.message });
        }

        // Add to admin_users table
        const { error: dbError } = await supabase.from('admin_users').insert([{
            email: email.toLowerCase(),
            role: 'news_only',
            auth_user_id: newUser.user.id
        }]);

        if (dbError) {
            return res.status(400).json({ error: dbError.message });
        }

        return res.status(200).json({ 
            success: true, 
            message: `News Editor created: ${email}` 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
