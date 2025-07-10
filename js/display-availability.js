async function updateAvailabilityDisplay() {
  console.log("[PUBLIC] Mise à jour des disponibilités...");
  await FirebaseAvailabilityService.firebaseSync.waitForReady();
  const data = await FirebaseAvailabilityService.getAvailabilities();

  const container = document.getElementById("availability-list");
  if (!container) return;

  const dates = Object.keys(data).sort();

  // Correction : vérifier s'il y a au moins un créneau disponible
  let hasSlot = false;
  dates.forEach(date => {
    if (Array.isArray(data[date]) && data[date].length > 0) {
      hasSlot = true;
    }
  });

  if (!hasSlot) {
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
