/**
 * SPA Content Switching Controller Logic
 * Handles interactive tabs for Home, Information, Roster, and Apply Now.
 */
function navigateTo(targetPageId) {
    // 1. Gather all main view pages
    const pages = document.querySelectorAll('.page-section');
    
    // 2. Hide all pages safely
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // 3. Unveil the chosen layout page view
    const selectedPage = document.getElementById(`page-${targetPageId}`);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }

    // 4. Reset style frameworks on navigation bar tabs
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(button => {
        button.classList.remove('text-nbiGold', 'bg-slate-800/60', 'border', 'border-nbiGold/30');
        button.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-slate-800/40');
    });

    // 5. Highlight active state button link target context
    const activeButton = document.getElementById(`nav-${targetPageId}`);
    if (activeButton) {
        activeButton.classList.remove('text-slate-300', 'hover:text-white', 'hover:bg-slate-800/40');
        activeButton.classList.add('text-nbiGold', 'bg-slate-800/60', 'border', 'border-nbiGold/30');
    }

    // 6. Push window focus back to top view for consistent client transitions
    window.scrollTo({ top: 0, behavior: 'smooth' });
}