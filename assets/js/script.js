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
		// Load existing messages from Firebase
		loadMessages();

		messageForm.addEventListener("submit", async function (e) {
			e.preventDefault();
			const formData = new FormData(messageForm);
			const name = formData.get("name").trim();
			const attendance = formData.get("attendance");
			const greetings = formData.get("greetings").trim();

			if (name && attendance && greetings && window.firebaseDB && window.firebaseFunctions) {
				try {
					await window.firebaseFunctions.addDoc(window.firebaseFunctions.collection(window.firebaseDB, "messages"), {
						name,
						attendance,
						greetings,
						timestamp: new Date(),
					});
					messageForm.reset();
					loadMessages(); // Reload to show new message
				} catch (error) {
					console.error("Error adding message: ", error);
					alert("Failed to submit message. Please try again.");
				}
			}
		});

		async function loadMessages() {
			if (!window.firebaseDB || !window.firebaseFunctions) return;
			try {
				const q = window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDB, "messages"), window.firebaseFunctions.orderBy("timestamp", "desc"));
				const querySnapshot = await window.firebaseFunctions.getDocs(q);
				messagesDisplay.innerHTML = ""; // Clear current
				querySnapshot.forEach((doc) => {
					const message = doc.data();
					displayMessage(message);
				});
			} catch (error) {
				console.error("Error loading messages: ", error);
			}
		}

		function displayMessage(message) {
			const messageDiv = document.createElement("div");
			messageDiv.className = "message-item";
			const timeAgo = getTimeAgo(message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp));
			const attendanceText = message.attendance === "coming" ? "will attend" : "can't attend";
			messageDiv.innerHTML = `
				<div class="comment-header">
					<strong>${message.name}</strong> <span class="attendance">${attendanceText}</span>
                    <div class="comment-footer">${timeAgo}</div>
				</div>
				<div class="comment-body">${message.greetings}</div>
			`;
			messagesDisplay.appendChild(messageDiv);
		}

		function getTimeAgo(date) {
			const now = new Date();
			const diffMs = now - date;
			const diffSec = Math.floor(diffMs / 1000);
			const diffMin = Math.floor(diffSec / 60);
			const diffHour = Math.floor(diffMin / 60);
			const diffDay = Math.floor(diffHour / 24);

			if (diffSec < 60) return "Just now";
			if (diffMin < 60) return `${diffMin} min ago`;
			if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
			return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
		}
	}
});
