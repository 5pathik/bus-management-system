async function loadProfile() {
  try {
    const token = localStorage.getItem("token");
    console.log("TOKEN USED:", token);

    const res = await fetch("http://127.0.0.1:5000/student/profile", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const s = await res.json();
    console.log("PROFILE:", s);

    document.getElementById("studentTopName").innerText = s.name;
    document.getElementById("studentName").innerText = s.name;
    document.getElementById("studentUID").innerText = s.university_id;
    document.getElementById("studentEmail").innerText = s.email;
    document.getElementById("studentDOB").innerText = s.dob;
    document.getElementById("studentFather").innerText = s.father_name;
    document.getElementById("studentCourse").innerText = s.course;
    document.getElementById("studentSemester").innerText = s.semester;
    document.getElementById("studentCampus").innerText = s.campus;

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
