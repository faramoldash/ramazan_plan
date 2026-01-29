// Telegram Web App инициализациясы
const tg = window.Telegram.WebApp;

// Пользователь деректері
let userData = {
    fastingDays: [],
    goals: {
        quran: false,
        prayer: false,
        charity: false,
        dhikr: false
    },
    stats: {
        fastedDays: 0,
        quranPages: 0,
        charityCount: 0,
        prayerCount: 0
    },
    currentDate: new Date(),
    ramadanStart: new Date('2024-03-11'), // 2024 жылғы Рамадан басталуы
    location: 'Қазақстан'
};

// Намаз уақыттары (Қазақстан үшін шамамен)
const prayerTimes = {
    fajr: '05:30',
    dhuhr: '13:30',
    asr: '17:00',
    maghrib: '19:45',
    isha: '21:00'
};

// Дуалар тізімі (қазақша)
const duas = [
    {
        arabic: "اَللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
        translation: "Аллаһым! Сенің үшін ораза тұттым, саған сендім, саған жүгіндім және Сенің ризығыңбен ифтар жасадым."
    },
    {
        arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
        translation: "Шөлдік кетті, тамырлар ылғалданды және Аллаһтың қалауымен сыйлық бекітілді."
    },
    {
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ",
        translation: "Аллаһым! Мен сенен барлық нәрсені қамтыған мейірімің арқылы сұраймын."
    }
];

// Бағдарламаны инициализациялау
function initApp() {
    console.log('Рамадан Жоспарлаушысы қосылды!');
    
    // Telegram Web App баптаулары
    tg.expand(); // Экранды толық ашу
    tg.enableClosingConfirmation(); // Жабу растауын қосу
    tg.MainButton.hide(); // Негізгі түймені жасыру
    
    // Деректерді жүктеу
    loadUserData();
    
    // Интерфейсті жаңарту
    updateUI();
    
    // Таймерлерді бастау
    updateTimers();
    setInterval(updateTimers, 1000);
    
    // Күнтізбені жасау
    generateCalendar();
    
    // Күннің дуасын орнату
    setDailyDua();
    
    // Намаз уақыттарын орнату
    setPrayerTimes();
    
    // Рамадан күнін есептеу
    calculateRamadanDay();
}

// Деректерді жүктеу
function loadUserData() {
    const savedData = localStorage.getItem('ramadanPlannerData');
    if (savedData) {
        userData = JSON.parse(savedData);
        console.log('Деректер жүктелді:', userData);
    }
}

// Деректерді сақтау
function saveUserData() {
    localStorage.setItem('ramadanPlannerData', JSON.stringify(userData));
    console.log('Деректер сақталды');
}

// Интерфейсті жаңарту
function updateUI() {
    // Мақсаттарды жаңарту
    updateGoalsDisplay();
    
    // Статистиканы жаңарту
    updateStatsDisplay();
}

// Таймерлерді жаңарту
function updateTimers() {
    const now = new Date();
    
    // Ифтар таймері (Ақшам намазынан кейін)
    const maghribTime = prayerTimes.maghrib.split(':');
    const iftarTime = new Date(now);
    iftarTime.setHours(parseInt(maghribTime[0]), parseInt(maghribTime[1]), 0, 0);
    
    // Егер ақшам намазы өтіп кетсе, келесі күнге ауыстыру
    if (now > iftarTime) {
        iftarTime.setDate(iftarTime.getDate() + 1);
    }
    
    const iftarDiff = iftarTime - now;
    updateCountdown('iftar-countdown', iftarDiff);
    
    // Сәхәр таймері (Таң намазына дейін)
    const fajrTime = prayerTimes.fajr.split(':');
    const suhurTime = new Date(now);
    suhurTime.setHours(parseInt(fajrTime[0]), parseInt(fajrTime[1]), 0, 0);
    
    // Егер таң намазы өтіп кетсе, келесі күнге ауыстыру
    if (now > suhurTime) {
        suhurTime.setDate(suhurTime.getDate() + 1);
    }
    
    const suhurDiff = suhurTime - now;
    updateCountdown('suhur-countdown', suhurDiff);
}

// Уақыт санауышын жаңарту
function updateCountdown(elementId, diff) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById(elementId).textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Күнтізбені жасау
function generateCalendar() {
    const calendarGrid = document.getElementById('calendar');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const currentRamadanDay = calculateRamadanDay();
    
    // Айдың атауы
    const monthNames = [
        'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
        'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
    ];
    
    const currentMonth = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();
    document.getElementById('current-month').textContent = `${currentMonth} ${currentYear}`;
    
    // Күнтізбені толтыру (мысалы 30 күн)
    for (let day = 1; day <= 30; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Бүгін белгілеу
        if (day === currentRamadanDay) {
            dayElement.classList.add('today');
        }
        
        // Ораза тұтылған күндерді белгілеу
        if (userData.fastingDays.includes(day)) {
            dayElement.classList.add('fasted');
        }
        
        // Алдағы күндерді белгілеу
        if (day > currentRamadanDay) {
            dayElement.classList.add('future');
        }
        
        dayElement.onclick = () => toggleFastDay(day);
        calendarGrid.appendChild(dayElement);
    }
}

// Айды өзгерту
function changeMonth(direction) {
    // Бұл функцияны кейінірек толықтырамыз
    alert('Айды өзгерту функциясы әзірленуде');
}

// Ораза күнін белгілеу/өшіру
function toggleFastDay(day) {
    const index = userData.fastingDays.indexOf(day);
    
    if (index === -1) {
        // Оразаны белгілеу
        userData.fastingDays.push(day);
        userData.stats.fastedDays++;
        
        // Хижри күнін есептеу
        const hijriDate = calculateHijriDate();
        document.getElementById('hijri-date').textContent = hijriDate;
        
        showNotification(`Рамаданның ${day}-күні оразасы белгіленді!`);
    } else {
        // Оразаны өшіру
        userData.fastingDays.splice(index, 1);
        userData.stats.fastedDays--;
        
        showNotification(`Рамаданның ${day}-күні оразасы өшірілді`);
    }
    
    // Деректерді сақтау
    saveUserData();
    
    // Күнтізбені жаңарту
    generateCalendar();
    
    // Статистиканы жаңарту
    updateStatsDisplay();
}

// Мақсатты өзгерту
function toggleGoal(goalType) {
    const goalElement = document.querySelector(`[onclick="toggleGoal('${goalType}')"]`);
    const checkIcon = document.getElementById(`${goalType}-check`);
    
    // Мақсаттың ағымдағы жағдайы
    const isCompleted = userData.goals[goalType];
    
    if (!isCompleted) {
        // Мақсатты орындалды деп белгілеу
        userData.goals[goalType] = true;
        goalElement.classList.add('completed');
        
        // Статистиканы жаңарту
        switch(goalType) {
            case 'quran':
                userData.stats.quranPages += 20; // 1 жүз ≈ 20 парақ
                break;
            case 'prayer':
                userData.stats.prayerCount += 5; // 5 уақыт намаз
                break;
            case 'charity':
                userData.stats.charityCount++;
                break;
            case 'dhikr':
                // Зікір санын арттыру
                break;
        }
        
        showNotification('Мақсат орындалды! 🎉');
    } else {
        // Мақсатты қайтару
        userData.goals[goalType] = false;
        goalElement.classList.remove('completed');
        
        // Статистиканы қайтару
        switch(goalType) {
            case 'quran':
                userData.stats.quranPages = Math.max(0, userData.stats.quranPages - 20);
                break;
            case 'prayer':
                userData.stats.prayerCount = Math.max(0, userData.stats.prayerCount - 5);
                break;
            case 'charity':
                userData.stats.charityCount = Math.max(0, userData.stats.charityCount - 1);
                break;
        }
    }
    
    // Деректерді сақтау
    saveUserData();
    
    // Интерфейсті жаңарту
    updateGoalsDisplay();
    updateStatsDisplay();
}

// Мақсаттарды көрсету
function updateGoalsDisplay() {
    // Әр мақсаттың жағдайын тексеру
    Object.keys(userData.goals).forEach(goal => {
        const goalElement = document.querySelector(`[onclick="toggleGoal('${goal}')"]`);
        const checkIcon = document.getElementById(`${goal}-check`);
        
        if (userData.goals[goal]) {
            goalElement.classList.add('completed');
            if (checkIcon) checkIcon.style.display = 'block';
        } else {
            goalElement.classList.remove('completed');
            if (checkIcon) checkIcon.style.display = 'none';
        }
    });
}

// Статистиканы көрсету
function updateStatsDisplay() {
    document.getElementById('fasted-days').textContent = userData.stats.fastedDays;
    document.getElementById('quran-pages').textContent = userData.stats.quranPages;
    document.getElementById('charity-count').textContent = userData.stats.charityCount;
    document.getElementById('prayer-count').textContent = userData.stats.prayerCount;
}

// Күннің дуасын орнату
function setDailyDua() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const duaIndex = dayOfMonth % duas.length;
    
    document.getElementById('dua-text').textContent = duas[duaIndex].arabic;
    document.getElementById('dua-translation').textContent = duas[duaIndex].translation;
}

// Намаз уақыттарын орнату
function setPrayerTimes() {
    document.getElementById('fajr-time').textContent = prayerTimes.fajr;
    document.getElementById('maghrib-time').textContent = prayerTimes.maghrib;
}

// Рамадан күнін есептеу
function calculateRamadanDay() {
    const today = new Date();
    const timeDiff = today.getTime() - userData.ramadanStart.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
    
    // Рамадан 30 күн
    if (dayDiff >= 1 && dayDiff <= 30) {
        document.getElementById('current-day').textContent = dayDiff;
        return dayDiff;
    }
    
    return 1; // Әдепкі мән
}

// Хижри күнін есептеу
function calculateHijriDate() {
    const today = new Date();
    const ramadanStartHijri = 1445; // 2024 жылғы Рамадан хижри жылы
    const currentRamadanDay = calculateRamadanDay();
    
    return `Рамадан ${currentRamadanDay}, ${ramadanStartHijri} ж.`;
}

// Дуаны көшіру
function copyDua() {
    const duaText = document.getElementById('dua-text').textContent;
    const translation = document.getElementById('dua-translation').textContent;
    const textToCopy = `${duaText}\n\n${translation}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Дуа көшірілді! 📋');
    });
}

// Дуаны бөлісу
function shareDua() {
    if (navigator.share) {
        const duaText = document.getElementById('dua-text').textContent;
        const translation = document.getElementById('dua-translation').textContent;
        
        navigator.share({
            title: 'Рамадан дуасы',
            text: `${duaText}\n\n${translation}`,
            url: window.location.href
        });
    } else {
        // Telegram бот арқылы бөлісу
        tg.share({
            text: `${duaText}\n\n${translation}\n\nРамадан Жоспарлаушысы қосылыңыз!`,
            url: window.location.href
        });
    }
}

// Хабарландыру көрсету
function showNotification(message) {
    // Telegram Web App хабарландыруы
    if (tg.showPopup) {
        tg.showPopup({
            title: 'Хабарландыру',
            message: message,
            buttons: [{ type: 'ok' }]
        });
    } else {
        // Әдеттегі alert
        alert(message);
    }
}

// Беттер арасында ауысу
function showTab(tabName) {
    // Барлық түймелерден актив класын алып тастау
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ағымдағы түймеге актив класын қосу
    event.currentTarget.classList.add('active');
    
    // Беттерді ауыстыру логикасы (қарапайым нұсқа)
    alert(`${tabName} беті әзірленуде...`);
}

// Бағдарламаны іске қосу
document.addEventListener('DOMContentLoaded', initApp);