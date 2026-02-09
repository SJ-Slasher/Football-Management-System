document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupForms();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${target}-form`) {
                    form.classList.add('active');
                }
            });
            
            clearMessage();
            
            const header = document.querySelector('.auth-header h2');
            const subtext = document.querySelector('.auth-header p');
            
            if (target === 'login') {
                header.textContent = 'Welcome back';
                subtext.textContent = 'Sign in to manage your bookings';
            } else {
                header.textContent = 'Create an account';
                subtext.textContent = 'Join us to start booking courts';
            }
        });
    });
}

function setupForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Signing in...';
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/player.html';
                    }
                }, 500);
            } else {
                showMessage(data.error || 'Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const fullName = document.getElementById('register-fullname').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        if (!username || !email || !fullName || !phone || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        const btn = registerForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creating account...';
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    full_name: fullName,
                    phone,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/player.html';
                }, 500);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

function showMessage(text, type) {
    const container = document.getElementById('auth-message');
    container.innerHTML = `
        <div class="message message-${type}">
            <span class="message-icon">${type === 'success' ? '✓' : '!'}</span>
            <span>${text}</span>
        </div>
    `;
    
    if (type === 'error') {
        setTimeout(clearMessage, 5000);
    }
}

function clearMessage() {
    document.getElementById('auth-message').innerHTML = '';
}
