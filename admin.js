let supabaseClient = null;

// Initialize secure connection keys invisibly from our Vercel Serverless environment
async function initSupabase() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        if (config.supabaseUrl && config.supabaseKey) {
            supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseKey);
            loadLiveRoster(); // Check database dynamically immediately on site view
            monitorAuthState();
        }
    } catch (err) {
        console.error("Secure DB Handshake Failed:", err);
    }
}

// Render out Roster profiles to regular users and the Admin panel dynamically
async function loadLiveRoster() {
    if (!supabaseClient) return;
    
    const { data: agents, error } = await supabaseClient.from('roster').select('*').order('id', { ascending: true });
    if (error) return console.error(error);

    const publicGrid = document.getElementById('live-roster-grid');
    const adminTable = document.getElementById('admin-table-body');
    
    // Clear out baseline placeholders safely
    publicGrid.innerHTML = '';
    adminTable.innerHTML = '';

    agents.forEach(agent => {
    const isDirector = agent.division === 'Directorate';
    const borderStyle = isDirector ? 'border-nbiGold' : 'border-slate-500';
    const tagStyle = isDirector ? 'bg-nbiGold/10 text-nbiGold' : 'bg-slate-700 text-slate-300';
    
    // Fallback placeholder image if the database cell is completely empty or null
    const finalAvatar = agent.avatar_url || 'https://i.imgur.com/He9gYnm.png';

    // Public Card Layout (As seen in image_f30fbe.png)
    publicGrid.innerHTML += `
        <div class="bg-nbiSlate/50 rounded-xl border-t-2 ${borderStyle} p-6 flex flex-col items-center text-center shadow-lg transform transition duration-300 hover:scale-[1.02]">
            <span class="text-[10px] uppercase font-mono ${tagStyle} px-2 py-0.5 rounded font-bold self-center mb-4">${agent.division}</span>
            
            <!-- Agent Avatar Display Area -->
            <div class="w-24 h-24 mb-4 rounded-full border-2 ${isDirector ? 'border-nbiGold' : 'border-slate-600'} overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner">
                <img src="${finalAvatar}" alt="Agent Profile" class="w-full h-full object-cover">
            </div>

            <h3 class="font-bold text-xl text-white tracking-wide">${agent.agent_name}</h3>
            <p class="text-xs text-slate-400 mt-1">${agent.agent_rank}</p>
        </div>
    `;

    // Admin Panel Row Layout Update
    adminTable.innerHTML += `
        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
            <td class="p-3 font-semibold text-white flex items-center space-x-3">
                <img src="${finalAvatar}" class="w-6 h-6 rounded-full object-cover">
                <span>${agent.agent_name}</span>
            </td>
            <td class="p-3 text-xs text-slate-400">${agent.agent_rank} (${agent.division})</td>
            <td class="p-3">
                <button onclick="deleteAgent(${agent.id})" class="text-red-400 hover:text-red-500 text-xs uppercase font-mono font-bold">Revoke Access</button>
            </td>
        </tr>
    `;
});
}

// Monitor state to see if you are already logged into this computer browser session
function monitorAuthState() {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        const loginBox = document.getElementById('admin-login-box');
        const controlDashboard = document.getElementById('admin-control-dashboard');
        
        if (session) {
            loginBox.classList.add('hidden');
            controlDashboard.classList.remove('hidden');
        } else {
            loginBox.classList.remove('hidden');
            controlDashboard.classList.add('hidden');
        }
    });
}

// Handle Login Requests
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert(`Authentication Denied: ${error.message}`);
    }
});

// Handle Database Additions with Image URL processing
document.getElementById('add-agent-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-agent-name').value;
    const rank = document.getElementById('new-agent-rank').value;
    const division = document.getElementById('new-agent-division').value;
    const avatar = document.getElementById('new-agent-avatar').value.trim();

    // Prepare data payload structure
    const payload = { 
        agent_name: name, 
        agent_rank: rank, 
        division: division 
    };
    
    // Only pass custom image value if the admin actually typed something into the input field box
    if (avatar) {
        payload.avatar_url = avatar;
    }

    const { error } = await supabaseClient.from('roster').insert([payload]);
    if (error) {
        alert(`Database Entry Failed: ${error.message}`);
    } else {
        document.getElementById('add-agent-form').reset();
        loadLiveRoster();
    }
});

// Remove characters instantly from backend database securely
async function deleteAgent(id) {
    if (!confirm("Are you certain you wish to purge this agent profile from the record banks permanently?")) return;
    const { error } = await supabaseClient.from('roster').delete().eq('id', id);
    if (error) alert(error.message);
    else loadLiveRoster();
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
}

// Boot setup script execution immediately
initSupabase();