// --- 1. جلب مواقيت الصلاة الحقيقية لمدينة القاهرة عبر API ---
async function fetchPrayerTimes() {
    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5');
        const data = await response.json();
        const timings = data.data.timings;

        document.getElementById('fajr-time').innerText = timings.Fajr;
        document.getElementById('sunrise-time').innerText = timings.Sunrise;
        document.getElementById('dhuhr-time').innerText = timings.Dhuhr;
        document.getElementById('asr-time').innerText = timings.Asr;
        document.getElementById('maghrib-time').innerText = timings.Maghrib;
        document.getElementById('isha-time').innerText = timings.Isha;
        
        document.getElementById('last-update').innerText = new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
        console.log('حدث خطأ أثناء تحميل مواقيت الصلاة:', error);
    }
}

// --- 2. إدارة التبويبات وتنقل الصفحات ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).classList.add('active-tab');
    event.target.classList.add('active');
}

// --- 3. جلب السور كاملة من API القرآن الكريم ---
const surahsList = [
    { id: 1, name: "الفاتحة" },
    { id: 112, name: "الإخلاص" },
    { id: 113, name: "الفلق" },
    { id: 114, name: "الناس" }
];

function initQuranModule() {
    const container = document.getElementById('surahButtons');
    container.innerHTML = '';

    surahsList.forEach(surah => {
        const btn = document.createElement('button');
        btn.className = 'surah-btn';
        btn.innerText = `${surah.id}. ${surah.name}`;
        btn.onclick = () => loadSurah(surah.id, surah.name, btn);
        container.appendChild(btn);
    });

    // تحميل الفاتحة افتراضياً
    loadSurah(1, "الفاتحة", container.firstChild);
}

async function loadSurah(id, name, btnElement) {
    document.querySelectorAll('.surah-btn').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    document.getElementById('surahTitle').innerText = `سورة ${name}`;
    document.getElementById('surahContent').innerText = "جاري تحميل السورة كاملة...";

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}`);
        const data = await response.json();
        
        let fullText = data.data.ayahs.map(ayah => `${ayah.text} ﴿${ayah.numberInSurah}﴾`).join(' ');
        
        // إزالة البسملة المكررة إن وجدت في أول السورة ما عدا الفاتحة
        if (id !== 1) {
            fullText = fullText.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "");
        }

        document.getElementById('surahContent').innerText = fullText;
    } catch (e) {
        document.getElementById('surahContent').innerText = "حدث خطأ في تحميل النص، يرجى التأكد من الاتصال بالإنترنت.";
    }
}

// --- 4. نظام الأذكار المطور ---
const azkarData = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
    "اللهم صلّ وسلم وبارك على نبينا محمد",
    "أستغفر الله العظيم وأتوب إليه"
];

let zikrIndex = 0;
function nextZikr() {
    zikrIndex = (zikrIndex + 1) % azkarData.length;
    document.getElementById('dailyZikr').innerText = azkarData[zikrIndex];
}

function initAzkarModule() {
    const container = document.getElementById('azkarContainer');
    container.innerHTML = '';

    azkarData.forEach((zk, idx) => {
        const card = document.createElement('div');
        card.className = 'azkar-card';
        card.innerHTML = `
            <span>${idx + 1}. ${zk}</span>
            <button class="btn-secondary" onclick="this.innerText = parseInt(this.innerText || 0) + 1">0</button>
        `;
        container.appendChild(card);
    });
}

// --- 5. نظام تسجيل الدخول والحساب المحلي (LocalStorage) ---
let isSignUpMode = false;

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('modalTitle').innerText = isSignUpMode ? "إنشاء حساب جديد" : "تسجيل الدخول";
    document.getElementById('submitBtn').innerText = isSignUpMode ? "حفظ الحساب" : "دخول";
    document.getElementById('toggleText').innerText = isSignUpMode ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟";
    document.getElementById('toggleLink').innerText = isSignUpMode ? "تسجيل الدخول" : "إنشاء حساب جديد";
}

function handleAuth(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;

    if (user) {
        localStorage.setItem('loggedInUser', user);
        updateUserUI(user);
        closeAuthModal();
    }
}

function updateUserUI(user) {
    if (user) {
        document.getElementById('authBtn').style.display = 'none';
        const userInfo = document.getElementById('userInfo');
        userInfo.style.display = 'inline-block';
        userInfo.innerText = `أهلاً بك، ${user}`;
        
        // تعديل الخطاب للمذكر
        document.getElementById('userGreeting').innerHTML = `السلام عليك،<br>يا ${user}.`;
    }
}

// Check saved user
window.onload = () => {
    fetchPrayerTimes();
    initQuranModule();
    initAzkarModule();

    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
        updateUserUI(savedUser);
    }
};