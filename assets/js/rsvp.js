document.addEventListener("DOMContentLoaded", function () {
	const swalPrimaryButtons = {
		confirmButton: "button-pill",
		cancelButton: "button-pill button-pill--secondary",
	};
	const swalDangerButtons = {
		confirmButton: "button-pill button-pill--danger",
		cancelButton: "button-pill button-pill--secondary",
	};

	let isAdmin = false;
	const adminPassword = "admin041826";
	const adminAuth = sessionStorage.getItem("isAdmin") === "true";

	if (adminAuth) {
		isAdmin = true;
	}

	const messageForm = document.getElementById("messageForm");
	const messagesDisplay = document.getElementById("messagesDisplay");
	const MAX_VISIBLE_MESSAGES = 5;
	let isMessagesExpanded = false;
	let cachedMessages = [];

	if (!messageForm || !messagesDisplay) {
		return;
	}

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
				buttonsStyling: false,
				customClass: swalPrimaryButtons,
				confirmButtonText: "OK",
			});
			return;
		}

		const editToken = Math.random().toString(36).substr(2, 9);

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
				editToken,
				timestamp: new Date(),
			});

			let userEditTokens = JSON.parse(localStorage.getItem("userEditTokens") || "[]");
			userEditTokens.push(editToken);
			localStorage.setItem("userEditTokens", JSON.stringify(userEditTokens));

			Swal.close();
			Swal.fire({
				icon: "success",
				title: "Message Sent!",
				text: `Thank you, ${name}!`,
				buttonsStyling: false,
				customClass: swalPrimaryButtons,
				confirmButtonText: "Ok",
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
				buttonsStyling: false,
				customClass: swalDangerButtons,
				confirmButtonText: "Ok",
			});
		}
	});

	async function loadMessages() {
		if (!window.firebaseDB || !window.firebaseFunctions) return;

		try {
			const q = window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDB, "messages"), window.firebaseFunctions.orderBy("timestamp", "desc"));
			const querySnapshot = await window.firebaseFunctions.getDocs(q);
			cachedMessages = [];
			querySnapshot.forEach((doc) => {
				cachedMessages.push({
					id: doc.id,
					message: doc.data(),
				});
			});

			renderMessages();
		} catch (error) {
			console.error("Error loading messages: ", error);
		}
	}

	function renderMessages() {
		messagesDisplay.innerHTML = "";

		const listContainer = document.createElement("div");
		listContainer.className = "messages-list";

		const shouldCollapse = cachedMessages.length > MAX_VISIBLE_MESSAGES;
		const visibleMessages = shouldCollapse && !isMessagesExpanded ? cachedMessages.slice(0, MAX_VISIBLE_MESSAGES) : cachedMessages;

		visibleMessages.forEach(({ message, id }) => {
			displayMessage(message, id, listContainer);
		});

		messagesDisplay.appendChild(listContainer);

		if (shouldCollapse) {
			const toggleBtn = document.createElement("button");
			toggleBtn.type = "button";
			toggleBtn.className = "button-pill button-pill--secondary messages-toggle-btn";
			toggleBtn.textContent = isMessagesExpanded ? "See less" : `See more (${cachedMessages.length - MAX_VISIBLE_MESSAGES})`;

			toggleBtn.addEventListener("click", () => {
				isMessagesExpanded = !isMessagesExpanded;
				renderMessages();
			});

			messagesDisplay.appendChild(toggleBtn);
		}
	}

	function displayMessage(message, id, container = messagesDisplay) {
		const messageDiv = document.createElement("div");
		messageDiv.className = "message-item";

		const timeAgo = getTimeAgo(message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp));
		const isAttending = message.attendance === "coming";
		const attendanceText = isAttending ? "will attend" : "can't attend";
		const attendanceDotClass = isAttending ? "is-attending" : "is-not-attending";

		const userEditTokens = JSON.parse(localStorage.getItem("userEditTokens") || "[]");
		const canEdit = userEditTokens.includes(message.editToken);

		const likedIds = getLikedMessageIds();
		const isLiked = likedIds.includes(id);
		const likesCount = Number(message.likes || 0);

		const editButtonHTML = canEdit ? `<button class="btn-sm edit-btn me-2" data-id="${id}"><i class="fa-solid fa-edit"></i></button>` : "";
		const deleteButtonHTML = isAdmin ? `<button class="btn-sm delete-btn" data-id="${id}"><i class="fa-solid fa-trash"></i></button>` : "";

		const likeButtonHTML = `
        <button class="btn btn-sm like-btn ${isLiked ? "btn-danger" : "btn-outline-danger"}" data-id="${id}">
            <i class="fa-${isLiked ? "solid" : "regular"} fa-heart"></i>
            <span class="like-count ">${likesCount}</span>
        </button>
    `;

		messageDiv.innerHTML = `
        <div class="comment-header">
			<strong title="${attendanceText}">${message.name}</strong>
			<span class="attendance">
				<span class="attendance-dot ${attendanceDotClass}" title="${attendanceText}" aria-label="${attendanceText}"></span>
			</span>
            <div class="comment-time">${timeAgo}</div>
        </div>
        <div class="comment-body">${message.greetings}</div>
        <div class="comment-footer">
			<div class="footer-left">
				${editButtonHTML}
				${deleteButtonHTML}
			</div>
			<div class="footer-right">
				${likeButtonHTML}
			</div>
        </div>
    `;

		container.appendChild(messageDiv);

		const likeBtn = messageDiv.querySelector(".like-btn");
		likeBtn.addEventListener("click", async () => {
			if (!window.firebaseDB || !window.firebaseFunctions) return;
			likeBtn.disabled = true;

			try {
				const liked = getLikedMessageIds();
				const alreadyLiked = liked.includes(id);
				const delta = alreadyLiked ? -1 : 1;

				const docRef = window.firebaseFunctions.doc(window.firebaseDB, "messages", id);
				await window.firebaseFunctions.updateDoc(docRef, {
					likes: window.firebaseFunctions.increment(delta),
				});

				if (alreadyLiked) {
					setLikedMessageIds(liked.filter((x) => x !== id));
				} else {
					liked.push(id);
					setLikedMessageIds(liked);
				}

				await loadMessages();
			} catch (error) {
				console.error("Error updating like:", error);
			} finally {
				likeBtn.disabled = false;
			}
		});

		if (canEdit) {
			const editBtn = messageDiv.querySelector(".edit-btn");
			editBtn.addEventListener("click", () => editMessage(id, message));
		}

		if (isAdmin) {
			const deleteBtn = messageDiv.querySelector(".delete-btn");
			deleteBtn.addEventListener("click", async () => {
				const result = await Swal.fire({
					title: "Are you sure?",
					text: "This message will be permanently deleted.",
					icon: "warning",
					showCancelButton: true,
					buttonsStyling: false,
					customClass: swalDangerButtons,
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

						await loadMessages();
					} catch (error) {
						console.error("Error deleting message:", error);
						Swal.fire({
							icon: "error",
							title: "Failed to delete",
							text: "Please try again.",
							buttonsStyling: false,
							customClass: swalDangerButtons,
						});
					}
				}
			});
		}
	}

	async function editMessage(id, originalMessage) {
		const { value: formValues } = await Swal.fire({
			title: "Edit Your Message",
			html: `
				<form>
					<div class="form-group">
                    	<input id="edit-name" class=" form-control" placeholder="Name" value="${originalMessage.name}">
					 </div>
					 <div class="form-group">
						<select id="edit-attendance" class=" form-control">
							<option value="coming" ${originalMessage.attendance === "coming" ? "selected" : ""}>Yes, I'll be there</option>
							<option value="not-coming" ${originalMessage.attendance === "not-coming" ? "selected" : ""}>Sorry, can't make it</option>
						</select>
					 </div>
                    <textarea id="edit-greetings" class="form-control" placeholder="Greetings">${originalMessage.greetings}</textarea>
               </form>
				`,
			focusConfirm: false,
			showCancelButton: true,
			buttonsStyling: false,
			customClass: swalPrimaryButtons,
			confirmButtonText: "Update",
			allowOutsideClick: false,
			preConfirm: () => {
				const name = document.getElementById("edit-name").value.trim();
				const attendance = document.getElementById("edit-attendance").value;
				const greetings = document.getElementById("edit-greetings").value.trim();
				if (!name || !attendance || !greetings) {
					Swal.showValidationMessage("Please fill in all fields");
				}
				return { name, attendance, greetings };
			},
		});

		if (formValues) {
			try {
				const docRef = window.firebaseFunctions.doc(window.firebaseDB, "messages", id);
				await window.firebaseFunctions.updateDoc(docRef, {
					name: formValues.name,
					attendance: formValues.attendance,
					greetings: formValues.greetings,
					timestamp: new Date(),
				});

				Swal.fire({
					icon: "success",
					title: "Updated!",
					text: "Your message has been updated.",
					timer: 1500,
					showConfirmButton: false,
				});

				loadMessages();
			} catch (error) {
				console.error("Error updating message:", error);
				Swal.fire({
					icon: "error",
					title: "Failed to update",
					text: "Please try again.",
					buttonsStyling: false,
					customClass: swalDangerButtons,
				});
			}
		}
	}

	function getTimeAgo(date) {
		const now = new Date();
		const diffMs = now - date;
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);
		const diffWeek = Math.floor(diffDay / 7);
		const diffMonth = Math.floor(diffDay / 30);

		if (diffSec < 60) return "now";
		if (diffMin < 60) return `${diffMin}m`;
		if (diffHour < 24) return `${diffHour}h`;
		if (diffDay < 7) return `${diffDay}d`;
		if (diffWeek < 4) return `${diffWeek}w`;
		return `${diffMonth}mo`;
	}

	window.adminLogin = function () {
		Swal.fire({
			title: "Admin Login",
			input: "password",
			inputLabel: "Enter admin password",
			inputPlaceholder: "Enter password",
			showCancelButton: true,
			buttonsStyling: false,
			customClass: swalPrimaryButtons,
			confirmButtonText: "Login",
			inputValidator: (value) => {
				if (!value) {
					return "Please enter the password";
				}
				if (value === adminPassword) {
					sessionStorage.setItem("isAdmin", "true");
					isAdmin = true;
					loadMessages();
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

	window.adminLogout = function () {
		sessionStorage.removeItem("isAdmin");
		isAdmin = false;
		loadMessages();
		Swal.fire({
			icon: "info",
			title: "Logged out",
			text: "Admin mode disabled.",
			timer: 1500,
			showConfirmButton: false,
		});
	};

	function getLikedMessageIds() {
		return JSON.parse(localStorage.getItem("likedMessageIds") || "[]");
	}

	function setLikedMessageIds(ids) {
		localStorage.setItem("likedMessageIds", JSON.stringify(ids));
	}
});
