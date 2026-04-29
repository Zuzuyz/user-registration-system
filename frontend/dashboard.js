const STORAGE_KEYS = {
  sessionUser: "rescue-nexus-user",
  appState: "rescue-nexus-app-state"
};

const PAGE = document.body.dataset.page || "dashboard";
const currentUserEl = document.getElementById("currentUser");
const logoutButton = document.getElementById("logoutButton");
const pageSubtitle = document.getElementById("pageSubtitle");
const toastRegion = document.getElementById("toastRegion");
let responderDirectory = [];

const PAGE_SUBTITLES = {
  dashboard: {
    en: "Central overview of all rescue operations.",
    hi: "सभी राहत अभियानों का केंद्रीकृत दृश्य।"
  },
  "task-board": {
    en: "Mission queues, owners, progress, and field handovers.",
    hi: "मिशन कतारें, जिम्मेदार टीमें, प्रगति और शिफ्ट हैंडओवर।"
  },
  notifications: {
    en: "Approvals, alerts, and field communications in one view.",
    hi: "अनुमोदन, अलर्ट और फील्ड संचार एक ही दृश्य में।"
  },
  "disaster-map": {
    en: "India-only incident hotspots, shelters, and relief corridors.",
    hi: "भारत-केंद्रित घटनास्थल, आश्रय स्थल और राहत मार्ग।"
  },
  "delivery-tracking": {
    en: "Truck movement, ETA, and supply convoy visibility.",
    hi: "ट्रक मूवमेंट, ETA और आपूर्ति काफिले की दृश्यता।"
  },
  analytics: {
    en: "Weekly trends, district heat, escalation, and aid pressure insights.",
    hi: "साप्ताहिक रुझान, जिला हीट, एस्केलेशन और संसाधन दबाव की जानकारी।"
  },
  profile: {
    en: "Contact details, region assignment, password hint, language, and notification preferences.",
    hi: "संपर्क विवरण, क्षेत्र, पासवर्ड संकेत, भाषा और नोटिफिकेशन प्राथमिकताएँ।"
  },
  "admin-users": {
    en: "Roles, access status, recent logins, and export-ready user records.",
    hi: "भूमिकाएँ, एक्सेस स्थिति, हालिया लॉगिन और एक्सपोर्ट योग्य यूज़र रिकॉर्ड।"
  }
};

const LANGUAGE_LABELS = {
  en: {
    dashboard: "Dashboard",
    "task-board": "Task Board",
    "disaster-map": "Disaster Map",
    "delivery-tracking": "Delivery Tracking",
    analytics: "Analytics",
    notifications: "Notifications",
    profile: "Profile & Settings",
    "admin-users": "Admin Users",
    logout: "Logout",
    demoBanner: (role) => `Demo mode active: changes are saved locally for ${role} view.`
  },
  hi: {
    dashboard: "डैशबोर्ड",
    "task-board": "टास्क बोर्ड",
    "disaster-map": "आपदा मानचित्र",
    "delivery-tracking": "डिलीवरी ट्रैकिंग",
    analytics: "एनालिटिक्स",
    notifications: "सूचनाएँ",
    profile: "प्रोफाइल और सेटिंग्स",
    "admin-users": "एडमिन उपयोगकर्ता",
    logout: "लॉगआउट",
    demoBanner: (role) => `डेमो मोड सक्रिय है: बदलाव ${role} दृश्य के लिए लोकली सेव किए जाते हैं।`
  }
};

const DEFAULT_USERS = [
  { username: "Shubham", email: "shubham@gmail.com", role: "admin", region: "National Control", team: "Admin Command" },
  { username: "Shreyasi", email: "shreyasi@gmail.com", role: "ngo", region: "East Relief Cluster", team: "NGO Coordination" },
  { username: "Aarav Nair", email: "aarav.nair@rescuenexus.in", role: "rescue", region: "South Field Unit", team: "River Rescue Unit 12" },
  { username: "Kavya Das", email: "kavya.das@rescuenexus.in", role: "rescue", region: "North Terrain Desk", team: "Mountain Response Cell" },
  { username: "Rohan Singh", email: "rohan.singh@rescuenexus.in", role: "rescue", region: "West Logistics Route", team: "Convoy Team Sigma" }
];

const DEFAULT_STATE = {
  language: "en",
  incidents: [
    {
      id: "INC-201",
      title: "Flood corridor supply drop",
      location: "Assam, Guwahati",
      state: "Assam",
      district: "Guwahati",
      severity: "critical",
      category: "Food",
      owner: "Logistics Wing",
      assignedRole: "ngo",
      assignedTeam: "Central Food Cell",
      status: "Open",
      priority: "High",
      progress: 35,
      eta: 28,
      reportCount: 4,
      shelterNeed: 120,
      summary: "Dry ration and medical bundles needed in inundated villages along the Brahmaputra corridor.",
      blockedRoute: "NH-27 eastern corridor",
      hub: "Guwahati",
      evidenceName: "guwahati-flood-report.jpg",
      updatedAt: "2026-04-29T08:30:00+05:30",
      updatedBy: "Central Food Cell"
    },
    {
      id: "INC-202",
      title: "Landslide evacuation support",
      location: "Uttarakhand, Rishikesh",
      state: "Uttarakhand",
      district: "Rishikesh",
      severity: "high",
      category: "Rescue",
      owner: "Mountain Rescue",
      assignedRole: "rescue",
      assignedTeam: "Mountain Response Cell",
      status: "In Progress",
      priority: "High",
      progress: 58,
      eta: 41,
      reportCount: 3,
      shelterNeed: 40,
      summary: "Slope instability is blocking evacuation buses; rope team and medics requested.",
      blockedRoute: "Rishikesh bypass km 12",
      hub: "Delhi",
      evidenceName: "landslide-sector-note.pdf",
      updatedAt: "2026-04-29T09:15:00+05:30",
      updatedBy: "Mountain Response Cell"
    },
    {
      id: "INC-203",
      title: "Cyclone shelter replenishment",
      location: "Odisha, Puri",
      state: "Odisha",
      district: "Puri",
      severity: "medium",
      category: "Shelter",
      owner: "NGO Relief Cell",
      assignedRole: "ngo",
      assignedTeam: "Coastal Logistics Team",
      status: "In Progress",
      priority: "Medium",
      progress: 82,
      eta: 55,
      reportCount: 2,
      shelterNeed: 68,
      summary: "Camps need hygiene kits, blankets, and backup lighting before the evening tide window.",
      blockedRoute: "Puri beach service road",
      hub: "Patna",
      evidenceName: "camp-inventory.xlsx",
      updatedAt: "2026-04-29T10:05:00+05:30",
      updatedBy: "Coastal Logistics Team"
    },
    {
      id: "INC-204",
      title: "Medical stock synchronization",
      location: "Kerala, Kochi",
      state: "Kerala",
      district: "Kochi",
      severity: "medium",
      category: "Medical",
      owner: "Admin Command",
      assignedRole: "admin",
      assignedTeam: "South Regional Command",
      status: "Awaiting Approval",
      priority: "Low",
      progress: 24,
      eta: 19,
      reportCount: 1,
      shelterNeed: 20,
      summary: "Regional warehouses need a stock reconciliation before dispatching antibiotics and saline packs.",
      blockedRoute: "Warehouse lane 4",
      hub: "Bengaluru",
      evidenceName: "kochi-medical-sync.csv",
      updatedAt: "2026-04-29T11:10:00+05:30",
      updatedBy: "Admin Command"
    }
  ],
  deliveries: [
    { code: "RSQ-002", status: "Claimed", title: "Food Distribution - Flood Survivors", location: "Assam, Guwahati", ngo: "Indian Red Cross", assignee: "Central Food Cell", claimedBy: "Central Food Cell", category: "Food", categoryIcon: "🍲", type: "Dry Ration", activeStep: 0, eta: "28 min", priority: "Critical", updatedAt: "2026-04-29T08:42:00+05:30", updatedBy: "Central Food Cell" },
    { code: "RSQ-003", status: "In Progress", title: "Temporary Shelter Setup", location: "Uttarakhand, Dehradun", ngo: "Goonj Foundation", assignee: "Team Alpha", claimedBy: "North Relief Hub", category: "Shelter", categoryIcon: "🏠", type: "Emergency Shelter", activeStep: 1, eta: "41 min", priority: "High", updatedAt: "2026-04-29T09:24:00+05:30", updatedBy: "Team Alpha" },
    { code: "RSQ-004", status: "In Progress", title: "Clean Water Supply Urgently Required", location: "Odisha, Bhubaneswar", ngo: "UNICEF India", assignee: "Team Bravo", claimedBy: "Water Support Desk", category: "Water", categoryIcon: "💧", type: "Potable Supply", activeStep: 1, eta: "55 min", priority: "High", updatedAt: "2026-04-29T10:03:00+05:30", updatedBy: "Water Support Desk" },
    { code: "RSQ-005", status: "Delivered", title: "Winter Clothing for Displaced Families", location: "Jammu & Kashmir, Srinagar", ngo: "ReliefAid Collective", assignee: "Team Sigma", claimedBy: "Winter Relief Network", category: "Clothing", categoryIcon: "🧥", type: "Warm Clothing", activeStep: 2, eta: "Delivered", priority: "Medium", updatedAt: "2026-04-29T07:50:00+05:30", updatedBy: "Winter Relief Network" }
  ],
  notifications: [
    { id: "NTF-1", level: "Critical", text: "Satellite unit request pending approval for the Guwahati corridor.", audience: ["admin"], type: "approval", unread: true, time: "2m ago" },
    { id: "NTF-2", level: "Urgent", text: "New riverbank rescue request added in Assam with 120 evacuees waiting.", audience: ["rescue", "admin"], type: "incident", unread: true, time: "6m ago" },
    { id: "NTF-3", level: "Update", text: "8 new volunteers checked in from Chennai response unit.", audience: ["ngo", "admin"], type: "staffing", unread: true, time: "16m ago" },
    { id: "NTF-4", level: "Dispatch", text: "Mumbai truck line 4 reached checkpoint ahead of schedule.", audience: ["ngo", "rescue", "admin"], type: "delivery", unread: false, time: "28m ago" },
    { id: "NTF-5", level: "Approval", text: "NGO shelter extension budget requires admin confirmation.", audience: ["admin"], type: "budget", unread: true, time: "35m ago" }
  ],
  timeline: [
    { time: "09:15", title: "Assam convoy departed", note: "Medical crates and dry ration dispatched." },
    { time: "10:00", title: "Helpline escalation review", note: "27 new requests triaged by command desk." },
    { time: "11:20", title: "Jaipur fuel refill approved", note: "Delivery line kept active for western route." },
    { time: "12:10", title: "Shelter occupancy updated", note: "Odisha camps now at 78% utilization." }
  ],
  audit: [
    { id: "AUD-1", actor: "Admin Command", action: "Approved satellite unit request", target: "INC-201", time: "09:42" },
    { id: "AUD-2", actor: "Mountain Response Cell", action: "Updated evacuation progress", target: "INC-202", time: "10:18" },
    { id: "AUD-3", actor: "Coastal Logistics Team", action: "Marked shelter kit transfer complete", target: "INC-203", time: "11:03" }
  ],
  weather: [
    { district: "Guwahati", state: "Assam", condition: "Heavy Rain", risk: "critical", rainMm: 184, wind: 38, temp: 24, advisory: "Expect river rise in 3 hours." },
    { district: "Rishikesh", state: "Uttarakhand", condition: "Slope Instability", risk: "high", rainMm: 96, wind: 21, temp: 19, advisory: "Limit night evacuation on bypass road." },
    { district: "Puri", state: "Odisha", condition: "Cyclone Tailwind", risk: "high", rainMm: 72, wind: 46, temp: 27, advisory: "Shelter reinforcement advised before evening." },
    { district: "Kochi", state: "Kerala", condition: "Humid Heat", risk: "medium", rainMm: 24, wind: 18, temp: 31, advisory: "Cold-chain medicine needs monitoring." }
  ],
  shelters: [
    { id: "SH-1", name: "Brahmaputra Camp A", district: "Guwahati", state: "Assam", occupancy: 182, capacity: 220, supplies: 64, medical: 72, bedsOpen: 38, updatedAt: "2026-04-29T09:20:00+05:30" },
    { id: "SH-2", name: "Ridge Transit Shelter", district: "Rishikesh", state: "Uttarakhand", occupancy: 94, capacity: 110, supplies: 48, medical: 81, bedsOpen: 16, updatedAt: "2026-04-29T10:05:00+05:30" },
    { id: "SH-3", name: "Puri Coastal Safe Hall", district: "Puri", state: "Odisha", occupancy: 126, capacity: 180, supplies: 79, medical: 59, bedsOpen: 54, updatedAt: "2026-04-29T10:48:00+05:30" }
  ],
  volunteers: [
    { id: "VOL-1", name: "Nisha Verma", region: "East Relief Cluster", skill: "Medical", status: "checked-in", shift: "Day", lastCheckIn: "08:12" },
    { id: "VOL-2", name: "Arjun Patel", region: "South Field Unit", skill: "Logistics", status: "checked-out", shift: "Night", lastCheckIn: "Yesterday" },
    { id: "VOL-3", name: "Farhan Ali", region: "North Terrain Desk", skill: "Rescue Boat", status: "checked-in", shift: "Day", lastCheckIn: "09:01" },
    { id: "VOL-4", name: "Meera Rao", region: "National Control", skill: "Comms", status: "standby", shift: "Swing", lastCheckIn: "10:16" }
  ],
  escalationMatrix: [
    { level: "critical", notify: "Admin command, district lead, medical desk, NGO partner", sla: "5 minutes", owner: "National Control" },
    { level: "high", notify: "Regional lead, logistics desk, shelter desk", sla: "15 minutes", owner: "Regional Command" },
    { level: "medium", notify: "Assigned team lead and support desk", sla: "30 minutes", owner: "Ops Desk" },
    { level: "low", notify: "Assigned queue owner only", sla: "60 minutes", owner: "Backoffice" }
  ],
  attachments: [
    { id: "ATT-1", incidentId: "INC-201", name: "riverbank-photo-1.jpg", type: "Photo", uploadedBy: "Central Food Cell", time: "08:40" },
    { id: "ATT-2", incidentId: "INC-202", name: "landslide-assessment.pdf", type: "PDF", uploadedBy: "Mountain Response Cell", time: "09:18" },
    { id: "ATT-3", incidentId: "INC-203", name: "shelter-stock-sheet.xlsx", type: "Sheet", uploadedBy: "Coastal Logistics Team", time: "10:07" }
  ],
  handoverNotes: [
    { id: "HN-1", role: "rescue", author: "Aarav Nair", note: "Watch the Rishikesh bypass after 18:00, slope is still shifting.", time: "09:55" },
    { id: "HN-2", role: "ngo", author: "Shreyasi", note: "Puri camp needs another hygiene shipment before sunset.", time: "10:22" },
    { id: "HN-3", role: "admin", author: "Shubham", note: "Approve comm-unit request if Guwahati waterline crosses 2.4m.", time: "10:48" }
  ],
  adminUsers: [
    { id: "USR-1", username: "Shubham", email: "shubham@gmail.com", role: "admin", status: "active", lastSeen: "2m ago", region: "National Control" },
    { id: "USR-2", username: "Shreyasi", email: "shreyasi@gmail.com", role: "ngo", status: "active", lastSeen: "5m ago", region: "East Relief Cluster" },
    { id: "USR-3", username: "Aarav Nair", email: "aarav.nair@rescuenexus.in", role: "rescue", status: "active", lastSeen: "3m ago", region: "South Field Unit" },
    { id: "USR-4", username: "Kavya Das", email: "kavya.das@rescuenexus.in", role: "rescue", status: "standby", lastSeen: "1h ago", region: "North Terrain Desk" },
    { id: "USR-5", username: "Rohan Singh", email: "rohan.singh@rescuenexus.in", role: "rescue", status: "suspended", lastSeen: "yesterday", region: "West Logistics Route" }
  ],
  sessionActivity: [
    { id: "SES-1", actor: "Shubham", action: "Logged in from command console", device: "Chrome / macOS", time: "08:14" },
    { id: "SES-2", actor: "Shreyasi", action: "Saved profile and notification settings", device: "Chrome / Windows", time: "09:08" },
    { id: "SES-3", actor: "Aarav Nair", action: "Submitted shift handover note", device: "Field tablet", time: "10:05" }
  ],
  profileByEmail: {
    "shubham@gmail.com": { phone: "+91 98765 44338", region: "National Control", team: "Admin Command", passwordHint: "123456", notifications: true, darkMode: true, language: "en" },
    "shreyasi@gmail.com": { phone: "+91 98455 22019", region: "East Relief Cluster", team: "NGO Coordination", passwordHint: "123456", notifications: true, darkMode: true, language: "en" },
    "aarav.nair@rescuenexus.in": { phone: "+91 98004 11021", region: "South Field Unit", team: "River Rescue Unit 12", passwordHint: "123456", notifications: true, darkMode: false, language: "en" }
  }
};

const ROLE_CONFIG = {
  admin: { title: "Administrative command center", subtitle: "Approvals, oversight, staffing, and national response health.", focus: "You are seeing approvals, budget blockers, and cross-region readiness.", primaryAction: "Approve escalations", metricLabel: "Pending approvals", heroStats: [{ value: "12", label: "Approvals queued" }, { value: "91%", label: "Network readiness" }, { value: "19", label: "State cells online" }] },
  ngo: { title: "NGO coordination command", subtitle: "Shelter capacity, supply needs, and partner network coverage.", focus: "You are seeing partner requests, delivery gaps, and shelter pressure.", primaryAction: "Coordinate supplies", metricLabel: "Open partner requests", heroStats: [{ value: "18", label: "Partner requests" }, { value: "38", label: "Deliveries moving" }, { value: "72%", label: "Shelter coverage" }] },
  rescue: { title: "Field rescue operations", subtitle: "Assignments, route updates, blocked roads, and deployment urgency.", focus: "You are seeing incident priorities, route blockers, and team handoffs.", primaryAction: "Take field action", metricLabel: "Assigned incidents", heroStats: [{ value: "7", label: "Assigned missions" }, { value: "4", label: "Blocked corridors" }, { value: "42m", label: "Avg dispatch ETA" }] }
};

const CITY_COORDS = {
  Delhi: { x: 244, y: 182, type: "hub" },
  Jaipur: { x: 171, y: 204, type: "hub" },
  Patna: { x: 333, y: 184, type: "hub" },
  Guwahati: { x: 379, y: 144, type: "incident" },
  Mumbai: { x: 150, y: 298, type: "hub" },
  Bengaluru: { x: 272, y: 389, type: "shelter" },
  Chennai: { x: 350, y: 446, type: "drop" },
  Kochi: { x: 250, y: 463, type: "incident" },
  Rishikesh: { x: 230, y: 168, type: "blocked" },
  Puri: { x: 343, y: 309, type: "shelter" }
};

const DELIVERY_STEPS = [
  { label: "Claimed", icon: "📦" },
  { label: "In Transit", icon: "🚚" },
  { label: "Delivered", icon: "☑" },
  { label: "Confirmed", icon: "✓" }
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStoredSessionUser() {
  const raw = window.sessionStorage.getItem(STORAGE_KEYS.sessionUser);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function guardDashboard() {
  const activeUser = getStoredSessionUser();
  if (!activeUser) {
    window.location.href = "index.html";
    return null;
  }
  return activeUser;
}

function getAppState() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.appState);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(DEFAULT_STATE));
    return deepClone(DEFAULT_STATE);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...deepClone(DEFAULT_STATE),
      ...parsed,
      profileByEmail: { ...DEFAULT_STATE.profileByEmail, ...(parsed.profileByEmail || {}) }
    };
  } catch (_error) {
    window.localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(DEFAULT_STATE));
    return deepClone(DEFAULT_STATE);
  }
}

function saveAppState(state) {
  window.localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(state));
}

function getProfile(user, state) {
  return state.profileByEmail[user.email] || {
    phone: "+91 90000 00000",
    region: user.region || "Unassigned",
    team: user.team || user.username,
    passwordHint: "123456",
    notifications: true,
    darkMode: false,
    language: state.language || "en"
  };
}

function getLanguage(user, state) {
  return getProfile(user, state).language || state.language || "en";
}

function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.rescue;
}

function getVisibleIncidents(role, state) {
  return role === "admin" ? state.incidents : state.incidents.filter((item) => item.assignedRole === role || item.owner.toLowerCase().includes(role));
}

function getVisibleNotifications(role, state) {
  return state.notifications.filter((item) => item.audience.includes(role) || (role === "admin" && item.audience.includes("admin")));
}

function getVisibleDeliveries(role, state) {
  if (role === "admin") return state.deliveries;
  if (role === "ngo") return state.deliveries.filter((item) => ["Food", "Shelter", "Water", "Clothing"].includes(item.category));
  return state.deliveries.filter((item) => ["Shelter", "Medical", "Food", "Water"].includes(item.category) || item.priority === "Critical");
}

function getVisibleWeather(role, state) {
  if (role === "admin") return state.weather;
  const incidents = getVisibleIncidents(role, state);
  const districts = new Set(incidents.map((item) => item.district));
  return state.weather.filter((item) => districts.has(item.district));
}

function getVisibleShelters(role, state) {
  if (role === "admin") return state.shelters;
  const incidents = getVisibleIncidents(role, state);
  const states = new Set(incidents.map((item) => item.state));
  return state.shelters.filter((item) => states.has(item.state));
}

function getVisibleAttachments(role, state) {
  const incidents = getVisibleIncidents(role, state);
  const ids = new Set(incidents.map((item) => item.id));
  return state.attachments.filter((item) => ids.has(item.incidentId));
}

function getVisibleHandover(role, state) {
  return state.handoverNotes.filter((item) => item.role === role || role === "admin");
}

function computeMetrics(incidents, deliveries, notifications, role) {
  const openCount = incidents.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
  const criticalCount = incidents.filter((item) => item.severity === "critical").length;
  const unresolvedDeliveries = deliveries.filter((item) => item.status !== "Delivered").length;
  const unreadCount = notifications.filter((item) => item.unread).length;
  return { openCount, criticalCount, unresolvedDeliveries, unreadCount, roleLabel: getRoleConfig(role).metricLabel };
}

function formatTime(value) {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  } catch (_error) {
    return value;
  }
}

function updateText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderSkeleton(container, count, className) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(() => `<div class="${className} skeleton-card"><span class="skeleton-line"></span><span class="skeleton-line short"></span></div>`).join("");
}

function showToast(message, type = "info") {
  if (!toastRegion) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("toast-leave");
    window.setTimeout(() => toast.remove(), 240);
  }, 2600);
}

function applyLanguageChrome(language, user) {
  const labels = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.en;
  document.documentElement.lang = language === "hi" ? "hi" : "en";
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    const href = link.getAttribute("href");
    const labelSpan = link.querySelectorAll("span")[1];
    if (!labelSpan) return;
    const key = href ? href.replace(".html", "") : "";
    if (labels[key]) labelSpan.textContent = labels[key];
  });
  if (logoutButton) logoutButton.textContent = labels.logout;
  if (pageSubtitle) pageSubtitle.textContent = (PAGE_SUBTITLES[PAGE] || PAGE_SUBTITLES.dashboard)[language] || (PAGE_SUBTITLES[PAGE] || PAGE_SUBTITLES.dashboard).en;
  const demoBanner = document.getElementById("demoBanner");
  if (demoBanner && user) demoBanner.textContent = labels.demoBanner(user.role);
}

function renderUsers(users) {
  const userList = document.getElementById("userList");
  if (!userList) return;
  if (!users.length) {
    userList.innerHTML = '<li class="empty-state panel-empty">No registered responders yet.</li>';
    return;
  }
  userList.innerHTML = users.map((user) => `
    <li>
      <div>
        <strong>${escapeHtml(user.username)}</strong>
        <span>${escapeHtml(user.email)}</span>
      </div>
      <span class="badge subtle">${escapeHtml(user.role || "active")}</span>
    </li>`).join("");
}

function renderResponderDirectory() {
  const search = document.getElementById("userSearch")?.value.trim().toLowerCase() || "";
  const region = document.getElementById("userRegionFilter")?.value || "all";
  const filtered = responderDirectory.filter((user) => {
    const haystack = [user.username, user.email, user.region || "", user.team || ""].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (region === "all" || (user.region || "Unassigned") === region);
  });
  renderUsers(filtered);
}

function renderMissions(incidents) {
  const missionFeed = document.getElementById("missionFeed");
  if (!missionFeed) return;
  if (!incidents.length) {
    missionFeed.innerHTML = '<article class="empty-state panel-empty">No active missions for this role right now.</article>';
    return;
  }
  missionFeed.innerHTML = incidents.map((incident) => `
    <article class="feed-item">
      <div class="feed-copy">
        <p>${escapeHtml(incident.state)}</p>
        <h4>${escapeHtml(incident.title)}</h4>
        <span>${escapeHtml(incident.assignedTeam)}</span>
      </div>
      <div class="feed-meta">
        <span class="badge severity-${escapeHtml(incident.severity)}">${escapeHtml(incident.status)}</span>
        <strong>${escapeHtml(String(incident.eta))} min</strong>
      </div>
    </article>`).join("");
}

function renderTasks(items) {
  const taskBoardList = document.getElementById("taskBoardList");
  if (!taskBoardList) return;
  if (!items.length) {
    taskBoardList.innerHTML = '<article class="empty-state panel-empty">No incidents match the current filters.</article>';
    return;
  }
  taskBoardList.innerHTML = items.map((incident) => `
    <article class="task-item incident-task" data-incident-id="${escapeHtml(incident.id)}">
      <div>
        <p>${escapeHtml(incident.owner)} · ${escapeHtml(incident.location)}</p>
        <h4>${escapeHtml(incident.title)}</h4>
        <span class="task-summary">${escapeHtml(incident.summary)}</span>
        <div class="task-tags-row">
          <span class="badge severity-${escapeHtml(incident.severity)}">${escapeHtml(incident.priority)}</span>
          <span class="badge subtle">${escapeHtml(incident.category)}</span>
          <span class="badge subtle">${escapeHtml(incident.status)}</span>
        </div>
        <small class="meta-note">Last updated by ${escapeHtml(incident.updatedBy)} · ${escapeHtml(formatTime(incident.updatedAt))}</small>
      </div>
      <div class="task-meta">
        <strong>${escapeHtml(String(incident.progress))}%</strong>
        <span>${escapeHtml(incident.assignedTeam)}</span>
        <div class="task-actions-inline action-stack">
          <button class="button secondary button-small" type="button" data-action="advance-incident" data-id="${escapeHtml(incident.id)}">Advance</button>
          <button class="button secondary button-small" type="button" data-action="assign-team" data-id="${escapeHtml(incident.id)}">Assign Team</button>
          <button class="button secondary button-small" type="button" data-action="escalate-incident" data-id="${escapeHtml(incident.id)}">Escalate</button>
          <button class="button secondary button-small" type="button" data-action="request-supplies" data-id="${escapeHtml(incident.id)}">Request Supplies</button>
          <button class="button secondary button-small" type="button" data-action="close-incident" data-id="${escapeHtml(incident.id)}">Close</button>
        </div>
      </div>
    </article>`).join("");
}

function renderTimeline(items) {
  const timelineList = document.getElementById("timelineList");
  if (!timelineList) return;
  timelineList.innerHTML = items.length ? items.map((item) => `
    <article class="timeline-item">
      <span class="timeline-time">${escapeHtml(item.time)}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.note)}</p>
      </div>
    </article>`).join("") : '<article class="empty-state panel-empty">No timeline events recorded yet.</article>';
}

function renderNotifications(items) {
  const notificationList = document.getElementById("notificationList");
  const badge = document.getElementById("notificationCounter");
  const unread = items.filter((item) => item.unread).length;
  if (badge) badge.textContent = `${unread} New`;
  const navBadge = document.getElementById("navNotificationCount");
  if (navBadge) navBadge.textContent = String(unread);
  if (!notificationList) return;
  notificationList.innerHTML = items.length ? items.map((item) => `
    <article class="notification-item ${item.unread ? "is-unread" : ""}">
      <div class="notification-topline">
        <span class="badge severity-${escapeHtml(item.level.toLowerCase())}">${escapeHtml(item.level)}</span>
        <span class="notification-time">${escapeHtml(item.time)}</span>
      </div>
      <p>${escapeHtml(item.text)}</p>
      <div class="notification-actions-row">
        <button class="button secondary button-small" type="button" data-action="mark-notification" data-id="${escapeHtml(item.id)}">Mark read</button>
      </div>
    </article>`).join("") : '<article class="empty-state panel-empty">No alerts for this role.</article>';
}

function renderDeliveryBoard(items) {
  const deliveryBoard = document.getElementById("deliveryBoard");
  if (!deliveryBoard) return;
  if (!items.length) {
    deliveryBoard.innerHTML = '<article class="empty-state panel-empty">No deliveries assigned to this role.</article>';
    return;
  }
  deliveryBoard.innerHTML = items.map((item) => {
    const progressMarkup = DELIVERY_STEPS.map((step, index) => {
      const stateClass = index < item.activeStep ? "done" : index === item.activeStep ? "active" : "";
      const connectorClass = index < item.activeStep ? "done" : "";
      return `<div class="delivery-step-wrap"><div class="delivery-step ${stateClass}"><span>${step.icon}</span></div><strong class="delivery-step-label ${stateClass}">${step.label}</strong>${index < DELIVERY_STEPS.length - 1 ? `<div class="delivery-connector ${connectorClass}"></div>` : ""}</div>`;
    }).join("");
    const statusClass = item.status.toLowerCase().replace(/\s+/g, "-");
    return `
      <article class="delivery-card">
        <div class="delivery-card-top">
          <div class="delivery-id-group">
            <span class="delivery-code">${escapeHtml(item.code)}</span>
            <span class="delivery-status ${statusClass}">${escapeHtml(item.status)}</span>
          </div>
          <span class="delivery-category">${escapeHtml(item.categoryIcon)} ${escapeHtml(item.category)}</span>
        </div>
        <h3 class="delivery-title">${escapeHtml(item.title)}</h3>
        <div class="delivery-meta-grid">
          <span>📍 ${escapeHtml(item.location)}</span>
          <span>🏢 ${escapeHtml(item.ngo)}</span>
          <span>👤 ${escapeHtml(item.assignee)}</span>
          <span>⏱ ${escapeHtml(item.eta)}</span>
        </div>
        <div class="delivery-info-row">
          <div class="delivery-info-chip"><small>Claimed By</small><strong>${escapeHtml(item.claimedBy)}</strong></div>
          <div class="delivery-info-chip"><small>Assigned NGO</small><strong>${escapeHtml(item.ngo)}</strong></div>
          <div class="delivery-info-chip"><small>Delivery Type</small><strong>${escapeHtml(item.type)}</strong></div>
        </div>
        <small class="meta-note">Last updated by ${escapeHtml(item.updatedBy)} · ${escapeHtml(formatTime(item.updatedAt))}</small>
        <div class="delivery-progress">${progressMarkup}</div>
      </article>`;
  }).join("");
}

function renderAudit(items) {
  const auditList = document.getElementById("auditList");
  if (!auditList) return;
  auditList.innerHTML = items.length ? items.map((item) => `
    <article class="timeline-item audit-item"><span class="timeline-time">${escapeHtml(item.time)}</span><div><strong>${escapeHtml(item.actor)}</strong><p>${escapeHtml(item.action)} · ${escapeHtml(item.target)}</p></div></article>`).join("") : '<article class="empty-state panel-empty">No audit history yet.</article>';
}

function renderMapSignals(incidents) {
  const mapSignals = document.getElementById("mapSignals");
  const mapPins = document.getElementById("mapPins");
  if (mapSignals) {
    mapSignals.innerHTML = incidents.length ? incidents.map((incident) => `
      <article class="signal-card severity-${escapeHtml(incident.severity)}"><div><strong>${escapeHtml(incident.title)}</strong><span>${escapeHtml(incident.location)}</span></div><p>${escapeHtml(incident.blockedRoute)}</p></article>`).join("") : '<article class="empty-state panel-empty">No mapped incidents available.</article>';
  }
  if (!mapPins) return;
  mapPins.innerHTML = Object.entries(CITY_COORDS).map(([city, coords]) => `<g class="map-pin ${coords.type || "hub"}"><circle cx="${coords.x}" cy="${coords.y}" r="9"></circle><text x="${coords.x + 12}" y="${coords.y - 10}">${escapeHtml(city)}</text></g>`).join("");
}

function renderWeatherBoard(items) {
  const weatherBoard = document.getElementById("weatherBoard");
  if (!weatherBoard) return;
  updateText("weatherRiskSummary", items.length ? `${items.filter((item) => item.risk === "critical").length} critical zones` : "No zones");
  weatherBoard.innerHTML = items.length ? items.map((item) => `
    <article class="weather-card risk-${escapeHtml(item.risk)}"><div class="weather-card-top"><strong>${escapeHtml(item.district)}</strong><span>${escapeHtml(item.condition)}</span></div><div class="weather-stats"><span>${escapeHtml(String(item.rainMm))}mm rain</span><span>${escapeHtml(String(item.wind))}km/h wind</span><span>${escapeHtml(String(item.temp))}°C</span></div><p>${escapeHtml(item.advisory)}</p></article>`).join("") : '<article class="empty-state panel-empty">No weather overlay data for this role.</article>';
}

function renderShelterBoard(items) {
  const shelterBoard = document.getElementById("shelterBoard");
  if (!shelterBoard) return;
  shelterBoard.innerHTML = items.length ? items.map((item) => {
    const occupancy = Math.round((item.occupancy / item.capacity) * 100);
    return `<article class="shelter-card"><div class="card-topline compact-topline"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.district)}, ${escapeHtml(item.state)}</span></div><span class="badge ${occupancy > 85 ? "severity-critical" : occupancy > 70 ? "severity-high" : "severity-medium"}">${occupancy}% occupied</span></div><div class="shelter-metrics"><div><small>Supplies</small><strong>${escapeHtml(String(item.supplies))}%</strong></div><div><small>Medical</small><strong>${escapeHtml(String(item.medical))}%</strong></div><div><small>Open beds</small><strong>${escapeHtml(String(item.bedsOpen))}</strong></div></div><small class="meta-note">Updated ${escapeHtml(formatTime(item.updatedAt))}</small></article>`;
  }).join("") : '<article class="empty-state panel-empty">No shelter records available.</article>';
}

function renderVolunteerBoard(items) {
  const volunteerBoard = document.getElementById("volunteerBoard");
  if (!volunteerBoard) return;
  volunteerBoard.innerHTML = items.length ? items.map((item) => `
    <article class="volunteer-card"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.region)} · ${escapeHtml(item.skill)}</span></div><div class="volunteer-actions"><span class="badge subtle">${escapeHtml(item.status)}</span><button class="button secondary button-small" type="button" data-action="toggle-volunteer" data-id="${escapeHtml(item.id)}">${item.status === "checked-in" ? "Check out" : "Check in"}</button></div><small class="meta-note">Shift ${escapeHtml(item.shift)} · Last check ${escapeHtml(item.lastCheckIn)}</small></article>`).join("") : '<article class="empty-state panel-empty">No volunteers visible for this role.</article>';
}

function renderHeatmapBoard(items) {
  const heatmapBoard = document.getElementById("heatmapBoard");
  if (!heatmapBoard) return;
  const counts = Object.values(items.reduce((acc, incident) => {
    const existing = acc[incident.district] || { district: incident.district, incidents: 0, critical: 0 };
    existing.incidents += 1;
    if (incident.severity === "critical") existing.critical += 1;
    acc[incident.district] = existing;
    return acc;
  }, {})).sort((a, b) => (b.critical * 10 + b.incidents) - (a.critical * 10 + a.incidents));
  heatmapBoard.innerHTML = counts.length ? counts.map((item) => `
    <article class="heat-row"><div><strong>${escapeHtml(item.district)}</strong><span>${escapeHtml(String(item.incidents))} incidents</span></div><div class="heat-visual"><span style="width:${Math.min(100, item.incidents * 24 + item.critical * 18)}%"></span></div><small>${escapeHtml(String(item.critical))} critical</small></article>`).join("") : '<article class="empty-state panel-empty">No district heatmap data yet.</article>';
}

function renderEscalationBoard(items) {
  const escalationBoard = document.getElementById("escalationBoard");
  if (!escalationBoard) return;
  escalationBoard.innerHTML = items.map((item) => `
    <article class="matrix-card"><div class="card-topline compact-topline"><strong>${escapeHtml(item.level.toUpperCase())}</strong><span>${escapeHtml(item.sla)}</span></div><p>${escapeHtml(item.notify)}</p><small class="meta-note">Owner: ${escapeHtml(item.owner)}</small></article>`).join("");
}

function renderAttachmentGallery(items) {
  const attachmentGallery = document.getElementById("attachmentGallery");
  if (!attachmentGallery) return;
  attachmentGallery.innerHTML = items.length ? items.map((item) => `
    <article class="attachment-card"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)} · ${escapeHtml(item.incidentId)}</span><small class="meta-note">Uploaded by ${escapeHtml(item.uploadedBy)} · ${escapeHtml(item.time)}</small></article>`).join("") : '<article class="empty-state panel-empty">No attachments uploaded yet.</article>';
}

function renderHandoverNotes(items) {
  const handoverList = document.getElementById("handoverList");
  if (!handoverList) return;
  handoverList.innerHTML = items.length ? items.map((item) => `
    <article class="timeline-item"><span class="timeline-time">${escapeHtml(item.time)}</span><div><strong>${escapeHtml(item.author)}</strong><p>${escapeHtml(item.note)}</p></div></article>`).join("") : '<article class="empty-state panel-empty">No handover notes yet.</article>';
}

function renderAdminUsers(user, state) {
  const adminUserBoard = document.getElementById("adminUserBoard");
  if (!adminUserBoard) return;
  if (user.role !== "admin") {
    adminUserBoard.innerHTML = '<article class="empty-state panel-empty">This workspace is only editable for admin users.</article>';
    return;
  }
  const search = document.getElementById("adminUserSearch")?.value.trim().toLowerCase() || "";
  const roleFilter = document.getElementById("adminRoleFilter")?.value || "all";
  const statusFilter = document.getElementById("adminStatusFilter")?.value || "all";
  const users = state.adminUsers.filter((item) => {
    const haystack = [item.username, item.email, item.region].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (roleFilter === "all" || item.role === roleFilter) && (statusFilter === "all" || item.status === statusFilter);
  });
  updateText("adminActiveCount", String(state.adminUsers.filter((item) => item.status === "active").length));
  updateText("adminRoleCount", String(state.adminUsers.filter((item) => item.role === "admin").length));
  updateText("adminSuspendedCount", String(state.adminUsers.filter((item) => item.status === "suspended").length));
  updateText("adminSessionCount", String(state.sessionActivity.length));
  adminUserBoard.innerHTML = users.map((item) => `
    <article class="admin-user-card"><div><strong>${escapeHtml(item.username)}</strong><span>${escapeHtml(item.email)} · ${escapeHtml(item.region)}</span></div><div class="admin-user-controls"><span class="badge subtle">${escapeHtml(item.status)}</span><button class="button secondary button-small" type="button" data-action="cycle-role" data-id="${escapeHtml(item.id)}">Role: ${escapeHtml(item.role)}</button><button class="button secondary button-small" type="button" data-action="cycle-user-status" data-id="${escapeHtml(item.id)}">Toggle status</button></div><small class="meta-note">Last seen ${escapeHtml(item.lastSeen)}</small></article>`).join("");
}

function renderSessionActivity(items) {
  const sessionActivityList = document.getElementById("sessionActivityList");
  if (!sessionActivityList) return;
  sessionActivityList.innerHTML = items.length ? items.map((item) => `
    <article class="timeline-item"><span class="timeline-time">${escapeHtml(item.time)}</span><div><strong>${escapeHtml(item.actor)}</strong><p>${escapeHtml(item.action)} · ${escapeHtml(item.device)}</p></div></article>`).join("") : '<article class="empty-state panel-empty">No recent session activity.</article>';
}

function renderInsights(metrics, incidents, notifications) {
  updateText("metricOpenIncidents", String(metrics.openCount));
  updateText("metricInTransit", String(metrics.unresolvedDeliveries));
  updateText("metricResolvedToday", String(Math.max(incidents.length * 3, 8)));
  updateText("metricUtilization", `${Math.min(96, 58 + incidents.length * 8)}%`);
  updateText("heroOpenLabel", metrics.roleLabel);
  updateText("heroOpenValue", String(metrics.openCount));
  updateText("heroUrgentValue", String(metrics.criticalCount || notifications.length));
  updateText("heroUrgentLabel", "Urgent alerts");
}

function renderRoleHero(user, incidents) {
  const config = getRoleConfig(user.role);
  updateText("roleHeroTitle", config.title);
  updateText("roleHeroSubtitle", config.focus);
  updateText("pageHeadingRole", config.primaryAction);
  const heroStats = document.getElementById("heroRoleStats");
  if (heroStats) heroStats.innerHTML = config.heroStats.map((item) => `<article><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></article>`).join("");
  const situation = document.getElementById("situationList");
  if (situation) {
    const top = incidents[0];
    situation.innerHTML = top ? `<li><span>Priority Zone</span><strong>${escapeHtml(top.location)}</strong></li><li><span>Lead Team</span><strong>${escapeHtml(top.assignedTeam)}</strong></li><li><span>Latest Update</span><strong>${escapeHtml(top.status)}</strong></li>` : '<li><span>Readiness</span><strong>No live incidents assigned</strong></li>';
  }
}

function renderSearchableTaskBoard(user, state) {
  const incidents = getVisibleIncidents(user.role, state);
  const search = document.getElementById("taskSearch")?.value.trim().toLowerCase() || "";
  const severity = document.getElementById("taskSeverityFilter")?.value || "all";
  const status = document.getElementById("taskStatusFilter")?.value || "all";
  const filtered = incidents.filter((incident) => {
    const haystack = [incident.title, incident.location, incident.owner, incident.assignedTeam, incident.category, incident.district].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (severity === "all" || incident.severity === severity) && (status === "all" || incident.status === status);
  });
  renderTasks(filtered);
  updateText("taskResultsCount", `${filtered.length} matching incidents`);
}

function renderNotificationFilters(user, state) {
  const search = document.getElementById("notificationSearch")?.value.trim().toLowerCase() || "";
  const level = document.getElementById("notificationLevelFilter")?.value || "all";
  const filtered = getVisibleNotifications(user.role, state).filter((item) => (!search || item.text.toLowerCase().includes(search)) && (level === "all" || item.level.toLowerCase() === level));
  renderNotifications(filtered);
  renderAudit(state.audit.slice(0, 6));
}

function renderDeliveryFilters(user, state) {
  const search = document.getElementById("deliverySearch")?.value.trim().toLowerCase() || "";
  const status = document.getElementById("deliveryStatusFilter")?.value || "all";
  const filtered = getVisibleDeliveries(user.role, state).filter((item) => (!search || [item.title, item.location, item.ngo, item.category].join(" ").toLowerCase().includes(search)) && (status === "all" || item.status === status));
  renderDeliveryBoard(filtered);
  updateText("deliveryResultsCount", `${filtered.length} visible relief orders`);
}

function renderAnalytics(user, state) {
  const incidents = getVisibleIncidents(user.role, state);
  const metrics = computeMetrics(incidents, getVisibleDeliveries(user.role, state), getVisibleNotifications(user.role, state), user.role);
  updateText("analyticsSummary", `${metrics.openCount} open incidents, ${metrics.criticalCount} critical, ${metrics.unreadCount} unread alerts.`);
  const capacity = document.getElementById("capacityList");
  if (capacity) {
    const values = [
      { label: "Medical kits", value: `${Math.min(96, 60 + incidents.length * 4)}%` },
      { label: "Inflatable boats", value: `${Math.max(42, 74 - incidents.length * 2)}%` },
      { label: "Temporary shelters", value: `${Math.min(97, 68 + metrics.openCount * 3)}%` },
      { label: "Satellite comm units", value: `${Math.max(38, 80 - metrics.criticalCount * 8)}%` }
    ];
    capacity.innerHTML = values.map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("");
  }
  const trendCaption = document.getElementById("trendCaption");
  if (trendCaption) trendCaption.textContent = user.role === "admin" ? "Approvals peak mid-week as multi-state escalations come in." : user.role === "ngo" ? "Supply coordination grows before weekend shelter pushes." : "Field deployments spike when blocked corridors overlap with weather alerts.";
}

function renderProfile(user, state) {
  const profile = getProfile(user, state);
  updateText("profileName", user.username);
  updateText("profileRole", user.role);
  updateText("profileEmail", user.email);
  updateText("profileRegion", profile.region);
  updateText("profileTeam", profile.team);
  const form = document.getElementById("profileForm");
  if (form) {
    form.elements.namedItem("fullName").value = user.username;
    form.elements.namedItem("phone").value = profile.phone;
    form.elements.namedItem("region").value = profile.region;
    form.elements.namedItem("team").value = profile.team;
    form.elements.namedItem("passwordHint").value = profile.passwordHint;
    form.elements.namedItem("notificationsEnabled").checked = Boolean(profile.notifications);
    if (form.elements.namedItem("language")) form.elements.namedItem("language").value = profile.language || state.language || "en";
  }
}

function loadUsers(state) {
  responderDirectory = DEFAULT_USERS.map((user) => {
    const profile = state.profileByEmail[user.email] || {};
    return { ...user, role: user.role || profile.role || "rescue", region: profile.region || user.region || "Unassigned", team: profile.team || user.team || "Field unit" };
  });
  renderResponderDirectory();
}

function pushAudit(state, actor, action, target) {
  state.audit.unshift({ id: `AUD-${Date.now()}`, actor, action, target, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
}

function pushTimeline(state, title, note) {
  state.timeline.unshift({ time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), title, note });
}

function pushNotification(state, payload) {
  state.notifications.unshift({ id: `NTF-${Date.now()}`, unread: true, time: "just now", ...payload });
}

function pushSession(state, actor, action, device = "Command Console") {
  state.sessionActivity.unshift({ id: `SES-${Date.now()}`, actor, action, device, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
}

function advanceIncident(state, incidentId, user) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return false;
  if (incident.status === "Open") {
    incident.status = "In Progress";
    incident.progress = Math.min(incident.progress + 25, 85);
  } else if (incident.status === "In Progress") {
    incident.status = "Resolved";
    incident.progress = 100;
  } else if (incident.status === "Awaiting Approval") {
    incident.status = "In Progress";
    incident.progress = 48;
  }
  incident.updatedAt = new Date().toISOString();
  incident.updatedBy = user.username;
  pushAudit(state, user.username, `Advanced incident to ${incident.status}`, incident.id);
  pushTimeline(state, `${incident.id} moved forward`, `${incident.title} is now ${incident.status.toLowerCase()}.`);
  pushNotification(state, { level: "Update", text: `${incident.id} moved to ${incident.status.toLowerCase()} by ${user.username}.`, audience: ["admin", incident.assignedRole], type: "progress" });
  return true;
}

function closeIncident(state, incidentId, user) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return false;
  incident.status = "Resolved";
  incident.progress = 100;
  incident.updatedAt = new Date().toISOString();
  incident.updatedBy = user.username;
  pushAudit(state, user.username, "Closed incident", incident.id);
  pushTimeline(state, `${incident.id} closed`, `${incident.title} was closed by ${user.username}.`);
  return true;
}

function assignTeam(state, incidentId, user) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return false;
  const roleMap = { admin: "Admin Command", ngo: "NGO Relief Cell", rescue: "Rapid Rescue Unit" };
  incident.assignedTeam = `${roleMap[user.role]} ${Math.floor(Math.random() * 9) + 1}`;
  incident.updatedAt = new Date().toISOString();
  incident.updatedBy = user.username;
  pushAudit(state, user.username, "Reassigned incident team", incident.id);
  pushNotification(state, { level: "Update", text: `${incident.id} reassigned to ${incident.assignedTeam}.`, audience: ["admin", incident.assignedRole], type: "assignment" });
  return true;
}

function escalateIncident(state, incidentId, user) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return false;
  incident.severity = "critical";
  incident.priority = "High";
  incident.updatedAt = new Date().toISOString();
  incident.updatedBy = user.username;
  pushAudit(state, user.username, "Escalated incident", incident.id);
  pushNotification(state, { level: "Critical", text: `${incident.id} escalated by ${user.username}.`, audience: ["admin", incident.assignedRole], type: "escalation" });
  return true;
}

function requestSupplies(state, incidentId, user) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return false;
  pushAudit(state, user.username, "Requested additional supplies", incident.id);
  pushTimeline(state, `Supply request for ${incident.id}`, `${incident.shelterNeed} seats and ${incident.category.toLowerCase()} support requested.`);
  pushNotification(state, { level: "Approval", text: `Supply request raised for ${incident.id}.`, audience: ["admin", "ngo"], type: "supply" });
  return true;
}

function toggleVolunteer(state, volunteerId, user) {
  const volunteer = state.volunteers.find((item) => item.id === volunteerId);
  if (!volunteer) return false;
  volunteer.status = volunteer.status === "checked-in" ? "checked-out" : "checked-in";
  volunteer.lastCheckIn = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  pushAudit(state, user.username, `${volunteer.status === "checked-in" ? "Checked in" : "Checked out"} volunteer`, volunteer.id);
  pushSession(state, user.username, `${volunteer.name} marked ${volunteer.status}`);
  return true;
}

function addHandover(state, user, note) {
  state.handoverNotes.unshift({ id: `HN-${Date.now()}`, role: user.role, author: user.username, note, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  pushSession(state, user.username, "Submitted shift handover note");
}

function cycleRole(state, userId, actor) {
  const user = state.adminUsers.find((item) => item.id === userId);
  if (!user) return false;
  const roles = ["rescue", "ngo", "admin"];
  user.role = roles[(roles.indexOf(user.role) + 1) % roles.length];
  pushAudit(state, actor.username, `Changed role to ${user.role}`, user.email);
  return true;
}

function cycleUserStatus(state, userId, actor) {
  const user = state.adminUsers.find((item) => item.id === userId);
  if (!user) return false;
  const statuses = ["active", "standby", "suspended"];
  user.status = statuses[(statuses.indexOf(user.status) + 1) % statuses.length];
  pushAudit(state, actor.username, `Changed account status to ${user.status}`, user.email);
  return true;
}

function appendIncident(state, user, formData, fileName) {
  const nextIncident = {
    id: `INC-${Math.floor(300 + Math.random() * 600)}`,
    title: formData.get("title"),
    location: formData.get("location"),
    state: formData.get("state"),
    district: String(formData.get("location")).split(",").pop()?.trim() || formData.get("state"),
    severity: formData.get("severity"),
    category: formData.get("category"),
    owner: formData.get("owner"),
    assignedRole: formData.get("assignedRole"),
    assignedTeam: formData.get("assignedTeam"),
    status: "Open",
    priority: formData.get("severity") === "critical" ? "High" : "Medium",
    progress: 14,
    eta: Number(formData.get("eta") || 30),
    reportCount: 1,
    shelterNeed: Number(formData.get("shelterNeed") || 20),
    summary: formData.get("summary"),
    blockedRoute: formData.get("blockedRoute"),
    hub: formData.get("hub"),
    evidenceName: fileName || "No attachment",
    updatedAt: new Date().toISOString(),
    updatedBy: user.username
  };
  state.incidents.unshift(nextIncident);
  if (fileName) {
    state.attachments.unshift({ id: `ATT-${Date.now()}`, incidentId: nextIncident.id, name: fileName, type: fileName.split(".").pop()?.toUpperCase() || "File", uploadedBy: user.username, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  }
  pushTimeline(state, `Incident ${nextIncident.id} created`, `${nextIncident.assignedTeam} now owns ${nextIncident.title}.`);
  pushAudit(state, user.username, "Created incident", nextIncident.id);
  pushNotification(state, { level: nextIncident.severity === "critical" ? "Critical" : "Update", text: `${nextIncident.title} created for ${nextIncident.location}.`, audience: ["admin", nextIncident.assignedRole], type: "incident" });
}

function exportData(data, fileName) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printSection(title, rows) {
  const printable = window.open("", "_blank", "width=900,height=700");
  if (!printable) return;
  printable.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h1{margin-top:0;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #ccc;padding:8px;text-align:left;}</style></head><body><h1>${escapeHtml(title)}</h1><table>${rows}</table></body></html>`);
  printable.document.close();
  printable.focus();
  printable.print();
}

function handleExport(state, kind) {
  if (kind === "incidents") {
    const header = "id,title,state,district,status,priority,team,last_updated_by\n";
    const rows = state.incidents.map((item) => [item.id, item.title, item.state, item.district, item.status, item.priority, item.assignedTeam, item.updatedBy].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    exportData(header + rows, "rescue-incidents.csv");
  }
  if (kind === "deliveries") {
    const header = "code,title,location,status,ngo,assignee,last_updated_by\n";
    const rows = state.deliveries.map((item) => [item.code, item.title, item.location, item.status, item.ngo, item.assignee, item.updatedBy].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    exportData(header + rows, "rescue-deliveries.csv");
  }
  if (kind === "users") {
    const header = "name,email,role,status,region,last_seen\n";
    const rows = state.adminUsers.map((item) => [item.username, item.email, item.role, item.status, item.region, item.lastSeen].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    exportData(header + rows, "rescue-users.csv");
  }
}

function handlePrint(state, kind) {
  if (kind === "deliveries") {
    const rows = `<tr><th>Code</th><th>Title</th><th>Status</th><th>Assignee</th></tr>${state.deliveries.map((item) => `<tr><td>${escapeHtml(item.code)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.assignee)}</td></tr>`).join("")}`;
    printSection("Delivery Export", rows);
  } else if (kind === "users") {
    const rows = `<tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>${state.adminUsers.map((item) => `<tr><td>${escapeHtml(item.username)}</td><td>${escapeHtml(item.email)}</td><td>${escapeHtml(item.role)}</td><td>${escapeHtml(item.status)}</td></tr>`).join("")}`;
    printSection("User Export", rows);
  } else {
    const rows = `<tr><th>ID</th><th>Title</th><th>Status</th><th>Assigned Team</th></tr>${state.incidents.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.assignedTeam)}</td></tr>`).join("")}`;
    printSection("Incident Export", rows);
  }
}

function bindTaskControls(user) {
  ["taskSearch", "taskSeverityFilter", "taskStatusFilter"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", () => renderSearchableTaskBoard(user, getAppState()));
    element.addEventListener("change", () => renderSearchableTaskBoard(user, getAppState()));
  });
  const fileInput = document.getElementById("incidentEvidence");
  const uploadLabel = document.getElementById("uploadPreviewName");
  if (fileInput && uploadLabel) fileInput.addEventListener("change", () => { uploadLabel.textContent = fileInput.files?.[0]?.name || "No evidence attached yet"; });
  const form = document.getElementById("incidentForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const state = getAppState();
      appendIncident(state, user, new FormData(form), fileInput?.files?.[0]?.name || "");
      saveAppState(state);
      form.reset();
      if (uploadLabel) uploadLabel.textContent = "No evidence attached yet";
      hydratePage(user);
      showToast("Incident created and routed to the matching team.", "success");
    });
  }
}

function bindNotificationControls(user) {
  ["notificationSearch", "notificationLevelFilter"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", () => renderNotificationFilters(user, getAppState()));
    element.addEventListener("change", () => renderNotificationFilters(user, getAppState()));
  });
}

function bindDeliveryControls(user) {
  ["deliverySearch", "deliveryStatusFilter"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", () => renderDeliveryFilters(user, getAppState()));
    element.addEventListener("change", () => renderDeliveryFilters(user, getAppState()));
  });
}

function bindProfileControls(user) {
  const form = document.getElementById("profileForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getAppState();
    const profile = state.profileByEmail[user.email] || {};
    const formData = new FormData(form);
    state.profileByEmail[user.email] = { ...profile, phone: formData.get("phone"), region: formData.get("region"), team: formData.get("team"), passwordHint: formData.get("passwordHint"), notifications: form.elements.namedItem("notificationsEnabled").checked, darkMode: profile.darkMode || false, language: formData.get("language") || "en" };
    state.language = formData.get("language") || state.language;
    user.username = formData.get("fullName");
    window.sessionStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(user));
    pushSession(state, user.username, "Saved profile and notification settings");
    saveAppState(state);
    hydratePage(user);
    showToast("Profile, language, and notification settings saved.", "success");
  });
}

function bindResponderControls() {
  ["userSearch", "userRegionFilter"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", renderResponderDirectory);
    element.addEventListener("change", renderResponderDirectory);
  });
}

function bindAdminControls(user) {
  ["adminUserSearch", "adminRoleFilter", "adminStatusFilter"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", () => renderAdminUsers(user, getAppState()));
    element.addEventListener("change", () => renderAdminUsers(user, getAppState()));
  });
}

function bindHandoverControls(user) {
  const form = document.getElementById("handoverForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getAppState();
    const note = document.getElementById("handoverInput")?.value.trim();
    if (!note) return;
    addHandover(state, user, note);
    saveAppState(state);
    form.reset();
    hydratePage(user);
    showToast("Handover note saved for the next shift.", "success");
  });
}

function bindGlobalActions(user) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const state = getAppState();
    const action = button.dataset.action;
    const targetId = button.dataset.id;
    if (action === "advance-incident" && targetId && advanceIncident(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("Incident moved forward in the workflow.", "success");
    }
    if (action === "close-incident" && targetId && window.confirm("Close this incident?")) {
      if (closeIncident(state, targetId, user)) { saveAppState(state); hydratePage(user); showToast("Incident closed.", "success"); }
    }
    if (action === "assign-team" && targetId && assignTeam(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("Incident reassigned to a response team.", "info");
    }
    if (action === "escalate-incident" && targetId && escalateIncident(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("Incident escalated to critical routing.", "success");
    }
    if (action === "request-supplies" && targetId && requestSupplies(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("Supply request sent to coordination desks.", "info");
    }
    if (action === "mark-notification" && targetId) {
      const item = state.notifications.find((notification) => notification.id === targetId);
      if (item) { item.unread = false; saveAppState(state); hydratePage(user); showToast("Notification marked as read.", "info"); }
    }
    if (action === "toggle-volunteer" && targetId && toggleVolunteer(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("Volunteer status updated.", "success");
    }
    if (action === "cycle-role" && targetId && cycleRole(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("User role updated.", "success");
    }
    if (action === "cycle-user-status" && targetId && cycleUserStatus(state, targetId, user)) {
      saveAppState(state); hydratePage(user); showToast("User account status updated.", "info");
    }
    if (action === "export-csv") {
      handleExport(state, button.dataset.export || "incidents");
      showToast("CSV export downloaded.", "success");
    }
    if (action === "export-pdf") {
      handlePrint(state, button.dataset.export || "dashboard");
      showToast("Print dialog opened for PDF export.", "info");
    }
    if (action === "open-handover-focus") {
      document.getElementById("handoverPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function hydratePage(user) {
  const state = getAppState();
  const incidents = getVisibleIncidents(user.role, state);
  const notifications = getVisibleNotifications(user.role, state);
  const deliveries = getVisibleDeliveries(user.role, state);
  const metrics = computeMetrics(incidents, deliveries, notifications, user.role);
  const weather = getVisibleWeather(user.role, state);
  const shelters = getVisibleShelters(user.role, state);
  const attachments = getVisibleAttachments(user.role, state);
  const handover = getVisibleHandover(user.role, state);
  const language = getLanguage(user, state);

  if (currentUserEl) currentUserEl.textContent = `${user.username} · ${user.role}`;
  applyLanguageChrome(language, user);
  renderRoleHero(user, incidents);
  renderInsights(metrics, incidents, notifications);
  renderMissions(incidents.slice(0, 4));
  renderTimeline(state.timeline.slice(0, 6));
  renderNotifications(notifications);
  renderDeliveryBoard(deliveries);
  renderAudit(state.audit.slice(0, 6));
  renderMapSignals(incidents.slice(0, 4));
  renderWeatherBoard(weather);
  renderShelterBoard(shelters);
  renderVolunteerBoard(state.volunteers);
  renderHeatmapBoard(incidents);
  renderEscalationBoard(state.escalationMatrix);
  renderAttachmentGallery(attachments);
  renderHandoverNotes(handover);
  renderAnalytics(user, state);
  renderProfile(user, state);
  renderAdminUsers(user, state);
  renderSessionActivity(state.sessionActivity.slice(0, 6));
  renderSearchableTaskBoard(user, state);
  renderNotificationFilters(user, state);
  renderDeliveryFilters(user, state);
  loadUsers(state);
}

function bootstrap() {
  const user = guardDashboard();
  if (!user) return;
  if (logoutButton) logoutButton.addEventListener("click", () => { window.sessionStorage.removeItem(STORAGE_KEYS.sessionUser); window.location.href = "index.html"; });
  renderSkeleton(document.getElementById("taskBoardList"), 3, "task-item");
  renderSkeleton(document.getElementById("notificationList"), 3, "notification-item");
  renderSkeleton(document.getElementById("timelineList"), 3, "timeline-item");
  bindTaskControls(user);
  bindNotificationControls(user);
  bindDeliveryControls(user);
  bindProfileControls(user);
  bindResponderControls();
  bindAdminControls(user);
  bindHandoverControls(user);
  bindGlobalActions(user);
  window.setTimeout(() => hydratePage(user), 220);
}

bootstrap();
