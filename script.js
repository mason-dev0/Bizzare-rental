// ============ ROUTING ============
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-nav]');
const mascotBadge = document.getElementById('mascotBadge');
const validRoutes = ['home','roster','pricing','about','faq','book','donate'];

function getRouteFromHash(){
  const hash = window.location.hash.replace('#/', '').split('?')[0];
  return hash || 'home';
}

function positionMascot(routeKey){
  const activeLink = document.querySelector(`.main-nav a[data-page="${routeKey}"]`);
  if(!activeLink || window.innerWidth <= 860){ mascotBadge.style.opacity = '0'; return; }
  mascotBadge.style.opacity = '1';
  const rect = activeLink.getBoundingClientRect();
  mascotBadge.style.left = (rect.left + rect.width/2) + 'px';
  mascotBadge.style.top = '2px';
}

function navigateTo(route){
  const isValid = validRoutes.includes(route);
  const routeKey = isValid ? route : 'offline';

  pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + routeKey);
  if(target){ target.classList.add('active'); }

  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelectorAll(`[data-page="${routeKey}"]`).forEach(l => l.classList.add('active'));

  positionMascot(routeKey);

  // close mobile nav
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');

  window.scrollTo({top:0, behavior:'smooth'});

  // re-trigger reveal animations for the newly active page
  requestAnimationFrame(() => {
    const items = target ? target.querySelectorAll('.reveal') : [];
    items.forEach((el,i) => {
      el.classList.remove('in-view');
      setTimeout(()=> el.classList.add('in-view'), 40 + i*60);
    });
  });

  if(routeKey === 'offline'){
    initGameIfNeeded();
  }
}

window.addEventListener('hashchange', () => navigateTo(getRouteFromHash()));
window.addEventListener('resize', () => positionMascot(getRouteFromHash()));

// intercept nav clicks for smooth internal handling (hash change fires navigateTo)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-nav]');
  if(link){
    // allow default hash navigation; nothing else needed
  }
});

// ============ MOBILE MENU ============
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});

// ============ SCROLL REVEAL (IntersectionObserver) ============
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
    }
  });
}, {threshold:0.12});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============ TOAST ============
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

// ============ MODAL ============
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalIcon = document.getElementById('modalIcon');
function openModal({title, body, icon}){
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalIcon.textContent = icon || '🎉';
  modalOverlay.classList.add('show');
}
function closeModal(){ modalOverlay.classList.remove('show'); }
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOkBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });

// ============ ROSTER "BOOK" BUTTONS -> BOOK NOW FORM ============
document.querySelectorAll('[data-book]').forEach(btn => {
  btn.addEventListener('click', () => {
    const animal = btn.getAttribute('data-book');
    window.location.hash = '#/book';
    setTimeout(() => {
      const select = document.getElementById('animalChoice');
      [...select.options].forEach(opt => { if(opt.value === animal) select.value = animal; });
      showToast(`${animal.split(' the ')[0]} added to your booking form ✓`);
    }, 250);
  });
});

// ============ PRICING "CHOOSE" BUTTONS ============
const selectedPlanNote = document.getElementById('selectedPlanNote');
document.querySelectorAll('[data-plan]').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.getAttribute('data-plan');
    window.location.hash = '#/book';
    setTimeout(() => {
      selectedPlanNote.hidden = false;
      selectedPlanNote.textContent = `✓ Plan selected: ${plan}`;
      showToast('Plan selected — continue booking below');
    }, 250);
  });
});

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

// ============ BOOKING FORM ============
const companyToggle = document.getElementById('companyToggle');
const companyField = document.getElementById('companyField');
companyToggle.addEventListener('change', () => {
  companyField.classList.toggle('open', companyToggle.checked);
});

const capybaraAddonNote = document.getElementById('capybaraAddonNote');
const addCapybaraBtn = document.getElementById('addCapybaraBtn');
let capybaraAdded = false;
addCapybaraBtn.addEventListener('click', () => {
  capybaraAdded = !capybaraAdded;
  addCapybaraBtn.classList.toggle('added', capybaraAdded);
  addCapybaraBtn.textContent = capybaraAdded ? '✓ Added — Remove' : 'Add To Booking';
  capybaraAddonNote.hidden = !capybaraAdded;
  if(capybaraAdded){
    window.location.hash = '#/book';
    showToast('Barnaby the Capybara added to your booking 🐹');
  }
});

const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = bookingForm.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.classList.add('touched');
    if(!field.value){ valid = false; }
  });
  if(!valid){
    showToast('Please fill in the required fields first');
    return;
  }
  const first = document.getElementById('firstName').value;
  const animal = document.getElementById('animalChoice').value;
  openModal({
    title: 'Booking Locked In! 🦥',
    body: `Thanks, ${first}! ${animal} is being prepped for climate-controlled delivery. Our Weirdness Hotline will confirm details shortly.`,
    icon: '🎉'
  });
  launchConfetti();
});

document.getElementById('undoBooking').addEventListener('click', () => {
  bookingForm.reset();
  companyField.classList.remove('open');
  selectedPlanNote.hidden = true;
  capybaraAddonNote.hidden = true;
  capybaraAdded = false;
  addCapybaraBtn.classList.remove('added');
  addCapybaraBtn.textContent = 'Add To Booking';
  bookingForm.querySelectorAll('.touched').forEach(f => f.classList.remove('touched'));
  showToast('Booking cleared');
});

// ============ DONATE ============
const donateTiers = document.querySelectorAll('.donate-tier');
let selectedDonation = null;
donateTiers.forEach(tier => {
  tier.addEventListener('click', () => {
    donateTiers.forEach(t => t.classList.remove('selected'));
    tier.classList.add('selected');
    selectedDonation = tier.getAttribute('data-amount');
  });
});
document.getElementById('donateNowBtn').addEventListener('click', () => {
  const amount = selectedDonation || '15';
  openModal({
    title: 'Thank You! 💚',
    body: `Your $${amount} donation is helping fund sanctuary care and rescue transport. You're keeping the weird alive.`,
    icon: '🌿'
  });
  launchConfetti();
});

// ============ OFFLINE / 404 PAGE ============
document.getElementById('tryAgainBtn').addEventListener('click', () => {
  showToast('Still feral. Try Flappy Goliath while you wait!');
});

// real offline detection (bonus, functional)
window.addEventListener('offline', () => { window.location.hash = '#/oddities-that-dont-exist'; });

// ============ FLAPPY GOLIATH MINI GAME ============
let gameInitialized = false;
let gameRunning = false;
let animFrame;

function initGameIfNeeded(){
  if(gameInitialized) return;
  gameInitialized = true;
  setupGame();
}

function setupGame(){
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');
  const playBtn = document.getElementById('playGameBtn');
  const W = canvas.width, H = canvas.height;

  let bird, pipes, score, gravity, frame;

  function reset(){
    bird = {x: W*0.28, y: H/2, vy: 0, r: 16};
    pipes = [];
    score = 0;
    gravity = 0.45;
    frame = 0;
  }
  reset();

  function spawnPipe(){
    const gap = 140;
    const top = 40 + Math.random() * (H - gap - 160);
    pipes.push({x: W + 20, top, gap, w: 56, passed:false});
  }

  function drawBackground(){
    ctx.fillStyle = '#B7E4F0';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#e8f7fb';
    for(let i=0;i<3;i++){
      const cx = ((frame*0.3)+i*180) % (W+120) - 60;
      ctx.beginPath();
      ctx.ellipse(cx, 70+i*20, 40, 18, 0, 0, Math.PI*2);
      ctx.ellipse(cx+30, 65+i*20, 30, 16, 0, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = '#8FD98C';
    ctx.fillRect(0, H-40, W, 40);
    ctx.fillStyle = '#7BC978';
    for(let x=0;x<W;x+=20){ ctx.fillRect(x, H-44, 10, 8); }
    ctx.fillStyle = '#D8C48A';
    ctx.fillRect(0, H-14, W, 14);
  }

  function drawPipe(p){
    ctx.fillStyle = '#6FAF63';
    ctx.strokeStyle = '#4F8546';
    ctx.lineWidth = 3;
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.strokeRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x-6, p.top-24, p.w+12, 24);
    ctx.strokeRect(p.x-6, p.top-24, p.w+12, 24);
    const bottomY = p.top + p.gap;
    ctx.fillRect(p.x, bottomY, p.w, H - bottomY - 14);
    ctx.strokeRect(p.x, bottomY, p.w, H - bottomY - 14);
    ctx.fillRect(p.x-6, bottomY, p.w+12, 24);
    ctx.strokeRect(p.x-6, bottomY, p.w+12, 24);
  }

  function drawBird(){
    ctx.save();
    ctx.translate(bird.x, bird.y);
    const angle = Math.max(-0.5, Math.min(0.9, bird.vy * 0.06));
    ctx.rotate(angle);
    // body
    ctx.fillStyle = '#8B93A0';
    ctx.beginPath();
    ctx.ellipse(0,0, 15, 12, 0, 0, Math.PI*2);
    ctx.fill();
    // wing
    ctx.fillStyle = '#6F7986';
    ctx.beginPath();
    ctx.ellipse(-4, 2, 9, 6, 0.4, 0, Math.PI*2);
    ctx.fill();
    // neck + head
    ctx.fillStyle = '#9BA3AF';
    ctx.beginPath();
    ctx.ellipse(11, -8, 6, 8, -0.3, 0, Math.PI*2);
    ctx.fill();
    // beak (shoebill signature)
    ctx.fillStyle = '#D9C9A3';
    ctx.strokeStyle = '#8a7a54';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15,-11);
    ctx.lineTo(30,-9);
    ctx.lineTo(28,-4);
    ctx.lineTo(15,-6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // eye
    ctx.fillStyle = '#20303a';
    ctx.beginPath();
    ctx.arc(14,-11,1.6,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function endGame(){
    gameRunning = false;
    cancelAnimationFrame(animFrame);
    ctx.fillStyle = 'rgba(22,58,86,0.55)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Baloo 2, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W/2, H/2 - 16);
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillText('Score: ' + score, W/2, H/2 + 16);
    playBtn.textContent = 'Play Again';
    playBtn.style.display = 'inline-flex';
  }

  function loop(){
    frame++;
    bird.vy += gravity;
    bird.y += bird.vy;

    if(frame % 95 === 0){ spawnPipe(); }
    pipes.forEach(p => p.x -= 2.6);
    while(pipes.length && pipes[0].x < -70){ pipes.shift(); }

    drawBackground();
    pipes.forEach(drawPipe);
    drawBird();

    ctx.fillStyle = '#163A56';
    ctx.font = 'bold 22px Baloo 2, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, W/2, 40);

    // collision
    let dead = bird.y + bird.r > H-14 || bird.y - bird.r < 0;
    pipes.forEach(p => {
      if(bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w){
        if(bird.y - bird.r < p.top || bird.y + bird.r > p.top + p.gap){
          dead = true;
        }
      }
      if(!p.passed && p.x + p.w < bird.x){ p.passed = true; score++; }
    });

    if(dead){ endGame(); return; }
    animFrame = requestAnimationFrame(loop);
  }

  function flap(){
    if(!gameRunning) return;
    bird.vy = -7.2;
  }

  function startGame(){
    reset();
    gameRunning = true;
    playBtn.style.display = 'none';
    animFrame = requestAnimationFrame(loop);
  }

  drawBackground();
  drawBird();

  playBtn.addEventListener('click', startGame);
  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, {passive:false});
  document.addEventListener('keydown', (e) => { if(e.code === 'Space' && gameRunning) flap(); });
}

// ============ CONFETTI ============
function launchConfetti(){
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const colors = ['#F5A524','#9B6BE0','#EA5FA8','#6FAAB7','#8FD98C'];
  const pieces = Array.from({length: 90}, () => ({
    x: Math.random()*canvas.width,
    y: -20 - Math.random()*canvas.height*0.4,
    w: 6+Math.random()*6,
    h: 8+Math.random()*8,
    color: colors[Math.floor(Math.random()*colors.length)],
    vy: 2+Math.random()*3,
    vx: -1.5+Math.random()*3,
    rot: Math.random()*360,
    vr: -6+Math.random()*12
  }));
  let t = 0;
  function tick(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if(t < 130){
      requestAnimationFrame(tick);
    } else {
      canvas.style.display = 'none';
    }
  }
  tick();
}

// ============ INIT ============
navigateTo(getRouteFromHash());
