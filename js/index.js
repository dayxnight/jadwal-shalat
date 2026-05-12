const selectProvinsi = document.getElementById("modal-provinsi");
const selectKabkota = document.getElementById("modal-kabkota");
const onboardingModal = document.getElementById("onboarding-modal");
const settingsModal = document.getElementById("settings-modal");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");
const btnRetry = document.getElementById("btn-retry");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const btnSaveLocation = document.getElementById("btn-save-location");
const btnDetect = document.getElementById("btn-detect");
const loadingOverlay = document.getElementById("loading-overlay");
const menuBtn = document.getElementById("menu-btn");
const closeSettings = document.getElementById("close-settings");
const btnToggleTheme = document.getElementById("btn-toggle-theme");
const btnChangeLocation = document.getElementById("btn-change-location");
const currentCityDisplay = document.getElementById("current-city");

let currentMonthSchedule = null;
let countdownInterval = null;

// --- UI Utilities ---
const showToast = (message, duration = 3000) => {
    toastMessage.innerText = message;
    toast.classList.remove("hidden");
    gsap.fromTo(toast, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
    
    setTimeout(() => {
        gsap.to(toast, { y: 50, opacity: 0, duration: 0.4, onComplete: () => toast.classList.add("hidden") });
    }, duration);
};

const showError = (msg, onRetry) => {
    errorMessage.innerText = msg;
    errorContainer.classList.remove("hidden");
    animateModalOpen("#error-container");
    
    const retryHandler = () => {
        animateModalClose("#error-container");
        onRetry();
        btnRetry.removeEventListener("click", retryHandler);
    };
    btnRetry.addEventListener("click", retryHandler);
};

const hideError = () => {
    if (!errorContainer.classList.contains("hidden")) {
        animateModalClose("#error-container");
    }
};

// --- GSAP Animations ---
const animateEntrance = () => {
    const tl = gsap.timeline();
    tl.from(".app-bar", { y: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
      .from(".badge-container", { scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.3")
      .from(".main-card", { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.2")
      .from(".list-item", { x: -20, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }, "-=0.4");
};

const animateModalOpen = (modalSelector) => {
    gsap.set(`${modalSelector} .modal-content`, { scale: 0.9, opacity: 0, y: 20 });
    gsap.to(modalSelector, { opacity: 1, duration: 0.3, display: "flex" });
    gsap.to(`${modalSelector} .modal-content`, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)", delay: 0.1 });
};

const animateModalClose = (modalSelector) => {
    gsap.to(`${modalSelector} .modal-content`, { scale: 0.9, opacity: 0, y: 20, duration: 0.3, ease: "power2.in" });
    gsap.to(modalSelector, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: () => {
        const el = document.querySelector(modalSelector);
        if (el) el.classList.add("hidden");
    }});
};

const showLoading = () => {
    loadingOverlay.classList.remove("hidden");
    gsap.to(loadingOverlay, { opacity: 1, duration: 0.3 });
};

const hideLoading = () => {
    gsap.to(loadingOverlay, { opacity: 0, duration: 0.3, onComplete: () => {
        loadingOverlay.classList.add("hidden");
    }});
};

// --- Core Logic ---
const updateThemeColorMeta = (theme) => {
    const metaThemeColor = document.getElementById("meta-theme-color");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", theme === "dark" ? "#111412" : "#fbfdf9");
    }
};

const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
    updateThemeColorMeta(savedTheme);
};

const updateThemeIcon = (theme) => {
    const icon = document.getElementById("theme-icon-menu");
    if (icon) icon.innerText = theme === "dark" ? "light_mode" : "dark_mode";
};

btnToggleTheme.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
    updateThemeColorMeta(newTheme);
    setTimeout(() => animateModalClose("#settings-modal"), 200);
});

menuBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
    animateModalOpen("#settings-modal");
});

closeSettings.addEventListener("click", () => animateModalClose("#settings-modal"));

window.addEventListener("click", (e) => {
    if (e.target === settingsModal) animateModalClose("#settings-modal");
});

const fetchHijriDate = async (forceRefresh = false) => {
    try {
        const now = new Date();
        const dateKey = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const cachedHijri = JSON.parse(localStorage.getItem("cachedHijri"));

        if (!forceRefresh && cachedHijri && cachedHijri.dateKey === dateKey) {
            document.getElementById("hijri").innerText = cachedHijri.text;
            return;
        }

        const res = await fetch(`https://api.aladhan.com/v1/gToH/${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`);
        const response = await res.json();
        if (response.code === 200) {
            const h = response.data.hijri;
            const hijriMonthsIndo = {
                1: "Muharram", 2: "Safar", 3: "Rabiul Awal", 4: "Rabiul Akhir",
                5: "Jumadil Awal", 6: "Jumadil Akhir", 7: "Rajab", 8: "Sya'ban",
                9: "Ramadhan", 10: "Syawal", 11: "Dzulqa'dah", 12: "Dzulhijjah"
            };
            const hijriText = `${h.day} ${hijriMonthsIndo[h.month.number]} ${h.year} H`;
            document.getElementById("hijri").innerText = hijriText;
            localStorage.setItem("cachedHijri", JSON.stringify({ dateKey, text: hijriText }));
        }
    } catch (error) {
        console.error("Hijri Fetch Error:", error);
    }
};

const fetchProvinces = async () => {
    try {
        const cached = JSON.parse(localStorage.getItem("cachedProvinces"));
        if (cached && (Date.now() - cached.timestamp < 86400000)) {
            renderProvinces(cached.data);
            return cached.data;
        }

        const res = await fetch("https://equran.id/api/v2/shalat/provinsi");
        const response = await res.json();
        if (response.code === 200) {
            renderProvinces(response.data);
            localStorage.setItem("cachedProvinces", JSON.stringify({ data: response.data, timestamp: Date.now() }));
            return response.data;
        }
    } catch (error) {
        showError("Gagal mengambil data provinsi. Periksa koneksi Anda.", fetchProvinces);
    }
    return [];
};

const renderProvinces = (data) => {
    selectProvinsi.innerHTML = '<option value="">Pilih Provinsi</option>';
    data.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p; opt.innerText = p;
        selectProvinsi.appendChild(opt);
    });
};

const fetchCities = async (provinsi) => {
    try {
        const cacheKey = `cities_${provinsi}`;
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached && (Date.now() - cached.timestamp < 86400000)) {
            renderCities(cached.data);
            return cached.data;
        }

        showLoading();
        const res = await fetch("https://equran.id/api/v2/shalat/kabkota", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provinsi })
        });
        const response = await res.json();
        if (response.code === 200) {
            renderCities(response.data);
            localStorage.setItem(cacheKey, JSON.stringify({ data: response.data, timestamp: Date.now() }));
            return response.data;
        }
    } catch (error) {
        showError("Gagal mengambil data kota.", () => fetchCities(provinsi));
    } finally {
        hideLoading();
    }
    return [];
};

const renderCities = (data) => {
    selectKabkota.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
    data.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.innerText = c;
        selectKabkota.appendChild(opt);
    });
    selectKabkota.disabled = false;
};

const fetchPrayerTimes = async (provinsi, kabkota, forceRefresh = false) => {
    const now = new Date();
    const cacheKey = `schedule_${provinsi}_${kabkota}_${now.getMonth() + 1}_${now.getFullYear()}`;
    
    if (!forceRefresh) {
        const cached = JSON.parse(localStorage.getItem("currentSchedule"));
        if (cached && cached.key === cacheKey) {
            currentMonthSchedule = cached.data;
            updateScheduleUI(currentMonthSchedule, now.getDate(), kabkota);
            fetchHijriDate();
            return;
        }
    }

    try {
        showLoading();
        const res = await fetch("https://equran.id/api/v2/shalat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provinsi, kabkota, bulan: now.getMonth() + 1, tahun: now.getFullYear() })
        });
        const response = await res.json();
        if (response.code === 200) {
            currentMonthSchedule = response.data.jadwal;
            localStorage.setItem("currentSchedule", JSON.stringify({ key: cacheKey, data: currentMonthSchedule }));
            updateScheduleUI(currentMonthSchedule, now.getDate(), response.data.kabkota);
            fetchHijriDate(true);
            
            if (!onboardingModal.classList.contains("hidden")) animateModalClose("#onboarding-modal");
            if (!settingsModal.classList.contains("hidden")) animateModalClose("#settings-modal");
            gsap.from(".list-item", { x: -20, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
        }
    } catch (error) {
        showError("Gagal mengambil jadwal shalat.", () => fetchPrayerTimes(provinsi, kabkota));
    } finally {
        hideLoading();
    }
};

const updateScheduleUI = (schedule, todayDate, cityLabel) => {
    const timings = schedule.find(j => parseInt(j.tanggal) === todayDate) || schedule[todayDate - 1];
    currentCityDisplay.innerText = cityLabel;
    document.getElementById("hari").innerText = timings.hari;
    document.getElementById("date").innerText = timings.tanggal_lengkap;
    
    const prayers = ["imsak", "subuh", "dhuha", "dzuhur", "ashar", "maghrib", "isya"];
    prayers.forEach(p => {
        const el = document.getElementById(p);
        if (el) {
            el.innerText = timings[p];
            el.closest(".list-item").classList.remove("active");
        }
    });
    startCountdown();
};

const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval);

    const updateCountdown = () => {
        const now = new Date();
        const todayDate = now.getDate();
        const timings = currentMonthSchedule.find(j => parseInt(j.tanggal) === todayDate);
        if (!timings) return;

        const prayerOrder = [
            { name: "Imsak", time: timings.imsak },
            { name: "Subuh", time: timings.subuh },
            { name: "Dhuha", time: timings.dhuha },
            { name: "Dzuhur", time: timings.dzuhur },
            { name: "Ashar", time: timings.ashar },
            { name: "Maghrib", time: timings.maghrib },
            { name: "Isya", time: timings.isya }
        ];

        let nextPrayer = null;
        let activeId = "isya";

        for (let i = 0; i < prayerOrder.length; i++) {
            const [h, m] = prayerOrder[i].time.split(":").map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(h, m, 0);

            if (now < prayerDate) {
                nextPrayer = { ...prayerOrder[i], date: prayerDate };
                break;
            }
            activeId = prayerOrder[i].name.toLowerCase();
            
            // Pulse check: if current time matches prayer time (exact minute)
            if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() === 0) {
                showToast(`Waktu ${prayerOrder[i].name} telah tiba!`, 5000);
            }
        }

        if (!nextPrayer) {
            const tomorrow = new Date(); tomorrow.setDate(now.getDate() + 1);
            const tTimings = currentMonthSchedule.find(j => parseInt(j.tanggal) === tomorrow.getDate());
            if (tTimings) {
                const [h, m] = tTimings.imsak.split(":").map(Number);
                const nDate = new Date(); nDate.setDate(tomorrow.getDate()); nDate.setHours(h, m, 0);
                nextPrayer = { name: "Imsak Esok", date: nDate };
            }
        }

        document.querySelectorAll(".list-item").forEach(r => r.classList.remove("active"));
        const activeRow = document.getElementById(`row-${activeId}`);
        if (activeRow) activeRow.classList.add("active");

        const displayTimer = document.getElementById("countdown-timer");
        const displayName = document.getElementById("next-prayer-name");

        if (nextPrayer) {
            const diff = nextPrayer.date - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            displayName.innerText = nextPrayer.name;
            displayTimer.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    };

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
};

// --- Event Listeners ---
selectProvinsi.addEventListener("change", (e) => fetchCities(e.target.value));
selectKabkota.addEventListener("change", () => btnSaveLocation.disabled = !selectKabkota.value);

btnSaveLocation.addEventListener("click", () => {
    const prov = selectProvinsi.value, kota = selectKabkota.value;
    localStorage.setItem("userProvinsi", prov);
    localStorage.setItem("userKabkota", kota);
    fetchPrayerTimes(prov, kota);
});

btnChangeLocation.addEventListener("click", () => {
    animateModalClose("#settings-modal");
    onboardingModal.classList.remove("hidden");
    animateModalOpen("#onboarding-modal");
    fetchProvinces().then(() => {
        const p = localStorage.getItem("userProvinsi");
        if (p) { selectProvinsi.value = p; fetchCities(p).then(() => { selectKabkota.value = localStorage.getItem("userKabkota"); btnSaveLocation.disabled = false; }); }
    });
});

btnDetect.addEventListener("click", () => {
    if (!navigator.geolocation) return showToast("Geolocation tidak didukung.");
    showLoading();
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=id`);
            const data = await res.json();
            const provinces = await fetchProvinces();
            const matchedProv = provinces.find(p => data.principalSubdivision.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(data.principalSubdivision.toLowerCase()));
            if (matchedProv) {
                selectProvinsi.value = matchedProv;
                const cities = await fetchCities(matchedProv);
                const cleanCity = (data.city || data.locality).replace(/Kota|Kabupaten|Kab\.|City/gi, "").trim().toLowerCase();
                const matchedCity = cities.find(c => c.replace(/Kota|Kabupaten|Kab\./gi, "").trim().toLowerCase().includes(cleanCity));
                if (matchedCity) { selectKabkota.value = matchedCity; btnSaveLocation.disabled = false; showToast(`Terdeteksi: ${matchedCity}`); }
                else showToast(`Provinsi: ${matchedProv}. Pilih Kota.`);
            } else showToast("Gagal mencocokkan lokasi.");
        } catch (e) { showToast("Gagal deteksi lokasi."); }
        finally { hideLoading(); }
    }, () => { showToast("Akses lokasi ditolak."); hideLoading(); });
});

const init = async () => {
    initTheme();
    const p = localStorage.getItem("userProvinsi"), k = localStorage.getItem("userKabkota");
    if (p && k) fetchPrayerTimes(p, k);
    else { onboardingModal.classList.remove("hidden"); animateModalOpen("#onboarding-modal"); fetchProvinces(); }
    animateEntrance();
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered', reg))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

init();
