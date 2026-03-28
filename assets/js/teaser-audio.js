window.addEventListener("load", function () {
	const swalPrimaryButtons = {
		confirmButton: "button-pill",
		cancelButton: "button-pill button-pill--secondary",
	};

	const audio = document.querySelector("audio");
	const teaserModal = document.getElementById("teaserModal");
	const teaserVideo = document.getElementById("teaserVideo");
	const openTeaserBtn = document.getElementById("openTeaserBtn");
	const closeTeaserBtn = document.getElementById("closeTeaserBtn");
	let wasAudioPlayingBeforeTeaser = false;
	let audioFadeTimer = null;
	const audioDefaultVolume = audio ? audio.volume || 1 : 1;

	function playAudio() {
		if (!audio) return;
		audio.play().catch(() => {
			const resumeOnFirstInteraction = () => {
				audio.play().catch(() => {});
				document.removeEventListener("click", resumeOnFirstInteraction);
				document.removeEventListener("touchstart", resumeOnFirstInteraction);
				document.removeEventListener("keydown", resumeOnFirstInteraction);
			};

			document.addEventListener("click", resumeOnFirstInteraction);
			document.addEventListener("touchstart", resumeOnFirstInteraction);
			document.addEventListener("keydown", resumeOnFirstInteraction);
		});
	}

	function playAudioWithFade(duration = 3000) {
		if (!audio) return;

		if (audioFadeTimer) {
			clearInterval(audioFadeTimer);
			audioFadeTimer = null;
		}

		audio.volume = 0;
		audio.play().catch(() => {
			audio.volume = audioDefaultVolume;
		});

		const steps = 12;
		const stepDuration = Math.max(40, Math.floor(duration / steps));
		const stepVolume = audioDefaultVolume / steps;
		let currentStep = 0;

		audioFadeTimer = setInterval(() => {
			if (!audio || audio.paused) return;

			currentStep += 1;
			audio.volume = Math.min(audioDefaultVolume, currentStep * stepVolume);

			if (currentStep >= steps) {
				audio.volume = audioDefaultVolume;
				clearInterval(audioFadeTimer);
				audioFadeTimer = null;
			}
		}, stepDuration);
	}

	function openTeaserModal() {
		if (!teaserModal || !teaserVideo) return;

		wasAudioPlayingBeforeTeaser = !!audio && !audio.paused && !audio.ended;
		if (audioFadeTimer) {
			clearInterval(audioFadeTimer);
			audioFadeTimer = null;
		}
		if (audio) {
			audio.pause();
			audio.volume = audioDefaultVolume;
		}

		teaserModal.classList.add("is-open");
		teaserModal.setAttribute("aria-hidden", "false");
		document.body.classList.add("modal-open");
		teaserVideo.currentTime = 0;
		teaserVideo.play().catch(() => {});
	}

	function closeTeaserModal() {
		if (!teaserModal || !teaserVideo) return;

		teaserVideo.pause();
		teaserModal.classList.remove("is-open");
		teaserModal.setAttribute("aria-hidden", "true");
		document.body.classList.remove("modal-open");

		if (wasAudioPlayingBeforeTeaser) {
			playAudioWithFade();
		}
	}

	if (openTeaserBtn) {
		openTeaserBtn.addEventListener("click", openTeaserModal);
	}

	if (closeTeaserBtn) {
		closeTeaserBtn.addEventListener("click", closeTeaserModal);
	}

	if (teaserModal) {
		teaserModal.addEventListener("click", function (event) {
			if (event.target && event.target.matches("[data-close-teaser]")) {
				closeTeaserModal();
			}
		});
	}

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape" && teaserModal && teaserModal.classList.contains("is-open")) {
			closeTeaserModal();
		}
	});

	if (teaserVideo) {
		teaserVideo.addEventListener("play", function () {
			if (audio) {
				audio.pause();
			}
		});
		teaserVideo.addEventListener("ended", closeTeaserModal);
	}

	const params = new URLSearchParams(window.location.search);
	const name = params.get("name");
	const number = params.get("num");

	if (name && number) {
		Swal.fire({
			title: "You're invited!",
			html: `<p>Hi <strong>${name}</strong>, join us on our wedding day.
				We’ve reserved <strong>${number}</strong> seat(s) for you. </p>`,
			icon: "success",
			showConfirmButton: true,
			buttonsStyling: false,
			customClass: swalPrimaryButtons,
			allowOutsideClick: false,
			confirmButtonText: '<i class="fa fa-envelope-open fa-bounce me-2"></i>Open Invitation',
			backdrop: "#ffffff",
			showClass: {
				popup: `
					animate__animated
					animate__fadeInDown
					animate__faster
					`,
			},
		}).then((result) => {
			if (result.isConfirmed) {
				playAudio();
			}
		});
	} else {
		playAudio();
	}
});