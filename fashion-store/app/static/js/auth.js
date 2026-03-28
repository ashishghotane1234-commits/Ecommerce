async function doLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Signing in…';

  const res  = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (res.ok) {
    showToast(`Welcome back, ${data.name}!`);
    setTimeout(() => window.location.href = '/', 1000);
  } else {
    errEl.textContent    = data.error;
    errEl.style.display  = 'block';
    btn.disabled         = false;
    btn.textContent      = 'Sign In';
  }
}

async function doRegister() {
  const name     = document.getElementById('name')?.value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('reg-error');
  const btn      = document.getElementById('reg-btn');

  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Creating account…';

  const res  = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();

  if (res.ok) {
    showToast(`Welcome to DRAPE, ${data.name}! 🎉`);
    setTimeout(() => window.location.href = '/', 1000);
  } else {
    errEl.textContent   = data.error;
    errEl.style.display = 'block';
    btn.disabled        = false;
    btn.textContent     = 'Create Account';
  }
}

// Allow Enter key to submit
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (document.getElementById('login-btn'))  doLogin();
  if (document.getElementById('reg-btn'))    doRegister();
});
