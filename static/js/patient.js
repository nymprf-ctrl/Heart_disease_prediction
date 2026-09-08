(function () {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) document.getElementById('themeIcon').className = 'bi bi-sun-fill';
  document.getElementById('themeBtn').dataset.tooltip =
    isDark ? 'Switch to light' : 'Switch to dark';
})();

function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const btn  = document.getElementById('themeBtn');
  const isDark = html.classList.toggle('dark');

  icon.classList.add('spin');
  setTimeout(() => icon.classList.remove('spin'), 450);
  icon.className = isDark ? 'bi bi-sun-fill spin' : 'bi bi-moon-fill spin';
  btn.dataset.tooltip = isDark ? 'Switch to light' : 'Switch to dark';
  localStorage.setItem('cs-pt-theme', isDark ? 'dark' : 'light');
}

let isUrdu       = false;
let currentSlide = 0;
const answers    = { age: 25, sex: '', bp: '', diab: '', fh: '', act: '', cp: '' };

const labels = {
  en: {
    sex:  { 1: 'Male',            0: 'Female' },
    bp:   { 0: 'Normal',          1: 'Low BP',              2: 'High BP' },
    diab: { 1: 'Yes',             0: 'No' },
    fh:   { 1: 'Yes — Family has it', 0: 'No / Not sure' },
    act:  { 0: 'Not active',      1: 'Somewhat active',     2: 'Very active' },
    cp:   { 0: 'No chest pain',   1: 'Pain when active',    2: 'Sudden pain' },
  },
  ur: {
    sex:  { 1: 'مرد',             0: 'عورت' },
    bp:   { 0: 'نارمل',           1: 'کم بلڈ پریشر',        2: 'ہائی بلڈ پریشر' },
    diab: { 1: 'ہاں',             0: 'نہیں' },
    fh:   { 1: 'ہاں — خاندان میں ہے', 0: 'نہیں / معلوم نہیں' },
    act:  { 0: 'غیر متحرک',       1: 'کچھ متحرک',           2: 'بہت متحرک' },
    cp:   { 0: 'کوئی درد نہیں',  1: 'کام پر درد',           2: 'اچانک درد' },
  },
};

const T = {
  en: {
    back: 'Back', next: 'Next', prev: 'Back', reviewAns: 'Review Answers',
    getResult: 'Get My Result', editAns: 'Edit Answers',
    checkAgain: 'Check Again', backHome: 'Back to Home',
    q1n: 'Question 1 / 7', q1t: 'How old are you?',
    q1h: 'Use + and − buttons to set your age', q1unit: 'years old',
    typeHint: 'Or type your age above',
    q2n: 'Question 2 / 7', q2t: 'Are you male or female?', q2h: 'Tap one to select',
    q3n: 'Question 3 / 7', q3t: 'How is your blood pressure?',
    q3h: 'Your doctor may have told you. Not sure? Pick Normal.',
    q4n: 'Question 4 / 7', q4t: 'Do you have sugar disease?',
    q4h: 'Also called "diabetes"',
    q5n: 'Question 5 / 7', q5t: 'Heart disease in your family?',
    q5h: 'Father, mother, brother or sister — did they have a heart attack?',
    q6n: 'Question 6 / 7', q6t: 'How much do you move in a day?',
    q6h: 'Walking, working, daily exercise — how active are you?',
    q7n: 'Question 7 / 7', q7t: 'Do you feel chest pain?',
    q7h: 'Pick what feels most like you',
    sumTitle: 'Check Your Answers', sumSub: 'Make sure everything is correct',
    sq: { age: 'Age', sex: 'Sex', bp: 'Blood Pressure', diab: 'Sugar Disease',
          fh: 'Family Heart Disease', act: 'Daily Activity', cp: 'Chest Pain' },
    privacy: '🔒 Your answers are private and not saved anywhere.',
    progOf: 'Question {c} of 7',
    diseaseChance: 'Disease chance: ', healthyChance: 'Healthy chance: ',
    aiConf: 'Heart Disease Risk',
    riskSlight: 'Slight Chances of Heart Disease', riskMed: 'Low Heart Disease Risk',
    riskHigh: 'Higher Risk of Heart Disease', riskLow: 'Congratulations!',
    msgSlight: "Based on your answers, there's a slight chance of heart disease. It's a good idea to get checked when you can.",
    msgMed: "Based on your answers, our AI estimates a low-level risk of heart disease. It's worth getting checked to be safe.",
    msgHigh: "Based on your answers, our AI found signs of possible heart disease risk. Please don't ignore this.",
    msgLow:  'Based on your answers, you appear to have a lower risk of heart disease right now. Stay healthy!',
    recSlight: 'Consider visiting a doctor for a general check-up in the next few weeks — no need to worry too much.',
    recMed: 'Consider booking an appointment with a doctor soon to get this checked properly.',
    recHigh: 'You should make an appointment with a Heart Doctor (Cardiologist) as soon as possible.',
    recLow:  'Congratulations! You appear healthy. Eat well, stay active, and visit a doctor for regular check-ups.',
    restart: 'Check Again', home: 'Back to Home',
  },
  ur: {
    back: 'واپس', next: 'اگلا', prev: 'پچھلا', reviewAns: 'جوابات دیکھیں',
    getResult: 'نتیجہ دیکھیں', editAns: 'جوابات بدلیں',
    checkAgain: 'دوبارہ جانچیں', backHome: 'گھر واپس',
    q1n: 'سوال 1 / 7', q1t: 'آپ کی عمر کتنی ہے؟',
    q1h: '+ اور − سے عمر لگائیں', q1unit: 'سال',
    typeHint: 'یا اوپر عمر لکھیں',
    q2n: 'سوال 2 / 7', q2t: 'آپ مرد ہیں یا عورت؟', q2h: 'ایک پر ٹچ کریں',
    q3n: 'سوال 3 / 7', q3t: 'آپ کا بلڈ پریشر کیسا ہے؟',
    q3h: 'ڈاکٹر نے بتایا ہو تو وہ چنیں۔ معلوم نہ ہو تو نارمل چنیں۔',
    q4n: 'سوال 4 / 7', q4t: 'کیا آپ کو شوگر کی بیماری ہے؟',
    q4h: '"شوگر" یا "ذیابیطس" — ایک ہی بیماری ہے',
    q5n: 'سوال 5 / 7', q5t: 'کیا خاندان میں دل کی بیماری ہے؟',
    q5h: 'والد، والدہ، بھائی، بہن — کسی کو دل کا دورہ؟',
    q6n: 'سوال 6 / 7', q6t: 'آپ دن میں کتنا چلتے پھرتے ہیں؟',
    q6h: 'روزانہ چلنا، کام کرنا، ورزش — کتنا کرتے ہیں؟',
    q7n: 'سوال 7 / 7', q7t: 'کیا آپ کے سینے میں درد ہوتا ہے؟',
    q7h: 'جو آپ کے قریب ہو وہ چنیں',
    sumTitle: 'اپنے جوابات دیکھیں', sumSub: 'یقین کریں کہ سب ٹھیک ہے',
    sq: { age: 'عمر', sex: 'جنس', bp: 'بلڈ پریشر', diab: 'شوگر',
          fh: 'خاندان میں دل کی بیماری', act: 'روزانہ سرگرمی', cp: 'سینے کا درد' },
    privacy: '🔒 آپ کے جوابات نجی ہیں اور کہیں محفوظ نہیں کیے جاتے۔',
    progOf: 'سوال {c} / 7',
    diseaseChance: 'بیماری کا امکان: ', healthyChance: 'صحتمند کا امکان: ',
    aiConf: 'دل کی بیماری کا خطرہ',
    riskSlight: 'دل کی بیماری کے معمولی امکانات', riskMed: 'دل کی بیماری کا کم خطرہ',
    riskHigh: 'دل کی بیماری کا زیادہ خطرہ', riskLow: 'مبارک ہو!',
    msgSlight: 'آپ کے جوابات کے مطابق دل کی بیماری کا معمولی سا امکان ہے۔ جب موقع ملے معائنہ کروا لیں۔',
    msgMed: 'آپ کے جوابات کے مطابق، AI کا اندازہ ہے کہ دل کی بیماری کا خطرہ کم درجے پر ہے۔ احتیاطاً معائنہ کروا لینا بہتر ہے۔',
    msgHigh: 'آپ کے جوابات کی بنیاد پر، AI نے دل کی بیماری سے جڑی علامات پائی ہیں۔ براہ کرم نظرانداز نہ کریں۔',
    msgLow:  'آپ کے جوابات کی بنیاد پر، ابھی آپ کو دل کی بیماری کا کم خطرہ ہے۔ صحتمند رہیں!',
    recSlight: 'اگلے چند ہفتوں میں عام معائنے کے لیے ڈاکٹر سے مل لیں — زیادہ فکر کی بات نہیں۔',
    recMed: 'جلد ڈاکٹر سے ملاقات کر کے اس کا معائنہ کروا لیں۔',
    recHigh: 'آپ کو جلد از جلد دل کے ڈاکٹر (کارڈیالوجسٹ) سے ملاقات کرنی چاہیے۔',
    recLow:  'مبارک ہو! آپ صحتمند نظر آتے ہیں۔ صحتمند کھانا کھائیں، ورزش کریں اور ڈاکٹر سے ملتے رہیں۔',
    restart: 'دوبارہ جانچیں', home: 'گھر واپس',
  },
};

function toggleLang() {
  isUrdu = !isUrdu;
  document.getElementById('langLbl').textContent  = isUrdu ? 'English' : 'اردو';
  document.getElementById('langFlag').textContent = isUrdu ? '🇬🇧' : '🇵🇰';
  document.getElementById('htmlRoot').dir = isUrdu ? 'rtl' : 'ltr';
  document.getElementById('backTxt').textContent  = isUrdu ? 'واپس' : 'Back';
  applyTranslations();
}

function applyTranslations() {
  const L = isUrdu ? T.ur : T.en;
  const qmap = [
    ['qn0','q1n'],['qt0','q1t'],['qh0','q1h'],
    ['qn1','q2n'],['qt1','q2t'],['qh1','q2h'],
    ['qn2','q3n'],['qt2','q3t'],['qh2','q3h'],
    ['qn3','q4n'],['qt3','q4t'],['qh3','q4h'],
    ['qn4','q5n'],['qt4','q5t'],['qh4','q5h'],
    ['qn5','q6n'],['qt5','q6t'],['qh5','q6h'],
    ['qn6','q7n'],['qt6','q7t'],['qh6','q7h'],
  ];
  qmap.forEach(([elid, key]) => {
    const el = document.getElementById(elid);
    if (el && L[key]) el.textContent = L[key];
  });
  document.getElementById('ageUnit').textContent  = L.q1unit;
  document.getElementById('typeHint').textContent = L.typeHint;
  for (let i = 0; i < 7; i++) {
    const nt = document.getElementById('nextTxt' + i);
    const pt = document.getElementById('prevTxt' + i);
    if (nt) nt.textContent = (i === 6) ? L.reviewAns : L.next;
    if (pt) pt.textContent = L.prev;
  }
  document.getElementById('sumTitle').textContent   = L.sumTitle;
  document.getElementById('sumSub').textContent     = L.sumSub;
  document.getElementById('submitTxt').textContent  = L.getResult;
  document.getElementById('editBtn').querySelector('span').textContent = L.editAns;
  document.getElementById('privacyTxt').textContent = L.privacy;
  Object.entries(L.sq).forEach(([k, v]) => {
    const el = document.getElementById('sq-' + k);
    if (el) el.textContent = v;
  });

  const choiceMap = [
    ['sex-m',  'Male',                       'مرد'],
    ['sex-f',  'Female',                     'عورت'],
    ['bp0e',   'Normal blood pressure',      'نارمل بلڈ پریشر'],
    ['bp1e',   'Low blood pressure',         'کم بلڈ پریشر'],
    ['bp2e',   'High blood pressure',        'ہائی بلڈ پریشر'],
    ['diab1e', 'Yes, I have it',             'ہاں، مجھے شوگر ہے'],
    ['diab0e', "No, I don't",               'نہیں، مجھے نہیں'],
    ['fh1e',   'Yes, in my family',          'ہاں، خاندان میں ہے'],
    ['fh0e',   'No / Not sure',             'نہیں / معلوم نہیں'],
    ['act0e',  'Not very active',            'زیادہ متحرک نہیں'],
    ['act1e',  'Somewhat active',            'کچھ متحرک'],
    ['act2e',  'Very active',               'بہت متحرک'],
    ['cp0e',   'No chest pain',             'سینے میں کوئی درد نہیں'],
    ['cp1e',   'Pain when I work or walk fast', 'کام پر سینہ تنگ'],
    ['cp2e',   'Sudden or scary chest pain', 'اچانک شدید درد'],
  ];
  choiceMap.forEach(([id, en, ur]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isUrdu ? ur : en;
  });

  document.getElementById('restartTxt').textContent = L.restart || L.checkAgain;
  document.getElementById('homeTxt').textContent    = L.home;
  document.getElementById('confLbl').textContent    = L.aiConf;
  updateProgress();
  buildSummary();

  // If the result screen is currently showing, re-render it so the
  // risk title/message/recommendation switch language too (previously
  // toggling language while viewing a result left that text stale).
  if (lastResult) {
    showResult(lastResult.pred, lastResult.conf, lastResult.pyes, lastResult.pno);
  }
}

function updateProgress() {
  const c = currentSlide;
  if (c > 6) {
    document.getElementById('progFill').style.width = '100%';
    document.getElementById('progPct').textContent  = '100%';
    document.getElementById('progStep').textContent = '';
    return;
  }
  const pct = Math.round((c / 7) * 100);
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('progPct').textContent  = pct + '%';
  const L = isUrdu ? T.ur : T.en;
  document.getElementById('progStep').textContent = L.progOf.replace('{c}', c + 1);
  for (let i = 0; i < 7; i++) {
    document.getElementById('dot' + i).className =
      'dot' + (i < c ? ' done' : i === c ? ' active' : '');
  }
}

function changeAge(delta) {
  let v = answers.age + delta;
  if (v < 1)   v = 1;
  if (v > 120) v = 120;
  answers.age = v;
  document.getElementById('ageDisplay').textContent = v;
  document.getElementById('ageTyped').value         = v;
}
function syncAgeFromInput() {
  let v = parseInt(document.getElementById('ageTyped').value) || 1;
  if (v < 1)   v = 1;
  if (v > 120) v = 120;
  answers.age = v;
  document.getElementById('ageDisplay').textContent = v;
}

function choose(field, value, selClass, btn) {
  const grp = document.getElementById('choices-' + field);
  grp.querySelectorAll('.choice-btn').forEach(b =>
    b.classList.remove('sel-green', 'sel-red', 'sel-orange', 'sel-blue')
  );
  btn.classList.add(selClass);
  answers[field] = value;
  const slideMap = { sex: 1, bp: 2, diab: 3, fh: 4, act: 5, cp: 6 };
  const nextBtn  = document.getElementById('btn' + slideMap[field]);
  if (nextBtn) nextBtn.disabled = false;
}

function goToSlide(n, backwards) {
  const prev = document.getElementById('slide-' + currentSlide) ||
               document.getElementById('slide-sum');
  if (prev) prev.classList.remove('active', 'back-anim');
  currentSlide = n;
  updateProgress();
  const next = document.getElementById('slide-' + n);
  if (next) {
    next.classList.add('active');
    if (backwards) next.classList.add('back-anim');
    else           next.classList.remove('back-anim');
    next.scrollTop = 0;
  }
}

function nextSlide(fromIdx) {
  if (fromIdx === 0) {
    const age = answers.age;
    if (!age || age < 1 || age > 120) {
      alert(isUrdu
        ? 'درست عمر درج کریں۔'
        : 'Please enter a valid age (1–120).');
      return;
    }
  }
  goToSlide(fromIdx + 1, false);
}

function prevSlide(fromIdx) { goToSlide(fromIdx - 1, true); }

function goToSummary() {
  const cur = document.getElementById('slide-6');
  if (cur) cur.classList.remove('active');
  currentSlide = 7;
  updateProgress();
  buildSummary();
  const sum = document.getElementById('slide-sum');
  sum.classList.add('active');
  sum.scrollTop = 0;
}

function buildSummary() {
  const lang = isUrdu ? 'ur' : 'en';
  const L    = labels[lang];

  document.getElementById('f_age').value  = answers.age;
  document.getElementById('f_sex').value  = answers.sex;
  document.getElementById('f_bp').value   = answers.bp;
  document.getElementById('f_diab').value = answers.diab;
  document.getElementById('f_fh').value   = answers.fh;
  document.getElementById('f_act').value  = answers.act;
  document.getElementById('f_cp').value   = answers.cp;

  document.getElementById('sa-age').textContent = answers.age + (isUrdu ? ' سال' : ' yrs');

  function setAns(id, field, greenVal) {
    const el  = document.getElementById('sa-' + id);
    const map = L[field];
    if (!el) return;
    if (answers[field] === '') { el.textContent = '—'; el.className = 'sum-a'; return; }
    el.textContent = map[answers[field]] || answers[field];
    el.className   = 'sum-a ' + (answers[field] == greenVal ? 'a-green' : 'a-red');
  }

  setAns('sex',  'sex',  '1');
  setAns('bp',   'bp',   '0');
  setAns('diab', 'diab', '0');
  setAns('fh',   'fh',   '0');
  setAns('act',  'act',  '2');
  setAns('cp',   'cp',   '0');
}


let lastResult = null;   // re-rendered by applyTranslations() if the user switches language while viewing this screen

function showResult(pred, conf, pyes, pno) {
  lastResult = { pred, conf, pyes, pno };

  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.getElementById('progressWrap').style.display = 'none';

  const rs = document.getElementById('slide-result');
  rs.classList.add('active');
  rs.scrollTop = 0;

  const L = isUrdu ? T.ur : T.en;

  // pyes/pno arrive already as 0-100 percentages (Flask sends round(prob*100,1)).
  // The bar + label now track the SAME number the tier message is based on —
  // previously this bar showed the model's confidence in whichever class it
  // predicted, which could be high even when the predicted class was "healthy",
  // making the number look disconnected from the actual risk message.
  const riskPct = Math.round(pyes);

  document.getElementById('confPct').textContent = riskPct + '%';
  document.getElementById('r-pyes').textContent  = L.diseaseChance + pyes + '%';
  document.getElementById('r-pno').textContent   = L.healthyChance + pno  + '%';
  setTimeout(() => {
    document.getElementById('confBar').style.width = riskPct + '%';
  }, 300);

  const card = document.getElementById('resultCard');
  const rec  = document.getElementById('recBox');

  // Graduated risk tiers, driven purely by the model's estimated probability
  // of heart disease (pyes) -- NOT the old class-agnostic "confidence" value.
  //   < 60%    -> healthy / lower risk
  //   60-65%   -> slight chances of heart disease
  //   65-75%   -> low heart disease risk
  //   75-100%  -> higher risk of heart disease
  let sev, icon, title, msg, recTxt, positive;

  if (pyes >= 75) {
    positive = true;  sev = 'sev-high';   icon = '🚨';
    title = L.riskHigh;   msg = L.msgHigh;   recTxt = L.recHigh;
  } else if (pyes >= 65) {
    positive = true;  sev = 'sev-med';    icon = '⚠️';
    title = L.riskMed;    msg = L.msgMed;    recTxt = L.recMed;
  } else if (pyes >= 60) {
    positive = true;  sev = 'sev-slight'; icon = '⚠️';
    title = L.riskSlight; msg = L.msgSlight; recTxt = L.recSlight;
  } else {
    positive = false; sev = '';           icon = '💚';
    title = L.riskLow;    msg = L.msgLow;    recTxt = L.recLow;
  }

  card.className = 'result-card ' + (positive ? 'r-pos' : 'r-neg') + (sev ? ' ' + sev : '');
  document.getElementById('r-icon').textContent  = icon;
  document.getElementById('r-title').textContent = title;
  document.getElementById('r-title').className  =
    'result-title ' + (positive ? 'rt-pos' : 'rt-neg') + (sev ? ' ' + sev : '');
  document.getElementById('r-msg').textContent   = msg;

  rec.className = 'rec-box ' + (positive ? 'rec-pos' : 'rec-neg') + (sev ? ' ' + sev : '');
  rec.innerHTML = `<i class="bi ${positive ? 'bi-hospital-fill' : 'bi-check-circle-fill'}"></i><span>${recTxt}</span>`;
}

function restartAll() {
  Object.keys(answers).forEach(k => { if (k !== 'age') answers[k] = ''; });
  answers.age = 25;
  document.getElementById('ageDisplay').textContent = '25';
  document.getElementById('ageTyped').value         = '25';
  document.querySelectorAll('.choice-btn').forEach(b =>
    b.classList.remove('sel-green', 'sel-red', 'sel-orange', 'sel-blue')
  );
  document.querySelectorAll('.btn-next[id^=btn]').forEach((b, i) => {
    if (i > 0) b.disabled = true;
  });
  document.getElementById('progressWrap').style.display = 'block';
  goToSlide(0, false);
  window.location.href = '/patient';
}
document.getElementById('ptForm').addEventListener('submit', function (e) {
  const required = [
    ['f_sex',  'Sex'],
    ['f_bp',   'Blood Pressure'],
    ['f_diab', 'Diabetes'],
    ['f_fh',   'Family History'],
    ['f_act',  'Activity'],
    ['f_cp',   'Chest Pain'],
  ];
  const missing = required.filter(([id]) => !document.getElementById(id).value);
  if (missing.length) {
    e.preventDefault();
    alert(isUrdu
      ? 'کچھ جوابات نامکمل ہیں۔ واپس جا کر مکمل کریں۔'
      : 'Some answers are missing. Go back and complete them.');
    return;
  }
  document.getElementById('subSpin').classList.remove('d-none');
  document.getElementById('submitBtn').disabled = true;
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('ageDisplay').textContent = answers.age;
  document.getElementById('ageTyped').value         = answers.age;
  applyTranslations();   // ensures default English text always matches T.en (e.g. confLbl)

  if (typeof PATIENT_RESULT !== 'undefined') {
    showResult(
      PATIENT_RESULT.prediction,
      PATIENT_RESULT.confidence,
      PATIENT_RESULT.prob_yes,
      PATIENT_RESULT.prob_no
    );
  }
});
