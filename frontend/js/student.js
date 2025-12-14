const API = "http://127.0.0.1:5000";

/* ===== LOAD PROFILE ===== */
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/student/profile`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const s = await res.json();

    document.getElementById("studentTopName").innerText = s.name;
    document.getElementById("studentName").innerText = s.name;
    document.getElementById("studentUID").innerText = s.university_id;
    document.getElementById("studentEmail").innerText = s.email;
    document.getElementById("studentDOB").innerText = s.dob;
    document.getElementById("studentFather").innerText = s.father_name;
    document.getElementById("studentCourse").innerText = s.course;
    document.getElementById("studentSemester").innerText = s.semester;
    document.getElementById("studentCampus").innerText = s.campus;

    // 🔥 LOAD PROFILE IMAGE
    if (s.profile_image) {
      document.getElementById("profileImage").src =
        `${API}/uploads/profiles/${s.profile_image}`;
    }

  } catch (err) {
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
}

/* ===== UPLOAD PHOTO ===== */
async function uploadPhoto() {
  const file = document.getElementById("photoInput").files[0];
  if (!file) {
    alert("Select an image first");
    return;
  }

  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(`${API}/student/upload-photo`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: formData
  });

  const data = await res.json();
  alert(data.message);

  // Reload profile
  loadProfile();
}

document.addEventListener("DOMContentLoaded", loadProfile);
