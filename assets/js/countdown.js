(function () {
	const weddingDate = new Date("April 18, 2026 13:30:00").getTime();
	const countdownEl = document.querySelector(".countdown");

	if (!countdownEl) return;

	function updateCountdown() {
		const now = Date.now();
		const diff = weddingDate - now;

		if (diff <= 0) {
			countdownEl.innerHTML = '<div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">DAYS</span></div><div class="countdown-separator">:</div><div class="countdown-item"><span class="countdown-value">00</span><span class="countdown-label">HOURS</span></div><div class="countdown-separator">:</div><div class="countdown-item"><span class="countdown-value">00</span><span class="countdown-label">MINUTES</span></div><div class="countdown-separator">:</div><div class="countdown-item"><span class="countdown-value">00</span><span class="countdown-label">SECONDS</span></div>';
			return;
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		countdownEl.innerHTML = `<div class="countdown-item"><span class="countdown-value">${days}</span><span class="countdown-label">DAYS</span></div>` + `<div class="countdown-separator">:</div>` + `<div class="countdown-item"><span class="countdown-value">${String(hours).padStart(2, "0")}</span><span class="countdown-label">HOURS</span></div>` + `<div class="countdown-separator">:</div>` + `<div class="countdown-item"><span class="countdown-value">${String(minutes).padStart(2, "0")}</span><span class="countdown-label">MINUTES</span></div>` + `<div class="countdown-separator">:</div>` + `<div class="countdown-item"><span class="countdown-value">${String(seconds).padStart(2, "0")}</span><span class="countdown-label">SECONDS</span></div>`;
	}

	updateCountdown();
	setInterval(updateCountdown, 1000);
})();