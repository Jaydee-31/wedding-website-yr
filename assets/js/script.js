// Script to handle the save date banner
document.addEventListener("DOMContentLoaded", function () {
	const marquee = document.querySelector(".save-date-banner");
	if (marquee) {
		const text = "04. 18. 2026";
		const repetitions = 40; // Repeat enough to cover wide screens
		const separator = " &nbsp;&nbsp;&nbsp; ";
		let content = "";
		for (let i = 0; i < repetitions; i++) {
			content += text + separator;
		}
		marquee.innerHTML = content;
	}
});
