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

	// Handle guest messages form
	const messageForm = document.getElementById("messageForm");
	const messagesDisplay = document.getElementById("messagesDisplay");

	if (messageForm && messagesDisplay) {
		// Load existing messages from localStorage
		loadMessages();

		messageForm.addEventListener("submit", function (e) {
			e.preventDefault();
			const formData = new FormData(messageForm);
			const name = formData.get("name").trim();
			const attendance = formData.get("attendance");
			const greetings = formData.get("greetings").trim();

			if (name && attendance && greetings) {
				const message = {
					name,
					attendance,
					greetings,
					timestamp: Date.now(),
				};

				saveMessage(message);
				displayMessage(message);
				messageForm.reset();
			}
		});

		function saveMessage(message) {
			const messages = JSON.parse(localStorage.getItem("weddingMessages") || "[]");
			messages.push(message);
			localStorage.setItem("weddingMessages", JSON.stringify(messages));
		}

		function loadMessages() {
			const messages = JSON.parse(localStorage.getItem("weddingMessages") || "[]");
			messages.forEach(displayMessage);
		}

		function displayMessage(message) {
			const messageDiv = document.createElement("div");
			messageDiv.className = "message-item";
			messageDiv.innerHTML = `
				<h4>${message.name}</h4>
				<p><strong>Attendance:</strong> ${message.attendance === "coming" ? "Coming" : "Not Coming"}</p>
				<p><strong>Greetings:</strong> ${message.greetings}</p>
			`;
			messagesDisplay.appendChild(messageDiv);
		}
	}
});
