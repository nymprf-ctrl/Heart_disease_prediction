
(function () {
  if (document.documentElement.classList.contains('light')) {
    document.getElementById('themeIcon').className = 'bi bi-moon-fill';
  }
})();

function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const isLight = html.classList.toggle('light');

  icon.classList.add('spin');
  setTimeout(() => icon.classList.remove('spin'), 500);
  icon.className  = isLight ? 'bi bi-moon-fill spin' : 'bi bi-sun-fill spin';
  icon.title      = isLight ? 'Switch to dark mode' : 'Switch to light mode';

  localStorage.setItem('cs-theme', isLight ? 'light' : 'dark');
}


function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sbOverlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
}


const pageNames = { assess: 'Risk Assessment', analytics: 'Analytics Dashboard' };

function showPage(name) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  document.getElementById('pg-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  document.getElementById('tb-title').textContent =
    'Technical Interface — ' + (pageNames[name] || '');
}


const hmap = {
  sex:   'h_sex',
  bp:    'h_bp',
  diab:  'h_diab',
  fh:    'h_fh',
  act:   'h_act',
  cp:    'h_cp',
  ecg:   'h_ecg',
  rwma:  'h_rwma',
  trop:  'h_trop',
  angio: 'h_angio',
};

function pick(field, value, cls, el) {
  const radioName = el.querySelector('input[type=radio]').name;
  document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
    r.closest('.btn-sel').classList.remove('s-r', 's-g', 's-o', 's-b', 's-p');
  });
  el.classList.add(cls);
  document.getElementById(hmap[field]).value = value;
}


function showResult(pred, conf, pyes, pno) {
  document.getElementById('rc-pend').classList.remove('show');

  const rc  = document.getElementById('rc-result');
  rc.classList.add('show');

  const pct = Math.round(conf * 100);
  document.getElementById('r-confv').textContent = pct + '%';
  document.getElementById('r-pyes').textContent  = pyes + '%';
  document.getElementById('r-pno').textContent   = pno  + '%';
  setTimeout(() => {
    document.getElementById('r-confb').style.width = pct + '%';
  }, 100);

  const rec = document.getElementById('r-rec');
  rec.style.display = 'block';

  if (pred === 1) {
    rc.classList.add('pos');
    rc.classList.remove('neg');
    document.getElementById('r-icon').textContent  = '⚠️';
    document.getElementById('r-label').textContent = 'Heart Disease Detected';
    document.getElementById('r-label').className   = 'rt r-p';
    document.getElementById('r-sub').textContent   = 'Model predicts presence of heart disease';
    document.getElementById('r-confb').style.background = '#ff5263';
    document.getElementById('r-note').textContent  =
      'Patient shows significant cardiac risk indicators. Immediate clinical evaluation recommended.';
    rec.style.cssText =
      'margin-top:.6rem;padding:.65rem .82rem;border-radius:9px;font-size:.74rem;font-weight:600;' +
      'background:rgba(255,82,99,.12);border:1px solid rgba(255,82,99,.28);color:#fca5a5;display:block;';
    rec.innerHTML =
      '<i class="bi bi-hospital"></i> Recommend: Schedule appointment with a <strong>Cardiologist</strong> immediately for advanced diagnostics.';
  } else {
    rc.classList.add('neg');
    rc.classList.remove('pos');
    document.getElementById('r-icon').textContent  = '✅';
    document.getElementById('r-label').textContent = 'No Heart Disease Detected';
    document.getElementById('r-label').className   = 'rt r-n';
    document.getElementById('r-sub').textContent   = 'Model predicts no heart disease at this time';
    document.getElementById('r-confb').style.background = '#22c55e';
    document.getElementById('r-note').textContent  =
      'No significant cardiac risk detected. Advise preventive lifestyle modifications and routine monitoring.';
    rec.style.cssText =
      'margin-top:.6rem;padding:.65rem .82rem;border-radius:9px;font-size:.74rem;font-weight:600;' +
      'background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);color:#86efac;display:block;';
    rec.innerHTML =
      '<i class="bi bi-check-circle"></i> Congratulations — Patient appears <strong>healthy</strong>. Schedule routine follow-up in 6–12 months.';
  }
}


function restoreSelections() {
  if (typeof FORM_VALS === 'undefined') return;
  Object.entries(FORM_VALS).forEach(([field, val]) => {
    if (val !== '' && hmap[field]) {
      document.getElementById(hmap[field]).value = val;
    }
  });
}

function clearForm() {
  document.getElementById('techForm').reset();
  document.querySelectorAll('.btn-sel').forEach(b =>
    b.classList.remove('s-r', 's-g', 's-o', 's-b', 's-p')
  );
  Object.values(hmap).forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('rc-pend').classList.add('show');
  const rc = document.getElementById('rc-result');
  rc.classList.remove('show', 'pos', 'neg');
  document.getElementById('r-confb').style.width = '0%';
  document.getElementById('r-rec').style.display = 'none';
}

document.getElementById('techForm').addEventListener('submit', function (e) {
  const required = [
    ['h_sex',   'Sex'],
    ['h_bp',    'Blood Pressure'],
    ['h_diab',  'Diabetes'],
    ['h_fh',    'Family History'],
    ['h_act',   'Physical Activity'],
    ['h_cp',    'Chest Pain'],
    ['h_ecg',   'ECG'],
    ['h_rwma',  'RWMA'],
    ['h_trop',  'Troponin'],
    ['h_angio', 'Angiography'],
  ];
  const missing = required
    .filter(([id]) => !document.getElementById(id).value)
    .map(([, label]) => label);

  if (missing.length) {
    e.preventDefault();
    alert('Please select: ' + missing.join(', '));
    return;
  }
  document.getElementById('spinner').classList.add('show');
  document.getElementById('submitBtn').disabled = true;
});
