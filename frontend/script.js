// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentDashboardSource = 'admin';
let authToken = localStorage.getItem('token') || '';

// API Helper
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message || 'Connection error', 'error');
        return null;
    }
}

// DOM Elements
let loginBtn, loginModal, closeLoginModalBtn, loginForm, loginRole, loginErrorMessage,
    adminDashboard, logoutBtn, navbar, heroSection,
    ownerDashboard, logoutOwnerBtn, supportTickets;

function initializeLoginElements() {
    loginBtn = document.getElementById('loginBtn');
    loginModal = document.getElementById('loginModal');
    closeLoginModalBtn = document.getElementById('closeLoginModal');
    loginForm = document.getElementById('loginForm');
    loginRole = document.getElementById('loginRole');
    loginErrorMessage = document.getElementById('loginErrorMessage');
    adminDashboard = document.getElementById('adminDashboard');
    ownerDashboard = document.getElementById('ownerDashboard');
    logoutBtn = document.getElementById('logoutBtn');
    logoutOwnerBtn = document.getElementById('logoutOwnerBtn');
    navbar = document.getElementById('navbar');
    heroSection = document.getElementById('home');
    supportTickets = document.getElementById('supportTickets');
}

// Open/Close Modal
function openLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'flex';
        if (loginErrorMessage) loginErrorMessage.style.display = 'none';
        if (loginForm) loginForm.reset();
    }
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

// Handle Login with API
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const role = (loginRole && loginRole.value) || 'owner';
    
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role })
    });
    
    if (data && data.token) {
        authToken = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        
        closeLoginModal();
        showDashboard(data.role);
        showNotification(`Welcome ${data.role === 'admin' ? 'Admin' : 'Owner'}!`, 'success');
        if (data.role === 'admin') loadAdminStats();
        else loadOwnerStats();
    } else {
        if (loginErrorMessage) {
            loginErrorMessage.textContent = 'Invalid credentials. Please try again.';
            loginErrorMessage.style.display = 'block';
        }
    }
}

// Show Dashboard
function showDashboard(role) {
    if (navbar) navbar.style.display = 'none';
    if (heroSection) heroSection.style.display = 'none';
    
    // Hide all sections
    document.querySelectorAll('section').forEach(s => {
        if (s.id !== 'home') s.style.display = 'none';
    });
    
    if (role === 'admin' && adminDashboard) {
        adminDashboard.style.display = 'block';
    } else if (role === 'owner' && ownerDashboard) {
        ownerDashboard.style.display = 'block';
    }
    
    document.body.style.overflow = 'auto';
}

// Load Admin Stats from API
async function loadAdminStats() {
    const data = await apiRequest('/admin/stats');
    if (data) {
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        document.getElementById('totalSpots').textContent = data.totalSpots || 0;
        document.getElementById('activeBookings').textContent = data.activeBookings || 0;
        document.getElementById('revenue').textContent = '₱' + (data.revenue || 0).toLocaleString();
    }
}

// Load Owner Stats from API
async function loadOwnerStats() {
    const data = await apiRequest('/owner/stats');
    if (data) {
        document.getElementById('totalLocations').textContent = data.totalLocations || 0;
        document.getElementById('totalCustomers').textContent = (data.totalCustomers || 0).toLocaleString();
        document.getElementById('monthlyRevenue').textContent = '₱' + (data.monthlyRevenue || 0).toLocaleString();
        document.getElementById('growthRate').textContent = data.growthRate || '+0%';
    }
}

// Logout
function handleLogout() {
    authToken = '';
    localStorage.clear();
    location.reload();
}

// Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginElements();
    
    // Check if already logged in
    const savedRole = localStorage.getItem('role');
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedRole) {
        authToken = savedToken;
        showDashboard(savedRole);
        if (savedRole === 'admin') loadAdminStats();
        else loadOwnerStats();
    }
    
    // Event Listeners
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutOwnerBtn) logoutOwnerBtn.addEventListener('click', handleLogout);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
    });
});