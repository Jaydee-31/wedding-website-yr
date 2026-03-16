// Script to handle the save date banner
document.addEventListener("DOMContentLoaded", function () {
	const marquee = document.querySelector(".save-date-banner");
	if (marquee) {
		const text = "04. 18. 2026";
		const repetitions = 40;
		const separator = " &nbsp;&nbsp;&nbsp; ";
		let content = "";
		for (let i = 0; i < repetitions; i++) {
			content += text + separator;
		}
		marquee.innerHTML = content;
	}

	// Check if user is admin
	let isAdmin = false;
	const adminPassword = "your-admin-password-here"; // Change this to your password

	// Check if admin is already authenticated in session
	const adminAuth = sessionStorage.getItem("isAdmin") === "true";
	if (adminAuth) {
		isAdmin = true;
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

			if (!name || !attendance || !greetings || !window.firebaseDB || !window.firebaseFunctions) {
				Swal.fire({
					icon: "error",
					title: "Incomplete Form",
					text: "Please fill in all fields before submitting.",
					confirmButtonText: "OK",
				});
				return;
			}

			try {
				Swal.fire({
					title: "Sending...",
					html: "Please wait while we submit your message.",
					allowOutsideClick: false,
					didOpen: () => {
						Swal.showLoading();
					},
				});

				await window.firebaseFunctions.addDoc(window.firebaseFunctions.collection(window.firebaseDB, "messages"), {
					name,
					attendance,
					greetings,
					timestamp: new Date(),
				});

				Swal.close();
				Swal.fire({
					icon: "success",
					title: "Message Sent!",
					text: `Thank you, ${name}!`,
					confirmButtonText: "Ok",
					confirmButtonColor: "#3085d6",
				});

				messageForm.reset();
				loadMessages();
			} catch (error) {
				console.error("Error adding message: ", error);

				Swal.close();
				Swal.fire({
					icon: "error",
					title: "Failed to Send",
					text: "Something went wrong. Please try again.",
					confirmButtonText: "Ok",
					confirmButtonColor: "#ff0000",
				});
			}
		});

		async function loadMessages() {
			if (!window.firebaseDB || !window.firebaseFunctions) return;
			try {
				const q = window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDB, "messages"), window.firebaseFunctions.orderBy("timestamp", "desc"));
				const querySnapshot = await window.firebaseFunctions.getDocs(q);
				messagesDisplay.innerHTML = "";
				querySnapshot.forEach((doc) => {
					const message = doc.data();
					displayMessage(message, doc.id);
				});
			} catch (error) {
				console.error("Error loading messages: ", error);
			}
		}

		function displayMessage(message, id) {
			const messageDiv = document.createElement("div");
			messageDiv.className = "message-item";

			const timeAgo = getTimeAgo(message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp));
			const attendanceText = message.attendance === "coming" ? "will attend" : "can't attend";

			// Only show delete button if user is admin
			const deleteButtonHTML = isAdmin ? `<button class="btn btn-outline-danger btn-sm delete-btn" data-id="${id}"><i class="fa-solid fa-trash"></i> Delete</button>` : "";

			messageDiv.innerHTML = `
        <div class="comment-header">
            <strong>${message.name}</strong> <span class="attendance">${attendanceText}</span>
            <div class="comment-time">${timeAgo}</div>
        </div>
        <div class="comment-body">${message.greetings}</div>
		<dive class="comment-footer">
		${deleteButtonHTML}
        	
		</div>
        
    `;

			messagesDisplay.appendChild(messageDiv);

			// Only attach delete listener if admin
			if (isAdmin) {
				const deleteBtn = messageDiv.querySelector(".delete-btn");
				deleteBtn.addEventListener("click", async () => {
					const result = await Swal.fire({
						title: "Are you sure?",
						text: "This message will be permanently deleted.",
						icon: "warning",
						showCancelButton: true,
						confirmButtonText: '<i class="fa-solid fa-trash"></i> Delete',
						cancelButtonText: "Cancel",
					});

					if (result.isConfirmed) {
						try {
							const docRef = window.firebaseFunctions.doc(window.firebaseDB, "messages", id);
							await window.firebaseFunctions.deleteDoc(docRef);

							Swal.fire({
								icon: "success",
								title: "Deleted!",
								text: "The message has been removed.",
								timer: 1500,
								showConfirmButton: false,
							});

							messageDiv.remove();
						} catch (error) {
							console.error("Error deleting message:", error);
							Swal.fire({
								icon: "error",
								title: "Failed to delete",
								text: "Please try again.",
							});
						}
					}
				});
			}
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

		// Admin login function - call this from console or add to footer
		window.adminLogin = function () {
			Swal.fire({
				title: "Admin Login",
				input: "password",
				inputLabel: "Enter admin password",
				inputPlaceholder: "Enter password",
				showCancelButton: true,
				confirmButtonText: "Login",
				inputValidator: (value) => {
					if (!value) {
						return "Please enter the password";
					}
					if (value === adminPassword) {
						sessionStorage.setItem("isAdmin", "true");
						isAdmin = true;
						loadMessages(); // Reload to show delete buttons
						Swal.fire({
							icon: "success",
							title: "Logged in!",
							text: "You are now an admin.",
							timer: 1500,
							showConfirmButton: false,
						});
					} else {
						return "Incorrect password";
					}
				},
			});
		};

		// Admin logout function
		window.adminLogout = function () {
			sessionStorage.removeItem("isAdmin");
			isAdmin = false;
			loadMessages(); // Reload to hide delete buttons
			Swal.fire({
				icon: "info",
				title: "Logged out",
				text: "Admin mode disabled.",
				timer: 1500,
				showConfirmButton: false,
			});
		};
	}
});
