// ============================================
// HOME PAGE LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Home page loaded');
    
    await loadFeaturedTools();
    await loadTrendingTools();
    setupSearch();
});

// ============================================
// LOAD FEATURED TOOLS
// ============================================

async function loadFeaturedTools() {
    try {
        showLoading();
        
        const response = await toolsAPI.getAll(1, 6);
        
        hideLoading();

        if (response.success) {
            console.log('Featured tools loaded:', response.data.tools.length);
            renderToolsList(response.data.tools, 'tools-container');
        } else {
            console.error('Failed to load tools:', response.message);
            showToast('Failed to load tools', 'error');
            document.getElementById('tools-container').innerHTML = 
                '<p class="no-results">Failed to load tools. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading featured tools:', error);
        hideLoading();
        showToast('An error occurred while loading tools', 'error');
        document.getElementById('tools-container').innerHTML = 
            '<p class="no-results">An error occurred. Please try again.</p>';
    }
}

// ============================================
// LOAD TRENDING TOOLS
// ============================================

async function loadTrendingTools() {
    try {
        const response = await toolsAPI.getTrending(6);

        if (response.success) {
            console.log('Trending tools loaded:', response.data.tools.length);
            renderToolsList(response.data.tools, 'trending-container');
        } else {
            console.error('Failed to load trending tools:', response.message);
            document.getElementById('trending-container').innerHTML = 
                '<p class="no-results">Failed to load trending tools.</p>';
        }
    } catch (error) {
        console.error('Error loading trending tools:', error);
        document.getElementById('trending-container').innerHTML = 
            '<p class="no-results">Error loading trending tools.</p>';
    }
}

// ============================================
// SETUP SEARCH
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }

    searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                showToast('Please enter at least 2 characters', 'warning');
                return;
            }

            window.location.href = `/tools-listing.html?search=${encodeURIComponent(query)}`;
        }
    });

    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) return;

        try {
            const response = await toolsAPI.search(query);
            
            if (response.success) {
                console.log('Search suggestions:', response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 500));
}
