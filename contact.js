
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    
    const msgs = JSON.parse(localStorage.getItem('pawhavenMessages') || '[]');
    msgs.push({ name, email, subject, message, sentAt: new Date().toISOString() });
    localStorage.setItem('pawhavenMessages', JSON.stringify(msgs));

    showToast('📨 Message sent! We\'ll get back to you soon.');
    contactForm.reset();
  });
}