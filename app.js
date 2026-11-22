// Course note: HTML/CSS uses Units I-III. Login, page updates, and saved browser data
// use DOM events and localStorage, which the supplied syllabus places in Unit V.
// 1. Demo users and requests: used only when the browser has no saved data.
const STORAGE_KEY = "workshop-management-demo";
const startingData = {
  users: [
    { name: "Workshop Admin", email: "admin@workshop.com", password: "admin123", role: "admin" },
    { name: "Sam Rivera", email: "tech@workshop.com", password: "tech123", role: "technician" },
    { name: "Riya Patel", email: "reception@workshop.com", password: "front123", role: "receptionist" },
    { name: "Jordan Lee", email: "jordan@workshop.com", password: "customer123", role: "customer" }
  ],
  requests: [
    { id: 1, name: "Priya Shah", email: "priya@example.com", date: "2026-11-21", year: "2020", company: "Honda", model: "Civic", vehicle: "2020 Honda Civic", complaint: "Engine oil service is due.", service: "Oil service", status: "New" },
    { id: 2, name: "Marcus Cole", email: "marcus@example.com", date: "2026-11-22", year: "2019", company: "Toyota", model: "Tacoma", vehicle: "2019 Toyota Tacoma", complaint: "Front brakes are making a noise.", service: "Brake repair", status: "In Progress" }
  ],
  // Starter stock and simple service prices used by the admin inventory screen.
  inventory: [
    { id: 1, name: "Engine oil (1 L)", price: 850, stock: 12 },
    { id: 2, name: "Oil filter", price: 350, stock: 8 },
    { id: 3, name: "Air filter", price: 600, stock: 6 },
    { id: 4, name: "Brake pads (pair)", price: 1800, stock: 4 },
    { id: 5, name: "Spark plug", price: 450, stock: 10 }
  ],
  servicePrices: [
    { name: "Oil service", price: 1200 },
    { name: "Brake repair", price: 2200 },
    { name: "Engine check", price: 900 },
    { name: "Annual inspection", price: 700 }
  ],
  notifications: []
};

// 2. Load and save workshop data in this browser.
function loadData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (savedData) {
      savedData.notifications = savedData.notifications || [];
      savedData.users = savedData.users || [];
      savedData.inventory = savedData.inventory || JSON.parse(JSON.stringify(startingData.inventory));
      savedData.servicePrices = savedData.servicePrices || JSON.parse(JSON.stringify(startingData.servicePrices));
      savedData.requests.forEach(function(request) {
        if (request.approval === undefined) request.approval = "Waiting";
        if (request.estimate === undefined) {
          request.estimate = (startingData.servicePrices.find(function(item) { return item.name === request.service; }) || { price: 0 }).price;
        }
        request.partsUsed = request.partsUsed || [];
        if (request.bill === undefined || (request.bill === 0 && request.estimate > 0 && request.partsUsed.length === 0)) request.bill = request.estimate;
        if (request.billManual === undefined) request.billManual = false;
      });
      startingData.users.forEach(function(demoUser) {
        const alreadySaved = savedData.users.some(function(user) { return user.email === demoUser.email; });
        if (!alreadySaved) savedData.users.push(demoUser);
      });
      return savedData;
    }
  } catch (error) {
    // Use the example data if saved browser data cannot be read.
  }
  return JSON.parse(JSON.stringify(startingData));
}

// Keep the signed-in account and saved records available to the page functions.
let data = loadData();
let signedInUser = null;

// Keep starter jobs and older saved records aligned with current service prices.
data.requests.forEach(function(request) {
  if (request.estimate === undefined) request.estimate = (data.servicePrices.find(function(item) { return item.name === request.service; }) || { price: 0 }).price;
  request.partsUsed = request.partsUsed || [];
  if (request.bill === undefined || (request.bill === 0 && request.estimate > 0 && request.partsUsed.length === 0)) request.bill = request.estimate;
  if (request.billManual === undefined) request.billManual = false;
  if (request.approval === undefined) request.approval = "Waiting";
});

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 2a. Add a saved notification for one role, one person, or everyone.
function addNotification(message, audience) {
  data.notifications.unshift({
    id: Date.now() + Math.random(),
    message: message,
    audience: audience,
    createdAt: new Date().toISOString(),
    read: false
  });
  data.notifications = data.notifications.slice(0, 100);
  saveData();
  renderNotifications();
}

// Show notifications intended for the signed-in account or their role.
function renderNotifications() {
  const list = document.getElementById("notification-list");
  if (!list) return;
  list.innerHTML = "";

  if (!signedInUser) return;
  const visibleNotifications = data.notifications.filter(function(note) {
    return note.audience.includes("all") || note.audience.includes(signedInUser.role) || note.audience.includes(signedInUser.email);
  });
  const unreadCount = visibleNotifications.filter(function(note) { return !note.read; }).length;
  document.getElementById("notification-count").textContent = unreadCount;
  document.getElementById("empty-notifications").classList.toggle("hidden", visibleNotifications.length > 0);

  visibleNotifications.forEach(function(note) {
    const item = document.createElement("li");
    item.className = note.read ? "notification-item" : "notification-item unread";
    const message = document.createElement("p");
    const time = document.createElement("small");
    message.textContent = note.message;
    time.textContent = new Date(note.createdAt).toLocaleString();
    item.append(message, time);
    list.appendChild(item);
  });
}

// Check whether the signed-in role works in the staff dashboard.
function isStaffRole(role) {
  return role === "admin" || role === "technician" || role === "receptionist";
}

// Show dates in a short, readable format in the request lists.
function formatDate(date) {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString();
}

// 3. Page navigation and role-specific dashboards.
function showPage(pageId) {
  document.getElementById("welcome-page").classList.add("hidden");
  document.getElementById("admin-page").classList.add("hidden");
  document.getElementById("customer-page").classList.add("hidden");
  document.getElementById(pageId).classList.remove("hidden");
}

function showLoginForm() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("show-login").classList.add("active");
  document.getElementById("show-register").classList.remove("active");
}

function showRegisterForm() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
  document.getElementById("show-login").classList.remove("active");
  document.getElementById("show-register").classList.add("active");
}

function openDashboard() {
  document.getElementById("signed-in-user").textContent = signedInUser.name;
  document.getElementById("notification-button").classList.remove("hidden");
  renderNotifications();

  if (isStaffRole(signedInUser.role)) {
    showPage("admin-page");
    const roleName = signedInUser.role.charAt(0).toUpperCase() + signedInUser.role.slice(1);
    document.getElementById("staff-role-label").textContent = roleName.toUpperCase();
    document.getElementById("staff-dashboard-title").textContent = roleName + " Dashboard";
    const isTechnician = signedInUser.role === "technician";
    document.getElementById("staff-dashboard-description").textContent = signedInUser.role === "admin"
      ? "View every request and manage workshop activity."
      : signedInUser.role === "receptionist"
        ? "Manage customer bookings, request details, and service updates."
        : "Work through active workshop jobs and update their status.";
    document.getElementById("request-list-title").textContent = isTechnician ? "Active workshop jobs" : signedInUser.role === "receptionist" ? "Booking desk" : "All customer requests";
    document.getElementById("request-list-description").textContent = isTechnician
      ? "Completed jobs are removed from this work queue."
      : signedInUser.role === "receptionist"
        ? "Review customer bookings and keep request details up to date."
        : "All requests and their current status across the workshop.";
    document.getElementById("staff-summary-grid").classList.toggle("hidden", isTechnician);
    document.getElementById("technician-summary").classList.toggle("hidden", !isTechnician);
    document.getElementById("staff-report").classList.toggle("hidden", signedInUser.role !== "admin");
    document.getElementById("show-new-request").classList.toggle("hidden", isTechnician);
    document.querySelectorAll(".admin-tools").forEach(function(section) { section.classList.toggle("hidden", signedInUser.role !== "admin"); });
    document.getElementById("reception-tools").classList.toggle("hidden", signedInUser.role !== "receptionist");
    document.getElementById("technician-tools").classList.toggle("hidden", !isTechnician);
    document.getElementById("show-new-request").textContent = signedInUser.role === "receptionist" ? "＋ Create booking / job card" : "＋ Add request";
    renderAdmin();
  } else {
    showPage("customer-page");
    document.getElementById("customer-greeting").textContent = "Welcome, " + signedInUser.name;
    renderCustomerRequests();
  }
}

// Populate the staff booking form with current technicians for job assignment.
function fillTechnicianOptions(selectedEmail) {
  const select = document.getElementById("admin-technician");
  select.innerHTML = "<option value=\"\">Not assigned</option>";
  data.users.filter(function(person) { return person.role === "technician"; }).forEach(function(person) {
    const option = document.createElement("option"); option.value = person.email; option.textContent = person.name; select.appendChild(option);
  });
  select.value = selectedEmail || "";
}

function logout() {
  signedInUser = null;
  document.getElementById("signed-in-user").textContent = "";
  document.getElementById("notification-button").classList.add("hidden");
  document.getElementById("notification-panel").classList.add("hidden");
  document.getElementById("login-form").reset();
  showLoginForm();
  showPage("welcome-page");
}

// 4. Display, search, filter, and report the admin's service requests.
function renderAdmin() {
  const tableBody = document.getElementById("admin-requests");
  const searchText = document.getElementById("request-search").value.toLowerCase();
  const selectedStatus = document.getElementById("status-filter").value;
  const roleRequests = signedInUser.role === "technician"
    ? data.requests.filter(function(request) { return request.status !== "Completed" && (!request.technicianEmail || request.technicianEmail === signedInUser.email); })
    : data.requests;
  const visibleRequests = roleRequests.filter(function(request) {
    const matchesSearch = (request.name + " " + request.vehicle + " " + request.service + " " + (request.complaint || "")).toLowerCase().includes(searchText);
    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  tableBody.innerHTML = "";
  document.getElementById("empty-admin-list").classList.toggle("hidden", visibleRequests.length > 0);

  visibleRequests.forEach(function(request) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const vehicleCell = document.createElement("td");
    const complaintCell = document.createElement("td");
    const serviceCell = document.createElement("td");
    const statusCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const statusSelect = document.createElement("select");

    nameCell.textContent = request.name;
    dateCell.textContent = formatDate(request.date);
    vehicleCell.textContent = request.vehicle;
    complaintCell.textContent = request.complaint || "—";
    serviceCell.textContent = request.service;
    statusCell.textContent = request.status;
    statusSelect.className = "request-status";
    statusSelect.dataset.requestId = request.id;

    const availableStatuses = signedInUser.role === "technician" ? ["In Progress", "Ready"] : ["New", "In Progress", "Ready", "Completed"];
    availableStatuses.forEach(function(status) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      statusSelect.appendChild(option);
    });
    statusSelect.value = request.status;

    actionCell.appendChild(statusSelect);
    // Reception handles approval and billing; the technician records parts used.
    if (signedInUser.role === "receptionist" || signedInUser.role === "admin") {
      const approval = document.createElement("select");
      approval.className = "request-approval";
      approval.dataset.requestId = request.id;
      ["Waiting", "Approved", "Declined"].forEach(function(value) { const option = document.createElement("option"); option.value = value; option.textContent = "Approval: " + value; approval.appendChild(option); });
      approval.value = request.approval || "Waiting";
      const bill = document.createElement("input");
      bill.className = "request-bill"; bill.dataset.requestId = request.id; bill.type = "number"; bill.min = "0"; bill.placeholder = "Final bill ₹"; bill.value = request.bill ?? request.estimate ?? 0; bill.setAttribute("aria-label", "Final bill in rupees");
      const techAssign = document.createElement("select"); techAssign.className = "request-technician"; techAssign.dataset.requestId = request.id;
      const unassigned = document.createElement("option"); unassigned.value = ""; unassigned.textContent = "Assign technician…"; techAssign.appendChild(unassigned);
      data.users.filter(function(person) { return person.role === "technician"; }).forEach(function(person) { const option = document.createElement("option"); option.value = person.email; option.textContent = person.name; techAssign.appendChild(option); });
      techAssign.value = request.technicianEmail || "";
      actionCell.append(document.createElement("br"), approval, bill, techAssign);
    }
    if (signedInUser.role === "technician") {
      const partSelect = document.createElement("select"); partSelect.className = "part-choice"; partSelect.dataset.requestId = request.id;
      const first = document.createElement("option"); first.value = ""; first.textContent = "Parts used…"; partSelect.appendChild(first);
      data.inventory.forEach(function(part) { const option = document.createElement("option"); option.value = part.id; option.textContent = part.name + " — ₹" + part.price + " · stock " + part.stock; partSelect.appendChild(option); });
      const quantity = document.createElement("input"); quantity.className = "part-quantity"; quantity.dataset.requestId = request.id; quantity.type = "number"; quantity.min = "1"; quantity.value = "1"; quantity.setAttribute("aria-label", "Quantity of part used");
      const addPart = document.createElement("button"); addPart.type = "button"; addPart.className = "small-button add-part-button"; addPart.dataset.requestId = request.id; addPart.textContent = "Log part";
      actionCell.append(document.createElement("br"), partSelect, quantity, addPart);
      const partInfo = document.createElement("small"); partInfo.className = "part-info"; partInfo.textContent = "Choose a part to see unit price and stock."; actionCell.append(document.createElement("br"), partInfo);
      const used = document.createElement("small"); used.textContent = "Parts logged: " + (request.partsUsed || []).map(function(p) { return p.name + " × " + p.quantity; }).join(", "); actionCell.append(document.createElement("br"), used);
    }
    if (signedInUser.role === "admin" || signedInUser.role === "receptionist") {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-button";
      editButton.dataset.editId = request.id;
      editButton.textContent = "Edit";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.dataset.deleteId = request.id;
      deleteButton.textContent = "Delete";
      actionCell.append(document.createTextNode(" "), editButton, document.createTextNode(" "), deleteButton);
    }
    row.append(nameCell, dateCell, vehicleCell, complaintCell, serviceCell, statusCell, actionCell);
    tableBody.appendChild(row);
  });

  const countNew = data.requests.filter(function(request) { return request.status === "New"; }).length;
  const countProgress = data.requests.filter(function(request) { return request.status === "In Progress"; }).length;
  const countCompleted = data.requests.filter(function(request) { return request.status === "Completed"; }).length;
  document.getElementById("new-count").textContent = countNew;
  document.getElementById("progress-count").textContent = countProgress;
  document.getElementById("completed-count").textContent = countCompleted;
  document.getElementById("report-summary").textContent = data.requests.length + " total requests · " + countCompleted + " completed · " + (data.requests.length - countCompleted) + " still open.";
  document.getElementById("active-job-count").textContent = roleRequests.length;
  // Show the requested GTA VI joke to the admin when new requests are waiting.
  if (countNew > 0) {
    document.getElementById("admin-message").textContent = "admin got new request after gtaVI";
  }
  renderNotifications();
  renderRoleTools();
}

// Display the small role-specific records for staff, stock, prices, and reports.
function renderRoleTools() {
  // Build the parts dropdown from inventory records and retain its selection.
  const partSelect = document.getElementById("part-name");
  if (partSelect) {
    const selectedPartId = partSelect.value;
    partSelect.innerHTML = "<option value=\"\">Choose a part</option>";
    data.inventory.forEach(function(part) {
      const option = document.createElement("option"); option.value = part.id; option.textContent = part.name; partSelect.appendChild(option);
    });
    partSelect.value = selectedPartId;
  }
  const staffBody = document.getElementById("staff-list");
  if (staffBody) {
    staffBody.innerHTML = "";
    data.users.filter(function(person) { return person.role !== "customer"; }).forEach(function(person) {
      const row = document.createElement("tr"); [person.name, person.email, person.role].forEach(function(value) { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
      const action = document.createElement("td");
      if (person.role !== "admin") { const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-button remove-staff-button"; remove.dataset.staffEmail = person.email; remove.textContent = "Remove"; action.appendChild(remove); }
      row.appendChild(action); staffBody.appendChild(row);
    });
  }
  const inventoryBody = document.getElementById("inventory-list");
  if (inventoryBody) {
    inventoryBody.innerHTML = "";
    data.inventory.forEach(function(part) {
      const row = document.createElement("tr");
      [part.name, "₹" + part.price, part.stock + (part.stock <= 3 ? " · Low stock" : ""), "₹" + (part.price * part.stock)].forEach(function(value) { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
      inventoryBody.appendChild(row);
    });
  }
  const prices = document.getElementById("service-price-list");
  if (prices) { prices.innerHTML = ""; data.servicePrices.forEach(function(service) { const row = document.createElement("tr"); const name = document.createElement("td"); const price = document.createElement("td"); name.textContent = service.name; price.textContent = "₹" + service.price; row.append(name, price); prices.appendChild(row); }); }
  const completed = data.requests.filter(function(request) { return request.status === "Completed"; }).length;
  const recordsBody = document.getElementById("reception-records");
  if (recordsBody) {
    recordsBody.innerHTML = "";
    data.requests.forEach(function(request) {
      const row = document.createElement("tr");
      [request.name, request.email || "—", request.vehicle, formatDate(request.date), request.service].forEach(function(value) { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
      recordsBody.appendChild(row);
    });
  }
  const totalBills = data.requests.reduce(function(sum, request) { return sum + Number(request.bill || 0); }, 0);
  document.getElementById("admin-overall-report").textContent = data.users.filter(function(person) { return person.role === "technician"; }).length + " technicians · " + data.users.filter(function(person) { return person.role === "receptionist"; }).length + " receptionists · " + data.requests.length + " jobs · " + completed + " completed · Bills recorded: ₹" + totalBills + ".";
  document.getElementById("reception-overall-report").textContent = data.requests.length + " bookings / job cards · " + data.requests.filter(function(request) { return request.approval === "Waiting"; }).length + " awaiting approval · Total billing recorded: ₹" + totalBills + ".";
  document.getElementById("technician-work-count").textContent = data.requests.filter(function(request) { return request.status !== "Completed"; }).length + " active jobs. Parts already logged are shown in each job row.";
}

// 5. Display only the requests that belong to the signed-in customer.
// When a request is Completed, add the local payment QR image under that request.
function renderCustomerRequests() {
  const list = document.getElementById("my-requests");
  const myRequests = data.requests.filter(function(request) { return request.email === signedInUser.email; });
  list.innerHTML = "";
  document.getElementById("empty-customer-list").classList.toggle("hidden", myRequests.length > 0);

  myRequests.forEach(function(request) {
    const item = document.createElement("li");
    const details = document.createElement("div");
    details.className = "request-details";
    const assignedTechnician = data.users.find(function(person) { return person.email === request.technicianEmail; });
    details.textContent = formatDate(request.date) + " · " + request.vehicle + " · " + request.service + " · " + (request.complaint || "No complaint entered") + " · Technician: " + (assignedTechnician ? assignedTechnician.name : "Waiting for assignment") + " · Status: " + request.status + " · Approval: " + (request.approval || "Waiting") + " · Estimate: ₹" + Number(request.estimate || 0) + " · Final bill: ₹" + Number(request.bill || 0);
    // Show the completion quote and payment QR only when staff set status to Completed.
    if (request.status === "Completed") {
      details.textContent += ' · "boss completed"';

      // The image file sits beside index.html; this relative path makes it work in the ZIP too.
      const qrFigure = document.createElement("figure");
      qrFigure.className = "completed-qr";
      const qrImage = document.createElement("img");
      qrImage.src = "payment-qr.jpeg";
      qrImage.alt = "Payment QR code";
      const qrCaption = document.createElement("figcaption");
      qrCaption.textContent = "Scan this QR code for payment.";
      qrFigure.append(qrImage, qrCaption);
      details.appendChild(qrFigure);
    }
    item.appendChild(details);

    if (request.status === "New") {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-button customer-edit-button";
      editButton.dataset.editCustomerId = request.id;
      editButton.textContent = "Edit";
      item.appendChild(editButton);
    }
    list.appendChild(item);
  });
}

// 6. Vehicle selectors: fill years and provide an Other option for uncommon vehicles.
const yearSelect = document.getElementById("vehicle-year");
for (let year = new Date().getFullYear(); year >= 1990; year--) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
}
const otherYearOption = document.createElement("option");
otherYearOption.value = "Other";
otherYearOption.textContent = "Other year";
yearSelect.appendChild(otherYearOption);

// Show a year entry box if the vehicle year is not in the year list.
yearSelect.addEventListener("change", function() {
  const isOtherYear = this.value === "Other";
  document.getElementById("other-year-field").classList.toggle("hidden", !isOtherYear);
  document.getElementById("other-year").required = isOtherYear;
});

const modelsByCompany = {
  Honda: ["Civic", "Accord", "City", "CR-V"],
  Toyota: ["Corolla", "Camry", "Innova", "Fortuner"],
  BMW: ["3 Series", "5 Series", "X1", "X5"],
  Audi: ["A3", "A4", "Q3", "Q5"],
  Ford: ["Figo", "EcoSport", "Endeavour", "Mustang"],
  Hyundai: ["i10", "i20", "Creta", "Venue"],
  Nissan: ["Magnite", "Kicks", "Sunny", "X-Trail"],
  Suzuki: ["Swift", "Baleno", "Brezza", "Dzire"],
  Kia: ["Sonet", "Seltos", "Carens", "EV6"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"]
};

// Fill the model menu based on the chosen company and allow an unlisted company.
document.getElementById("vehicle-company").addEventListener("change", function() {
  const modelSelect = document.getElementById("vehicle-model");
  const otherCompany = this.value === "Other";
  document.getElementById("other-company-field").classList.toggle("hidden", !otherCompany);
  document.getElementById("other-company").required = otherCompany;
  modelSelect.innerHTML = "";
  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = "Choose a model";
  modelSelect.appendChild(firstOption);

  const models = modelsByCompany[this.value] || [];
  models.forEach(function(model) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });

  const otherModelOption = document.createElement("option");
  otherModelOption.value = "Other";
  otherModelOption.textContent = "Other model";
  modelSelect.appendChild(otherModelOption);
  modelSelect.disabled = !this.value;
  modelSelect.value = "";
  document.getElementById("other-model-field").classList.add("hidden");
  document.getElementById("other-model").required = false;
});

// Show a model entry box when the model is not in the suggested model list.
document.getElementById("vehicle-model").addEventListener("change", function() {
  const isOtherModel = this.value === "Other";
  document.getElementById("other-model-field").classList.toggle("hidden", !isOtherModel);
  document.getElementById("other-model").required = isOtherModel;
});

// Restore a saved vehicle year when a customer edits a request.
function chooseVehicleYear(year) {
  const yearOptionExists = Array.from(yearSelect.options).some(function(option) {
    return option.value === String(year);
  });
  yearSelect.value = yearOptionExists ? String(year) : "Other";
  yearSelect.dispatchEvent(new Event("change"));
  if (!yearOptionExists) document.getElementById("other-year").value = year;
}

// Restore a saved company and model, including custom values, in the form.
function chooseVehicleCompanyAndModel(company, model) {
  const companyIsListed = Object.prototype.hasOwnProperty.call(modelsByCompany, company);
  const companySelect = document.getElementById("vehicle-company");
  companySelect.value = companyIsListed ? company : "Other";
  companySelect.dispatchEvent(new Event("change"));
  if (!companyIsListed) document.getElementById("other-company").value = company;

  const modelSelect = document.getElementById("vehicle-model");
  const modelIsListed = (modelsByCompany[company] || []).includes(model);
  modelSelect.value = modelIsListed ? model : "Other";
  modelSelect.dispatchEvent(new Event("change"));
  if (!modelIsListed) document.getElementById("other-model").value = model;
}

// Clear custom vehicle entries after a form is submitted or customer cancels editing.
function resetVehicleChoices() {
  yearSelect.value = "";
  yearSelect.dispatchEvent(new Event("change"));
  document.getElementById("other-year").value = "";

  const companySelect = document.getElementById("vehicle-company");
  companySelect.value = "";
  companySelect.dispatchEvent(new Event("change"));
  document.getElementById("other-company").value = "";
  document.getElementById("other-model").value = "";
}

// Show the extra text box only when the customer selects Other.
document.getElementById("customer-service").addEventListener("change", function() {
  const otherField = document.getElementById("other-service-field");
  const otherInput = document.getElementById("other-service");
  const isOther = this.value === "Other";
  otherField.classList.toggle("hidden", !isOther);
  otherInput.required = isOther;
});

// 7. Handle welcome page buttons, login, and customer registration.
document.getElementById("home-link").addEventListener("click", function(event) {
  event.preventDefault();
  logout();
});

document.getElementById("show-login").addEventListener("click", showLoginForm);
document.getElementById("show-register").addEventListener("click", showRegisterForm);
document.getElementById("admin-logout").addEventListener("click", logout);
document.getElementById("customer-logout").addEventListener("click", logout);

// Open or close the notification corner and mark notices as read.
document.getElementById("notification-button").addEventListener("click", function() {
  const panel = document.getElementById("notification-panel");
  panel.classList.toggle("hidden");
  this.setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
  renderNotifications();
});

document.getElementById("mark-notifications-read").addEventListener("click", function() {
  data.notifications.forEach(function(note) {
    if (note.audience.includes("all") || note.audience.includes(signedInUser.role) || note.audience.includes(signedInUser.email)) {
      note.read = true;
    }
  });
  saveData();
  renderNotifications();
});

document.getElementById("login-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;
  signedInUser = data.users.find(function(user) {
    return user.email.toLowerCase() === email && user.password === password;
  });

  if (signedInUser) {
    document.getElementById("login-message").textContent = "";
    openDashboard();
  } else {
    // The login message uses the red .message style in styles.css.
    document.getElementById("login-message").textContent = "mamu password galat hai.phir se try kar";
  }
});

document.getElementById("register-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const password = document.getElementById("register-password").value;
  const duplicateEmail = data.users.some(function(user) { return user.email.toLowerCase() === email; });

  if (duplicateEmail) {
    document.getElementById("register-message").textContent = "An account already uses that email.";
    return;
  }

  signedInUser = { name: name, email: email, password: password, role: "customer" };
  data.users.push(signedInUser);
  saveData();
  addNotification("New customer account registered: " + name, ["admin", "receptionist"]);
  addNotification("Your customer account is ready.", [email]);
  document.getElementById("register-form").reset();
  document.getElementById("register-message").textContent = "";
  openDashboard();
});

// 8. Create or edit a customer's service request.
document.getElementById("customer-request-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const selectedYear = document.getElementById("vehicle-year").value;
  const year = selectedYear === "Other" ? document.getElementById("other-year").value.trim() : selectedYear;
  const selectedCompany = document.getElementById("vehicle-company").value;
  const company = selectedCompany === "Other" ? document.getElementById("other-company").value.trim() : selectedCompany;
  const selectedModel = document.getElementById("vehicle-model").value;
  const model = selectedModel === "Other" ? document.getElementById("other-model").value.trim() : selectedModel;
  let service = document.getElementById("customer-service").value;

  if (service === "Other") {
    service = "Other: " + document.getElementById("other-service").value.trim();
  }

  const requestDetails = {
    name: signedInUser.name,
    email: signedInUser.email,
    date: document.getElementById("appointment-date").value,
    year: year,
    company: company,
    model: model,
    vehicle: year + " " + company + " " + model,
    service: service,
    complaint: document.getElementById("initial-complaint").value.trim()
  };
  const priceForService = data.servicePrices.find(function(item) { return item.name === service; });
  requestDetails.estimate = priceForService ? priceForService.price : 0;
  const editingId = Number(this.dataset.editingId);
  const existingRequest = data.requests.find(function(request) {
    return request.id === editingId && request.email === signedInUser.email && request.status === "New";
  });

  if (editingId && !existingRequest) {
    document.getElementById("customer-request-message").textContent = "Only your new requests can be edited.";
    return;
  }

  if (existingRequest) {
    Object.assign(existingRequest, requestDetails);
    if (!existingRequest.billManual) {
      const partsTotal = (existingRequest.partsUsed || []).reduce(function(total, part) { return total + Number(part.unitPrice) * Number(part.quantity); }, 0);
      existingRequest.bill = requestDetails.estimate + partsTotal;
    }
  } else {
    const nextId = data.requests.length ? Math.max(...data.requests.map(function(request) { return request.id; })) + 1 : 1;
    data.requests.push(Object.assign({ id: nextId, status: "New", approval: "Waiting", bill: requestDetails.estimate, billManual: false, technicianEmail: "", partsUsed: [] }, requestDetails));
  }

  const message = existingRequest ? "Your request has been updated." : "tension nahi lena ka, apun fix kar dega";
  saveData();
  addNotification(existingRequest ? "Customer updated a service request: " + requestDetails.name : "New service request from " + requestDetails.name, ["admin", "technician", "receptionist", requestDetails.email]);
  document.getElementById("customer-request-form").reset();
  delete this.dataset.editingId;
  document.getElementById("customer-submit-button").textContent = "Submit request";
  document.getElementById("cancel-customer-edit").classList.add("hidden");
  resetVehicleChoices();
  document.getElementById("other-service-field").classList.add("hidden");
  document.getElementById("other-service").required = false;
  document.getElementById("customer-request-message").textContent = message;
  renderCustomerRequests();
  // Use a browser dialog to confirm a newly submitted customer request.
  if (!existingRequest) {
    window.alert("tension nahi lena ka, apun fix kar dega");
  }
});

// 9. Let customers edit their own requests until workshop staff start the work.
document.getElementById("my-requests").addEventListener("click", function(event) {
  if (!event.target.classList.contains("customer-edit-button")) return;
  const requestId = Number(event.target.dataset.editCustomerId);
  const request = data.requests.find(function(item) {
    return item.id === requestId && item.email === signedInUser.email && item.status === "New";
  });
  if (!request) return;

  addNotification("Customer edited a service request: " + request.name, ["admin", "technician", "receptionist", request.email]);
  const form = document.getElementById("customer-request-form");
  form.dataset.editingId = request.id;
  chooseVehicleYear(request.year || "");
  chooseVehicleCompanyAndModel(request.company || "", request.model || "");
  document.getElementById("appointment-date").value = request.date || "";

  if (request.service.startsWith("Other: ")) {
    document.getElementById("customer-service").value = "Other";
    document.getElementById("customer-service").dispatchEvent(new Event("change"));
    document.getElementById("other-service").value = request.service.slice(7);
  } else {
    document.getElementById("customer-service").value = request.service;
    document.getElementById("customer-service").dispatchEvent(new Event("change"));
  }

  document.getElementById("initial-complaint").value = request.complaint || "";
  document.getElementById("customer-submit-button").textContent = "Save changes";
  document.getElementById("cancel-customer-edit").classList.remove("hidden");
  document.getElementById("customer-request-message").textContent = "Editing your new request.";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Cancel customer request editing and clear the form.
document.getElementById("cancel-customer-edit").addEventListener("click", function() {
  const form = document.getElementById("customer-request-form");
  form.reset();
  delete form.dataset.editingId;
  document.getElementById("customer-submit-button").textContent = "Submit request";
  this.classList.add("hidden");
  resetVehicleChoices();
  document.getElementById("other-service-field").classList.add("hidden");
  document.getElementById("other-service").required = false;
  document.getElementById("customer-request-message").textContent = "";
});

// 10. Show, reset, and cancel the staff request form.
document.getElementById("show-new-request").addEventListener("click", function() {
  const form = document.getElementById("admin-request-form");
  form.reset();
  delete form.dataset.editingId;
  document.getElementById("admin-form-title").textContent = "Add a customer request";
  document.getElementById("save-request-button").textContent = "Save request";
  document.getElementById("admin-date").value = new Date().toISOString().slice(0, 10);
  fillTechnicianOptions("");
  form.classList.toggle("hidden");
});

document.getElementById("cancel-new-request").addEventListener("click", function() {
  const form = document.getElementById("admin-request-form");
  form.reset();
  delete form.dataset.editingId;
  document.getElementById("admin-form-title").textContent = "Add a customer request";
  document.getElementById("save-request-button").textContent = "Save request";
  form.classList.add("hidden");
});

// 11. Add or update a service request from the staff dashboard.
document.getElementById("admin-request-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const editingId = Number(this.dataset.editingId);
  const request = data.requests.find(function(item) { return item.id === editingId; });

  if (request) {
    request.name = document.getElementById("admin-customer").value.trim();
    request.email = document.getElementById("admin-email").value.trim().toLowerCase();
    request.phone = document.getElementById("admin-phone").value.trim();
    request.date = document.getElementById("admin-date").value;
    request.vehicle = document.getElementById("admin-vehicle").value.trim();
    request.service = document.getElementById("admin-service").value.trim();
    request.estimate = (data.servicePrices.find(function(item) { return item.name === request.service; }) || { price: 0 }).price;
    request.technicianEmail = document.getElementById("admin-technician").value;
    if (!request.billManual) request.bill = request.estimate + (request.partsUsed || []).reduce(function(total, part) { return total + Number(part.unitPrice) * Number(part.quantity); }, 0);
    request.complaint = document.getElementById("admin-complaint").value.trim();
  } else {
    const nextId = data.requests.length ? Math.max(...data.requests.map(function(item) { return item.id; })) + 1 : 1;
    data.requests.push({
      id: nextId,
      name: document.getElementById("admin-customer").value.trim(),
      email: document.getElementById("admin-email").value.trim().toLowerCase(),
      phone: document.getElementById("admin-phone").value.trim(),
      date: document.getElementById("admin-date").value,
      vehicle: document.getElementById("admin-vehicle").value.trim(),
      service: document.getElementById("admin-service").value.trim(),
      technicianEmail: document.getElementById("admin-technician").value,
      complaint: document.getElementById("admin-complaint").value.trim(),
      status: "New",
      approval: "Waiting",
      bill: (data.servicePrices.find(function(item) { return item.name === document.getElementById("admin-service").value.trim(); }) || { price: 0 }).price,
      billManual: false,
      estimate: (data.servicePrices.find(function(item) { return item.name === document.getElementById("admin-service").value.trim(); }) || { price: 0 }).price,
      partsUsed: []
    });
  }

  const message = request ? "Request details updated." : "New request added.";
  saveData();
  const savedRequest = request || data.requests[data.requests.length - 1];
  const staffAndCustomer = savedRequest.email ? ["admin", "technician", "receptionist", savedRequest.email] : ["admin", "technician", "receptionist"];
  addNotification(message + " for " + savedRequest.name, staffAndCustomer);
  this.reset();
  delete this.dataset.editingId;
  this.classList.add("hidden");
  document.getElementById("admin-form-title").textContent = "Add a customer request";
  document.getElementById("save-request-button").textContent = "Save request";
  renderAdmin();
  document.getElementById("admin-message").textContent = message;
});

// Admin adds workshop staff accounts; the role controls the dashboard they see.
document.getElementById("staff-form").addEventListener("submit", function(event) {
  event.preventDefault();
  if (signedInUser === null || signedInUser.role !== "admin") return;
  const name = document.getElementById("staff-name").value.trim();
  const email = document.getElementById("staff-email").value.trim().toLowerCase();
  if (data.users.some(function(person) { return person.email.toLowerCase() === email; })) {
    window.alert("An account already uses that email.");
    return;
  }
  data.users.push({ name: name, email: email, password: document.getElementById("staff-password").value, role: document.getElementById("staff-role").value });
  saveData();
  addNotification("New workshop staff account created: " + name, ["admin"]);
  this.reset();
  renderRoleTools();
  document.getElementById("admin-message").textContent = "Staff account added.";
});

// Admin records inventory arrivals and their unit prices.
document.getElementById("part-form").addEventListener("submit", function(event) {
  event.preventDefault();
  if (signedInUser === null || signedInUser.role !== "admin") return;
  const partId = Number(document.getElementById("part-name").value);
  const existingPart = data.inventory.find(function(part) { return part.id === partId; });
  if (!existingPart) { window.alert("Choose a part from the list."); return; }
  const price = Number(document.getElementById("part-price").value);
  const stock = Number(document.getElementById("part-stock").value);
  existingPart.price = price;
  existingPart.stock += stock;
  saveData();
  this.reset();
  renderRoleTools();
  renderAdmin();
  document.getElementById("admin-message").textContent = "Inventory saved. Existing parts get the new stock added.";
});

// Fill the price field with the saved price when a part is selected.
document.getElementById("part-name").addEventListener("change", function() {
  const selectedPart = data.inventory.find(function(part) { return part.id === Number(this.value); }, this);
  document.getElementById("part-price").value = selectedPart ? selectedPart.price : "";
});

// Admin updates a service's base price without adding extra systems or tools.
document.getElementById("price-form").addEventListener("submit", function(event) {
  event.preventDefault();
  if (signedInUser === null || signedInUser.role !== "admin") return;
  const serviceName = document.getElementById("price-service").value;
  const service = data.servicePrices.find(function(item) { return item.name === serviceName; });
  if (!service) return;
  service.price = Number(document.getElementById("price-amount").value);
  saveData();
  renderRoleTools();
  document.getElementById("admin-message").textContent = "Base service price saved.";
});

// 12. Update the request list when search or status filters change.
document.getElementById("request-search").addEventListener("input", renderAdmin);
document.getElementById("status-filter").addEventListener("change", renderAdmin);

// 13. Let staff update statuses; admins and receptionists can also edit or delete.
document.getElementById("admin-requests").addEventListener("change", function(event) {
  if (signedInUser === null || !isStaffRole(signedInUser.role)) return;
  if (event.target.classList.contains("part-choice")) {
    const selectedPart = data.inventory.find(function(part) { return part.id === Number(event.target.value); });
    const row = event.target.closest("tr");
    const info = row.querySelector(".part-info");
    const quantity = row.querySelector(".part-quantity");
    if (selectedPart) {
      info.textContent = "Unit price: ₹" + selectedPart.price + " · Available stock: " + selectedPart.stock;
      quantity.max = selectedPart.stock;
    } else {
      info.textContent = "Choose a part to see unit price and stock.";
      quantity.removeAttribute("max");
    }
    return;
  }
  if (event.target.classList.contains("request-approval")) {
    if (signedInUser.role !== "receptionist" && signedInUser.role !== "admin") return;
    const approvedRequest = data.requests.find(function(item) { return item.id === Number(event.target.dataset.requestId); });
    if (approvedRequest) { approvedRequest.approval = event.target.value; saveData(); addNotification("Booking approval updated for " + approvedRequest.name + ": " + approvedRequest.approval, ["admin", "receptionist", "technician", approvedRequest.email]); renderAdmin(); }
    return;
  }
  if (event.target.classList.contains("request-bill")) {
    if (signedInUser.role !== "receptionist" && signedInUser.role !== "admin") return;
    const billedRequest = data.requests.find(function(item) { return item.id === Number(event.target.dataset.requestId); });
    if (billedRequest) { billedRequest.bill = Number(event.target.value || 0); billedRequest.billManual = true; saveData(); addNotification("Final bill updated for " + billedRequest.name + ": ₹" + billedRequest.bill, ["admin", "receptionist", billedRequest.email]); renderRoleTools(); }
    return;
  }
  if (event.target.classList.contains("request-technician")) {
    if (signedInUser.role !== "receptionist" && signedInUser.role !== "admin") return;
    const assignedRequest = data.requests.find(function(item) { return item.id === Number(event.target.dataset.requestId); });
    if (assignedRequest) {
      assignedRequest.technicianEmail = event.target.value;
      const assignedTech = data.users.find(function(person) { return person.email === event.target.value; });
      saveData();
      addNotification(assignedTech ? "Job assigned to " + assignedTech.name + ": " + assignedRequest.name : "Technician assignment removed for " + assignedRequest.name, ["admin", "receptionist", "technician", assignedRequest.email, event.target.value]);
      renderAdmin();
    }
    return;
  }
  if (!event.target.classList.contains("request-status")) return;
  const requestId = Number(event.target.dataset.requestId);
  const request = data.requests.find(function(item) { return item.id === requestId; });
  if (request) {
    request.status = event.target.value;
    saveData();
    addNotification("Request status changed for " + request.name + ": " + request.status, ["admin", "technician", "receptionist", request.email]);
    renderAdmin();
    document.getElementById("admin-message").textContent = "Request status changed to " + request.status + ".";
  }
});

document.getElementById("admin-requests").addEventListener("click", function(event) {
  // Technician part use is recorded on a job and stock is reduced immediately.
  if (event.target.classList.contains("add-part-button")) {
    if (signedInUser === null || signedInUser.role !== "technician") return;
    const requestId = Number(event.target.dataset.requestId);
    const request = data.requests.find(function(item) { return item.id === requestId; });
    const row = event.target.closest("tr");
    const partId = Number(row.querySelector(".part-choice").value);
    const quantity = Number(row.querySelector(".part-quantity").value);
    const part = data.inventory.find(function(item) { return item.id === partId; });
    if (!request || !part || quantity < 1 || part.stock < quantity) { window.alert("Choose a part and a quantity available in stock."); return; }
    part.stock -= quantity;
    request.partsUsed = request.partsUsed || [];
    request.partsUsed.push({ name: part.name, quantity: quantity, unitPrice: part.price });
    request.bill = Number(request.bill ?? request.estimate ?? 0) + part.price * quantity;
    saveData();
    addNotification(quantity + " × " + part.name + " logged on the job for " + request.name, ["admin", "technician", "receptionist", request.email]);
    renderAdmin();
    return;
  }
  if (signedInUser === null || (signedInUser.role !== "admin" && signedInUser.role !== "receptionist")) return;

  if (event.target.classList.contains("edit-button")) {
    const requestId = Number(event.target.dataset.editId);
    const request = data.requests.find(function(item) { return item.id === requestId; });
    if (!request) return;

    const form = document.getElementById("admin-request-form");
    form.dataset.editingId = request.id;
    document.getElementById("admin-customer").value = request.name;
    document.getElementById("admin-email").value = request.email || "";
    document.getElementById("admin-phone").value = request.phone || "";
    document.getElementById("admin-date").value = request.date || "";
    document.getElementById("admin-vehicle").value = request.vehicle;
    const serviceSelect = document.getElementById("admin-service");
    if (!Array.from(serviceSelect.options).some(function(option) { return option.value === request.service; })) {
      const customService = document.createElement("option"); customService.value = request.service; customService.textContent = request.service; serviceSelect.appendChild(customService);
    }
    serviceSelect.value = request.service;
    fillTechnicianOptions(request.technicianEmail);
    document.getElementById("admin-complaint").value = request.complaint || "";
    document.getElementById("admin-form-title").textContent = "Edit customer request";
    document.getElementById("save-request-button").textContent = "Save changes";
    form.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!event.target.classList.contains("delete-button")) return;
  if (!window.confirm("Delete this customer request?")) return;
  const requestId = Number(event.target.dataset.deleteId);
  const deletedRequest = data.requests.find(function(request) { return request.id === requestId; });
  data.requests = data.requests.filter(function(request) { return request.id !== requestId; });
  saveData();
  if (deletedRequest) addNotification("Request deleted for " + deletedRequest.name, ["admin", "technician", "receptionist", deletedRequest.email]);
  renderAdmin();
  document.getElementById("admin-message").textContent = "Request deleted.";
});

// Admin can remove workshop accounts from the staff list, but not the active admin.
document.getElementById("staff-list").addEventListener("click", function(event) {
  if (!event.target.classList.contains("remove-staff-button") || signedInUser === null || signedInUser.role !== "admin") return;
  const email = event.target.dataset.staffEmail;
  const person = data.users.find(function(item) { return item.email === email && item.role !== "admin"; });
  if (!person || !window.confirm("Remove the staff account for " + person.name + "?")) return;
  data.users = data.users.filter(function(item) { return item.email !== email; });
  data.requests.forEach(function(request) { if (request.technicianEmail === email) request.technicianEmail = ""; });
  saveData();
  renderRoleTools();
  document.getElementById("admin-message").textContent = "Staff account removed.";
});

// Refresh lists and notifications when another tab changes this browser's saved data.
window.addEventListener("storage", function(event) {
  if (event.key !== STORAGE_KEY) return;
  data = loadData();
  renderNotifications();
  if (!document.getElementById("admin-page").classList.contains("hidden")) renderAdmin();
  if (!document.getElementById("customer-page").classList.contains("hidden")) renderCustomerRequests();
});
