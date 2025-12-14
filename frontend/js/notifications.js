// Demo notifications (later replace with backend fetch)
const notifications = [
  "🚌 Bus delayed by 10 minutes",
  "📍 Route changed due to traffic",
  "🕒 Morning bus timing updated"
];

const container = document.getElementById("notifications");

container.innerHTML = "";

notifications.forEach(note => {
  container.innerHTML += `
    <div class="card notification-card">
      <p>${note}</p>
    </div>
  `;
});
