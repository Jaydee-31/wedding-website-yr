document.addEventListener("DOMContentLoaded", function () {
	const gallerySlide = document.querySelector(".gallery-slide");
	const gallery = document.querySelector(".gallery");
	if (!gallerySlide || !gallery) return;

	// List all images in assets/img/gallery/ (add/remove filenames as needed)
	const images = ["IMG_0060.JPG", "IMG_0117.JPG", "IMG_0187.JPG", "IMG_0224.JPG", "IMG_0237.JPG", "IMG_0254.JPG", "IMG_0566.JPG", "IMG_0677.JPG", "IMG_9375.JPG", "IMG_9458.JPG", "IMG_9465.JPG", "IMG_9626.JPG", "IMG_9700.JPG", "IMG_9760.JPG", "IMG_9842.JPG"];

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
});
