// Save account
document.getElementById("createForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (localStorage.getItem(`user_${username}`)) {
    alert("User already exists!");
  } else {
    localStorage.setItem(`user_${username}`, JSON.stringify({ password }));
    alert("Account created! Now upload your attendance.");
    window.location.href = "upload.html";
    localStorage.setItem("currentUser", username);
  }
});

// Save audio files
document.getElementById("uploadForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = localStorage.getItem("currentUser");
  if (!user) return alert("No user found!");

  const reader = (file, callback) => {
    const fr = new FileReader();
    fr.onload = () => callback(fr.result);
    fr.readAsDataURL(file);
  };

  const rollFile = document.getElementById("rollAudio").files[0];
  const nameFile = document.getElementById("nameAudio").files[0];
  const presentFile = document.getElementById("presentAudio").files[0];

  reader(rollFile, (roll) => {
    reader(nameFile, (name) => {
      reader(presentFile, (present) => {
        const data = { roll, name, present };
        localStorage.setItem(`audio_${user}`, JSON.stringify(data));
        alert("Audio saved successfully!");
        window.location.href = "index.html";
      });
    });
  });
});

// Login
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("loginUsername").value;
  const pass = document.getElementById("loginPassword").value;

  const data = JSON.parse(localStorage.getItem(`user_${user}`) || "{}");
  if (data.password === pass) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid login");
  }
});

// Load attendance table
if (window.location.pathname.includes("dashboard.html")) {
  const table = document.querySelector("#attendanceTable tbody");
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("audio_")) {
      const username = key.split("_")[1];
      const audioData = JSON.parse(localStorage.getItem(key));
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${username}</td>
        <td>${username.toUpperCase()}</td>
        <td><button onclick="play('${audioData.roll}')">▶</button></td>
        <td><button onclick="play('${audioData.name}')">▶</button></td>
        <td><button onclick="play('${audioData.present}')">▶</button></td>
      `;
      table.appendChild(tr);
    }
  });
}

// Audio playback
function play(dataURL) {
  const audio = new Audio(dataURL);
  audio.play();
}

function logout() {
  // Clear session if needed here (e.g., localStorage/sessionStorage)
  // localStorage.removeItem('loggedInUser'); // optional

  // Redirect to login page
  window.location.href = 'login.html';
}

