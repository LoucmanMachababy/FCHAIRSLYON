async function updateAvailabilityDisplay() {
  console.log("[PUBLIC] Mise à jour des disponibilités...");
  await FirebaseAvailabilityService.firebaseSync.waitForReady();
  const data = await FirebaseAvailabilityService.getAvailabilities();

  const container = document.getElementById("availability-list");
  if (!container) return;

  const dates = Object.keys(data).sort();

  if (dates.length === 0) {
    container.innerHTML = "<p>Aucune disponibilité pour le moment.</p>";
    return;
  }

  let html = "";
  dates.forEach(date => {
    const hours = data[date];
    if (hours.length > 0) {
      html += `<div class="day-block"><strong>${date}</strong>: ${hours.join(", ")}</div>`;
    }
  });

  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', updateAvailabilityDisplay);
