document.addEventListener('alpine:init', () => {
    Alpine.data('shalatApp', () => ({
        loading: false,
        showSchedule: false,
        theme: localStorage.getItem('theme') || 'light',
        cityLabel: '',
        selectedProv: '',
        selectedCity: '',
        provinces: [],
        cities: [],
        schedule: {},
        activePrayer: '',
        nextPrayer: { name: '', timer: '00:00:00' },
        today: { hari: '', date: '', hijri: '' },
        modals: { onboarding: false, settings: false },
        toast: { show: false, msg: '' },
        error: { show: false, msg: '', retry: null },
        countdownInterval: null,

        init() {
            this.applyTheme();
            const p = localStorage.getItem('userProvinsi');
            const k = localStorage.getItem('userKabkota');
            if (p && k) {
                this.selectedProv = p;
                this.selectedCity = k;
                this.fetchPrayerTimes(p, k);
            } else {
                this.modals.onboarding = true;
                this.fetchProvinces();
            }
        },

        applyTheme() {
            document.documentElement.setAttribute('data-theme', this.theme);
            const meta = document.getElementById('meta-theme-color');
            if (meta) meta.setAttribute('content', this.theme === 'dark' ? '#111412' : '#fbfdf9');
        },

        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
            setTimeout(() => this.modals.settings = false, 300);
        },

        showToast(msg, duration = 3000) {
            this.toast.msg = msg;
            this.toast.show = true;
            setTimeout(() => this.toast.show = false, duration);
        },

        showError(msg, retry) {
            this.error.msg = msg;
            this.error.show = true;
            this.error.retry = retry;
        },

        retryAction() {
            this.error.show = false;
            if (this.error.retry) this.error.retry();
        },

        async fetchProvinces() {
            try {
                const cached = JSON.parse(localStorage.getItem('cachedProvinces'));
                if (cached && (Date.now() - cached.timestamp < 86400000)) {
                    this.provinces = cached.data;
                    return;
                }
                const res = await fetch("https://equran.id/api/v2/shalat/provinsi");
                const data = await res.json();
                if (data.code === 200) {
                    this.provinces = data.data;
                    localStorage.setItem('cachedProvinces', JSON.stringify({ data: data.data, timestamp: Date.now() }));
                }
            } catch (e) {
                this.showError("Gagal mengambil data provinsi.", () => this.fetchProvinces());
            }
        },

        async loadCities(prov) {
            if (!prov) return;
            this.selectedProv = prov;
            this.loading = true;
            try {
                const cacheKey = `cities_${prov}`;
                const cached = JSON.parse(localStorage.getItem(cacheKey));
                if (cached && (Date.now() - cached.timestamp < 86400000)) {
                    this.cities = cached.data;
                    return;
                }
                const res = await fetch("https://equran.id/api/v2/shalat/kabkota", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ provinsi: prov })
                });
                const data = await res.json();
                if (data.code === 200) {
                    this.cities = data.data;
                    localStorage.setItem(cacheKey, JSON.stringify({ data: data.data, timestamp: Date.now() }));
                }
            } catch (e) {
                this.showError("Gagal mengambil data kota.", () => this.loadCities(prov));
            } finally {
                this.loading = false;
            }
        },

        saveLocation() {
            if (!this.selectedProv || !this.selectedCity) return;
            localStorage.setItem('userProvinsi', this.selectedProv);
            localStorage.setItem('userKabkota', this.selectedCity);
            this.fetchPrayerTimes(this.selectedProv, this.selectedCity);
        },

        changeLocation() {
            this.modals.settings = false;
            this.modals.onboarding = true;
            this.fetchProvinces();
            if (this.selectedProv) this.loadCities(this.selectedProv);
        },

        async fetchPrayerTimes(prov, kab) {
            this.loading = true;
            this.showSchedule = false;
            const now = new Date();
            try {
                const res = await fetch("https://equran.id/api/v2/shalat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ provinsi: prov, kabkota: kab, bulan: now.getMonth() + 1, tahun: now.getFullYear() })
                });
                const data = await res.json();
                if (data.code === 200) {
                    this.cityLabel = data.data.kabkota;
                    const timings = data.data.jadwal.find(j => parseInt(j.tanggal) === now.getDate());
                    if (timings) {
                        const dateObj = new Date();
                        const monthsIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                        this.today.hari = timings.hari;
                        this.today.date = `${dateObj.getDate()} ${monthsIndo[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
                        const keys = ["imsak", "subuh", "dhuha", "dzuhur", "ashar", "maghrib", "isya"];
                        this.schedule = Object.fromEntries(keys.map(k => [k, timings[k]]));
                        this.fetchHijriDate();
                        this.startCountdown(data.data.jadwal);
                        this.modals.onboarding = false;
                        setTimeout(() => this.showSchedule = true, 300);
                    } else {
                        throw new Error("Jadwal tidak ditemukan.");
                    }
                } else {
                    throw new Error(data.message || "Gagal mengambil jadwal.");
                }
            } catch (e) {
                this.showError(e.message || "Gagal mengambil jadwal.", () => this.fetchPrayerTimes(prov, kab));
            } finally {
                this.loading = false;
            }
        },

        async fetchHijriDate() {
            const now = new Date();
            const dateKey = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
            try {
                const res = await fetch(`https://api.aladhan.com/v1/gToH/${dateKey}`);
                const data = await res.json();
                if (data.code === 200) {
                    const h = data.data.hijri;
                    const months = { 1: "Muharram", 2: "Safar", 3: "Rabiul Awal", 4: "Rabiul Akhir", 5: "Jumadil Awal", 6: "Jumadil Akhir", 7: "Rajab", 8: "Sya'ban", 9: "Ramadhan", 10: "Syawal", 11: "Dzulqa'dah", 12: "Dzulhijjah" };
                    this.today.hijri = `${h.day} ${months[h.month.number]} ${h.year} H`;
                }
            } catch (e) {}
        },

        startCountdown(monthSchedule) {
            if (this.countdownInterval) clearInterval(this.countdownInterval);
            const update = () => {
                const now = new Date();
                const timings = monthSchedule.find(j => parseInt(j.tanggal) === now.getDate());
                if (!timings) return;

                const prayerOrder = ["imsak", "subuh", "dhuha", "dzuhur", "ashar", "maghrib", "isya"];
                let next = null;
                let active = "isya";

                for (let name of prayerOrder) {
                    const [h, m] = timings[name].split(":").map(Number);
                    const prayerDate = new Date();
                    prayerDate.setHours(h, m, 0, 0);

                    if (now < prayerDate) {
                        next = { name: name.charAt(0).toUpperCase() + name.slice(1), date: prayerDate };
                        break;
                    }
                    active = name;
                    if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() === 0) {
                        this.showToast(`Waktu ${name} telah tiba!`);
                    }
                }

                if (!next) {
                    const tomorrow = monthSchedule.find(j => parseInt(j.tanggal) === now.getDate() + 1);
                    if (tomorrow) {
                        const [h, m] = tomorrow.imsak.split(":").map(Number);
                        const nDate = new Date(); nDate.setDate(now.getDate() + 1); nDate.setHours(h, m, 0, 0);
                        next = { name: "Imsak Esok", date: nDate };
                    }
                }

                this.activePrayer = active;
                if (next) {
                    const diff = next.date - now;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    this.nextPrayer.name = next.name;
                    this.nextPrayer.timer = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                }
            };
            update();
            this.countdownInterval = setInterval(update, 1000);
        },

        detectLocation() {
            if (!navigator.geolocation) return this.showToast("Geolocation tidak didukung.");
            this.loading = true;
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=id`);
                    const data = await res.json();
                    await this.fetchProvinces();
                    const matchedProv = this.provinces.find(p => data.principalSubdivision.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(data.principalSubdivision.toLowerCase()));
                    if (matchedProv) {
                        this.selectedProv = matchedProv;
                        await this.loadCities(matchedProv);
                        const cleanCity = (data.city || data.locality).replace(/Kota|Kabupaten|Kab\.|City/gi, "").trim().toLowerCase();
                        const matchedCity = this.cities.find(c => c.replace(/Kota|Kabupaten|Kab\./gi, "").trim().toLowerCase().includes(cleanCity));
                        if (matchedCity) {
                            this.selectedCity = matchedCity;
                            this.showToast(`Terdeteksi: ${matchedCity}`);
                        }
                    }
                } catch (e) {
                    this.showToast("Gagal deteksi lokasi.");
                } finally {
                    this.loading = false;
                }
            }, () => {
                this.showToast("Akses lokasi ditolak.");
                this.loading = false;
            });
        }
    }));
});

// Service Worker Registration
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}
