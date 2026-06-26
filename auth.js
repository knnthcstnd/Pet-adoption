
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.hidden = false;
}
function clearError(elId) {
  const el = document.getElementById(elId);
  if (el) { el.textContent = ''; el.hidden = true; }
}


const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    clearError('registerError');

    const name     = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const role     = document.getElementById('role').value;

    if (password !== confirm) {
      return showError('registerError', 'Passwords do not match. Please try again.');
    }

    const users = JSON.parse(localStorage.getItem('pawhavenUsers') || '[]');
    if (users.find(u => u.email === email)) {
      return showError('registerError', 'An account with that email already exists.');
    }

    users.push({ name, email, password, role, createdAt: Date.now() });
    localStorage.setItem('pawhavenUsers', JSON.stringify(users));
    localStorage.setItem('pawhavenSession', JSON.stringify({ name, email, role }));

    showToast('✅ Account created! Redirecting…');
    setTimeout(() => window.location.href = 'index.html', 1400);
  });
}


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    clearError('loginError');

    const email    = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('pawhavenUsers') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return showError('loginError', 'Incorrect email or password. Please try again.');
    }

    localStorage.setItem('pawhavenSession', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
    showToast(`👋 Welcome back, ${user.name}!`);
    setTimeout(() => window.location.href = 'index.html', 1400);
  });
}