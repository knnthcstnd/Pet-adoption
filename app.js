const API_URL = "http://127.0.0.1:3000/pets";

const petForm      = document.getElementById("petForm");
const petContainer = document.getElementById("petContainer");
const toastEl      = document.getElementById("toast");

let allPets       = [];
let currentFilter = "All";


let toastTimer;
function showToast(msg, icon = "✓") {
  clearTimeout(toastTimer);
  toastEl.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  toastEl.classList.add("show");
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
}


function updateStats(pets) {
  document.getElementById("statTotal").textContent     = pets.length;
  document.getElementById("statAvailable").textContent = pets.filter(p => p.status === "Available").length;
  document.getElementById("statPending").textContent   = pets.filter(p => p.status === "Pending").length;
  document.getElementById("statAdopted").textContent   = pets.filter(p => p.status === "Adopted").length;
}


function getEmoji(breed) {
  const b = breed.toLowerCase();
  if (/cat|kitten|persian|siamese|tabby|maine|ragdoll/.test(b)) return "🐱";
  if (/rabbit|bunny|hare/.test(b))                               return "🐰";
  if (/bird|parrot|cockatiel|canary|finch/.test(b))              return "🐦";
  if (/hamster|guinea|gerbil/.test(b))                           return "🐹";
  if (/fish|goldfish|betta|koi/.test(b))                         return "🐠";
  if (/turtle|tortoise/.test(b))                                 return "🐢";
  if (/snake|lizard|gecko|iguana/.test(b))                       return "🦎";
  return "🐶";
}


function closeAllDropdowns() {
  document.querySelectorAll(".status-dropdown.open")
    .forEach(d => d.classList.remove("open"));
}
document.addEventListener("click", closeAllDropdowns);


document.querySelectorAll(".ftab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ftab").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    currentFilter = btn.dataset.filter;
    renderPets(allPets);
  });
});


function renderPets(pets) {
  const list = currentFilter === "All"
    ? pets
    : pets.filter(p => p.status === currentFilter);

  petContainer.innerHTML = "";

  if (!list.length) {
    petContainer.innerHTML = `
      <div class="empty">
        <div class="empty-ico">🐾</div>
        <h3>No pets here yet</h3>
        <p>Add a listing using the form on the left.</p>
      </div>`;
    return;
  }

  list.forEach((pet, i) => {
    const card = document.createElement("article");
    card.className = "pet-card";
    card.dataset.status = pet.status;
    card.style.animationDelay = `${i * 55}ms`;

    const statusClass = pet.status.toLowerCase();
    const emoji = getEmoji(pet.breed);

    card.innerHTML = `
      <div class="card-accent"></div>
      <div class="card-body">
        <div class="card-header">
          <div class="pet-avi">${emoji}</div>
          <span class="badge ${statusClass}">${pet.status}</span>
        </div>
        <div class="pet-name">${pet.name}</div>
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
          <button class="upd-btn dropdown-trigger">↻ Update ▾</button>
          <div class="dropdown-menu">
            <button class="dropdown-item available-item" data-status="Available">🟢 Available</button>
            <button class="dropdown-item pending-item"   data-status="Pending">🟠 Pending</button>
            <button class="dropdown-item adopted-item"   data-status="Adopted">🔴 Adopted</button>
          </div>
        </div>

        <button class="del-btn">✕ Remove</button>
      </div>
    `;

    const dropdown = card.querySelector(".status-dropdown");
    const trigger  = card.querySelector(".dropdown-trigger");

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = dropdown.classList.contains("open");
      closeAllDropdowns();
      if (!wasOpen) dropdown.classList.add("open");
    });

    card.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const newStatus = item.dataset.status;
        dropdown.classList.remove("open");
        if (newStatus === pet.status) {
          showToast(`Already set to ${newStatus}`, "ℹ️");
        } else {
          updateStatus(pet.id, newStatus, pet.name);
        }
      });
    });

    card.querySelector(".del-btn").addEventListener("click", () => deletePet(pet.id, pet.name));

    petContainer.appendChild(card);
  });
}


async function loadPets() {
  try {
    const res = await fetch(API_URL);
    allPets = await res.json();
    updateStats(allPets);
    renderPets(allPets);
  } catch (err) {
    petContainer.innerHTML = `
      <div class="empty">
        <div class="empty-ico">⚠️</div>
        <h3>Cannot reach server</h3>
        <p>Make sure json-server is running on port 3000.</p>
      </div>`;
  }
}


petForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pet = {
    name:   document.getElementById("petName").value.trim(),
    breed:  document.getElementById("breed").value.trim(),
    age:    parseInt(document.getElementById("age").value),
    status: document.getElementById("status").value
  };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pet)
    });
    if (!res.ok) throw new Error();
    petForm.reset();
    showToast(`${pet.name} added to listings!`, "🐾");
    loadPets();
  } catch {
    showToast("Failed to add pet. Check your server.", "⚠️");
  }
});


async function updateStatus(id, newStatus, name) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`${name} is now ${newStatus}`, "↻");
    loadPets();
  } catch {
    showToast("Update failed. Check your server.", "⚠️");
  }
}


async function deletePet(id, name) {
  if (!confirm(`Remove ${name} from listings?`)) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    showToast(`${name} removed.`, "✕");
    loadPets();
  } catch {
    showToast("Delete failed. Check your server.", "⚠️");
  }
}

document.addEventListener("DOMContentLoaded", loadPets);