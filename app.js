const API_URL = "http://127.0.0.1:3000/pets";

const petForm = document.getElementById("petForm");
const petContainer = document.getElementById("petContainer");

document.addEventListener("DOMContentLoaded", loadPets);


document.addEventListener("click", () => {
  document.querySelectorAll(".status-dropdown.open").forEach(d => d.classList.remove("open"));
});

petForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pet = {
    name: document.getElementById("petName").value,
    breed: document.getElementById("breed").value,
    age: parseInt(document.getElementById("age").value),
    status: document.getElementById("status").value
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pet)
  });

  if (res.ok) {
    petForm.reset();
    loadPets();
    showToast("🐾 Pet added successfully!");
  } else {
    alert("Failed to add pet. Is json-server running?");
  }
});

async function loadPets() {
  try {
    const response = await fetch(API_URL);
    const pets = await response.json();

    petContainer.innerHTML = "";

    if (pets.length === 0) {
      petContainer.innerHTML = `
        <div class="empty">
          <div class="empty-ico">🐾</div>
          <h3>No pets listed yet</h3>
          <p>Add your first pet using the form on the left!</p>
        </div>`;
      return;
    }

    
    pets.forEach(pet => renderCard(pet));

  } catch (error) {
    console.error("Error loading pets:", error);
    petContainer.innerHTML = `
      <div class="empty">
        <div class="empty-ico">⚠️</div>
        <h3>Could not load pets</h3>
        <p>Is json-server running?</p>
      </div>`;
  }
}

function renderCard(pet) {
  const statusClass = pet.status.toLowerCase();
  const emoji = pet.breed.toLowerCase().includes("cat") ? "🐱"
    : pet.breed.toLowerCase().includes("bird") ? "🐦"
    : pet.breed.toLowerCase().includes("rabbit") ? "🐰"
    : pet.breed.toLowerCase().includes("turtle") ? "🐢"
    : "🐶";

  const card = document.createElement("article");
  card.classList.add("pet-card");
  card.dataset.status = pet.status;

  card.innerHTML = `
    <div class="card-accent"></div>
    <div class="card-body">
      <div class="card-header">
        <div class="pet-avi">${emoji}</div>
        <span class="badge ${statusClass}">${pet.status}</span>
      </div>
      <p class="pet-name">${pet.name}</p>
      <div class="details">
        <div class="det">
          <div class="det-ico">🦴</div>
          <span class="det-k">Breed</span>
          <span class="det-v">${pet.breed}</span>
        </div>
        <div class="det">
          <div class="det-ico">🎂</div>
          <span class="det-k">Age</span>
          <span class="det-v">${pet.age} yr${pet.age !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
    <div class="card-foot">
      <div class="status-dropdown">
        <button class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">
          ✏️ Update Status
        </button>
        <div class="dropdown-menu" role="menu">
          <button class="dropdown-item available-item" data-value="Available" role="menuitem">
            🟢 Available
          </button>
          <button class="dropdown-item pending-item" data-value="Pending" role="menuitem">
            🟠 Pending
          </button>
          <button class="dropdown-item adopted-item" data-value="Adopted" role="menuitem">
            🔴 Adopted
          </button>
        </div>
      </div>
      <button class="del-btn">🗑️ Delete</button>
    </div>
  `;

  
  const dropdown = card.querySelector(".status-dropdown");
  const trigger = card.querySelector(".dropdown-trigger");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    
    document.querySelectorAll(".status-dropdown.open").forEach(d => {
      if (d !== dropdown) d.classList.remove("open");
    });
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", isOpen);
  });

  
  card.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", async (e) => {
      e.stopPropagation();
      const newStatus = item.dataset.value;
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");

      if (newStatus === pet.status) return;

      await fetch(`${API_URL}/${pet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      showToast(`Status updated to ${newStatus}!`);
      loadPets();
    });
  });

  
  card.querySelector(".del-btn").addEventListener("click", async () => {
    if (!confirm(`Delete ${pet.name}?`)) return;
    await fetch(`${API_URL}/${pet.id}`, { method: "DELETE" });
    showToast(`${pet.name} removed.`);
    loadPets();
  });

  petContainer.appendChild(card);
}

function updateStats(pets) {
  const available = pets.filter(p => p.status === "Available").length;
  const pending   = pets.filter(p => p.status === "Pending").length;
  const adopted   = pets.filter(p => p.status === "Adopted").length;

  const pills = document.querySelectorAll(".pill .n");
  if (pills[0]) pills[0].textContent = pets.length;
  if (pills[1]) pills[1].textContent = available;
  if (pills[2]) pills[2].textContent = adopted;
}


let toastTimer;
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}