document.addEventListener("DOMContentLoaded", function () {
	const gallerySlide = document.querySelector(".gallery-slide");
	const gallery = document.querySelector(".gallery");
	if (!gallerySlide || !gallery) return;

	// List all images in assets/img/gallery/ (add/remove filenames as needed)
	const images = ["1.JPG", "2.JPG", "3.JPG", "4.JPG", "5.JPG", "6.JPG", "7.JPG", "8.JPG", "9.JPG", "10.JPG", "11.JPG", "12.JPG", "13.JPG", "14.JPG"];

	// Clear any existing content inside the slide container
	gallerySlide.innerHTML = "";

	images.forEach((filename) => {
		const img = document.createElement("img");
		img.src = `/assets/img/gallery/${filename}`;
		img.alt = `Wedding photo ${filename}`;
		gallerySlide.appendChild(img);
	});

	// Clone once to create a seamless loop
	const copy = gallerySlide.cloneNode(true);
	gallery.appendChild(copy);

	// Modal logic
	const modal = document.getElementById("galleryModal");
	const modalImg = modal ? modal.querySelector("img") : null;
	const closeBtn = modal ? modal.querySelector(".close-btn") : null;

	function openModal(src, alt) {
		if (!modal || !modalImg) return;
		modalImg.src = src;
		modalImg.alt = alt;
		modal.classList.add("open");
		modal.setAttribute("aria-hidden", "false");
	}

	function closeModal() {
		if (!modal) return;
		modal.classList.remove("open");
		modal.setAttribute("aria-hidden", "true");
	}

	gallery.querySelectorAll("img").forEach((img) => {
		img.addEventListener("click", () => openModal(img.src, img.alt));
	});

	if (closeBtn) {
		closeBtn.addEventListener("click", closeModal);
	}

	if (modal) {
		modal.addEventListener("click", (event) => {
			if (event.target === modal) {
				closeModal();
			}
		});
	}
});
