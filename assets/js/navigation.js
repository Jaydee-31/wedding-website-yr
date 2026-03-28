document.addEventListener("DOMContentLoaded", function () {
	const dock = document.querySelector(".bottom-dock");
	const dockLinks = Array.from(document.querySelectorAll(".dock-link[data-section-link]"));

	if (!dock || dockLinks.length === 0) {
		return;
	}

	const sections = dockLinks
		.map((link) => {
			const sectionId = link.getAttribute("data-section-link");
			const section = document.getElementById(sectionId);

			if (!section) {
				return null;
			}

			return { link, section, sectionId };
		})
		.filter(Boolean);

	if (sections.length === 0) {
		return;
	}

	let activeSectionId = "";
	let ticking = false;

	function setActiveLink(sectionId) {
		if (!sectionId || activeSectionId === sectionId) {
			return;
		}

		activeSectionId = sectionId;

		sections.forEach(({ link, sectionId: currentId }) => {
			const isActive = currentId === sectionId;
			link.classList.toggle("is-active", isActive);
			if (isActive) {
				link.setAttribute("aria-current", "page");
				link.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
			} else {
				link.removeAttribute("aria-current");
			}
		});
	}

	function getCurrentSectionId() {
		const viewportMarker = window.scrollY + window.innerHeight * 0.38;
		const lastSection = sections[sections.length - 1];

		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
			return lastSection.sectionId;
		}

		let currentId = sections[0].sectionId;

		sections.forEach(({ section, sectionId }) => {
			if (section.offsetTop <= viewportMarker) {
				currentId = sectionId;
			}
		});

		return currentId;
	}

	function updateActiveLink() {
		ticking = false;
		setActiveLink(getCurrentSectionId());
	}

	function requestActiveUpdate() {
		if (ticking) {
			return;
		}

		ticking = true;
		window.requestAnimationFrame(updateActiveLink);
	}

	dockLinks.forEach((link) => {
		link.addEventListener("click", function () {
			const targetId = link.getAttribute("data-section-link");
			setActiveLink(targetId);
		});
	});

	setActiveLink(activeSectionId);
	requestActiveUpdate();

	window.addEventListener("scroll", requestActiveUpdate, { passive: true });
	window.addEventListener("resize", requestActiveUpdate);
	window.addEventListener("load", requestActiveUpdate);
	window.addEventListener("hashchange", requestActiveUpdate);
});
