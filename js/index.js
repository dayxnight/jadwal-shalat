const fetchPrayerTimes = async () => {
    try {
        const date = new Date();
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth() + 1; // April = 4
        const todayDate = date.getDate(); // Tanggal hari ini

        const requestData = {
            provinsi: "Jambi",
            kabkota: "Kab. Tebo",
            bulan: currentMonth,
            tahun: currentYear
        };

        const res = await fetch("https://equran.id/api/v2/shalat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const response = await res.json();
        console.log(response);

        // Sesuai screenshot: cek response.code === 200
        if (response.code === 200) {
            // Ambil array jadwal dari response.data.jadwal
            const daftarJadwal = response.data.jadwal;
            document.getElementById("location").innerText =
                `${response.data.kabkota}, ${response.data.provinsi}`;
            console.log(response.data);
            // Cari jadwal yang tanggalnya cocok dengan hari ini

            document.getElementById("hari").innerText =
                daftarJadwal[todayDate - 1].hari;
            document.getElementById("date").innerText =
                daftarJadwal[todayDate - 1].tanggal_lengkap;
            console.log(daftarJadwal[todayDate - 1]);

            const timings = daftarJadwal.find(
                j => parseInt(j.tanggal) === todayDate
            );

            if (timings) {
                const prayerMapping = {
                    subuh: "subuh",
                    dzuhur: "dzuhur",
                    ashar: "ashar",
                    maghrib: "maghrib",
                    isya: "isya"
                };

                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                let activeId = "isya";

                Object.keys(prayerMapping).forEach(apiKey => {
                    const htmlId = prayerMapping[apiKey];
                    const timeStr = timings[apiKey];
                    const element = document.getElementById(htmlId);

                    if (element) {
                        element.innerText = timeStr;
                        // Hapus class active dari baris (.row)
                        element.parentElement.classList.remove("active");

                        // Hitung menit untuk menentukan yang sedang aktif
                        const [hours, minutes] = timeStr.split(":").map(Number);
                        const prayerMinutes = hours * 60 + minutes;

                        if (currentMinutes >= prayerMinutes) {
                            activeId = htmlId;
                        }
                    }
                });

                // Tambahkan class active ke baris yang sesuai
                const activeRow =
                    document.getElementById(activeId).parentElement;
                activeRow.classList.add("active");
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
};

fetchPrayerTimes();
                  
