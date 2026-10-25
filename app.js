const STORAGE_KEY = "aquaWatchReports";
const TYPE_NAMES = {
  trash: "Trash / plastic",
  oil: "Oil or chemical",
  runoff: "Sewage or runoff",
  algae: "Algae bloom",
  wildlife: "Dead wildlife",
  other: "Other"
};
const PUBLIC_REPORT_EXAMPLES = [
  {
    id: "bay-view-bacteria-2025",
    type: "other",
    concern: "medium",
    date: "2025-07-14",
    location: "Bay View State Park, Washington",
    lat: 48.4886,
    lng: -122.4787,
    description: "Washington Ecology reported elevated bacteria in a July 14 sample. A contamination advisory ran July 18–24, 2025.",
    sourceLabel: "Washington Department of Ecology",
    source: "https://ecology.wa.gov/research-data/monitoring-assessment/beach-annual-report/skagit-county"
  },
  {
    id: "nye-beach-bacteria-2025",
    type: "other",
    concern: "medium",
    date: "2025-07-02",
    location: "Nye Beach, Newport, Oregon",
    lat: 44.6365,
    lng: -124.0646,
    description: "Oregon Health Authority issued an ocean-water advisory after samples showed higher-than-normal fecal bacteria. It was lifted July 9 after follow-up testing.",
    sourceLabel: "Oregon Health Authority",
    source: "https://www.oregon.gov/oha/ERD/Pages/OHA-lifts-Nye-Beach-health-advisory.aspx"
  },
  {
    id: "broad-beach-sewage-2025",
    type: "runoff",
    concern: "high",
    date: "2025-01-30",
    location: "Broad Beach, Malibu, California",
    lat: 34.0357,
    lng: -118.8562,
    description: "Los Angeles County reported an estimated 1,000–10,000 gallons of untreated sewage reaching beach sand and ocean water near Broad Beach.",
    sourceLabel: "Los Angeles County Public Health",
    source: "https://publichealth.lacounty.gov/phcommon/public/media/mediapubhpdetail.cfm?prid=4956"
  },
  {
    id: "goleta-beach-sewage-2024",
    type: "runoff",
    concern: "high",
    date: "2024-02-16",
    location: "Goleta Beach area, California",
    lat: 34.4142,
    lng: -119.8318,
    description: "A California Water Board report says over one million gallons of wastewater spilled near Goleta Beach on February 16–17, 2024, and reached coastal waters.",
    sourceLabel: "California State Water Resources Control Board",
    source: "https://water.waterboards.ca.gov/press_room/press_releases/2026/pr20260302-r3-approves-penalty-for-spill.html"
  },
  {
    id: "cabrillo-beach-sewage-2024",
    type: "runoff",
    concern: "high",
    date: "2024-02-05",
    location: "Cabrillo Beach area, San Pedro, California",
    lat: 33.7078,
    lng: -118.2823,
    description: "Los Angeles County reported that about five million gallons of sewage entered the Dominguez Channel, which ends near Cabrillo Beach.",
    sourceLabel: "Los Angeles County Public Health",
    source: "https://publichealth.lacounty.gov/phcommon/public/media/mediapubhpdetail.cfm?prid=4631"
  }
];
const TEST_USER_REPORTS = [
  { type: "trash", concern: "medium", lat: 32.5793, lng: -117.1324, description: "TEST SAMPLE: Plastic wrapper and bottle near the high-tide line." },
  { type: "oil", concern: "high", lat: 33.6553, lng: -118.0037, description: "TEST SAMPLE: A small rainbow sheen in a sheltered patch of water." },
  { type: "algae", concern: "low", lat: 36.9621, lng: -122.0244, description: "TEST SAMPLE: Green patches seen in a shallow pool near the sand." }
];
const WEST_COAST_PATH = [
  [48.38, -124.7], [46.25, -124.1], [44.6, -124.0], [42.0, -124.2], [40.4, -124.4],
  [38.0, -123.0], [37.0, -122.0], [35.3, -120.9], [34.4, -119.7], [34.1, -119.3],
  [33.7, -118.2], [33.6, -117.9], [33.4, -117.6], [32.7, -117.2], [32.5, -117.1]
];
const WEST_COAST_BOUNDS = [[31.7, -127], [50, -115]];
const WEST_COAST_CITIES = [
  { name: "Vancouver", region: "British Columbia", lat: 49.2827, lng: -123.1207 },
  { name: "Seattle", region: "Washington", lat: 47.6062, lng: -122.3321 },
  { name: "Portland", region: "Oregon", lat: 45.5152, lng: -122.6784 },
  { name: "San Francisco", region: "California", lat: 37.7749, lng: -122.4194 },
  { name: "Los Angeles", region: "California", lat: 34.0522, lng: -118.2437 },
  { name: "San Diego", region: "California", lat: 32.7157, lng: -117.1611 }
];
const FEATURED_BEACHES = [
  { name: "Imperial Beach", region: "California", lat: 32.5793, lng: -117.1324, description: "At California's southern edge, this beach is near the Tijuana River Estuary." },
  { name: "Huntington State Beach", region: "California", lat: 33.6553, lng: -118.0037, description: "A long Orange County beach known for surfing and its beachside trail." },
  { name: "Santa Cruz Main Beach", region: "California", lat: 36.9621, lng: -122.0244, description: "A popular city beach beside the historic Santa Cruz Beach Boardwalk." },
  { name: "Cannon Beach", region: "Oregon", lat: 45.8918, lng: -123.9615, description: "A broad sandy Oregon beach with Haystack Rock rising at the shoreline." },
  { name: "Ruby Beach", region: "Washington", lat: 47.7148, lng: -124.4140, description: "A rugged Olympic coast beach with dramatic sea stacks and driftwood." }
];
const BEACH_REPORT_RADIUS_KM = 5;
const BEACH_REPORT_WINDOW_DAYS = 30;

let reports = loadReports();
let reportMap;
let mainMap;
let pickerMarker;
let cityLayer;
let beachLayer;
let publicReportLayer;
let reportLayer;
let selectedLocation = null;
function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
function saveReports() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch (error) {
    return false;
  }
}
function showPage(pageId) {
  const targetId = pageId === "map" ? "map-page" : pageId;
  document.querySelectorAll(".page").forEach((page) => { page.hidden = page.id !== targetId; });
  document.querySelectorAll("[data-page]").forEach((item) => {
    if (item.tagName === "A") {
      if (item.dataset.page === pageId) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
  });
  if (window.location.hash !== `#${pageId}`) history.replaceState(null, "", `#${pageId}`);
  if (pageId === "report") {
    if (!reportMap) initReportMap();
    if (reportMap) window.setTimeout(() => reportMap.invalidateSize(), 80);
  }
  if (pageId === "map") {
    if (!mainMap) initMainMap();
    renderMapMarkers();
    if (mainMap) window.setTimeout(() => mainMap.invalidateSize(), 80);
  }
}
function setMessage(element, message, kind = "") {
  element.textContent = message;
  element.className = `form-message${kind ? ` ${kind}` : ""}`;
}
function segmentDistanceKm(point, start, end) {
  const middleLat = (point[0] + start[0] + end[0]) / 3;
  const scaleX = 111.32 * Math.cos(middleLat * Math.PI / 180);
  const x = point[1] * scaleX;
  const y = point[0] * 110.57;
  const ax = start[1] * scaleX;
  const ay = start[0] * 110.57;
  const bx = end[1] * scaleX;
  const by = end[0] * 110.57;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const ratio = lengthSquared ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared)) : 0;
  return Math.hypot(x - (ax + ratio * dx), y - (ay + ratio * dy));
}
function isNearUsCoast(lat, lng) {
  if (lat < 32.1 || lat > 49.2 || lng < -126.5 || lng > -116.5) return false;
  const point = [lat, lng];
  return WEST_COAST_PATH.slice(1).some((end, index) => segmentDistanceKm(point, WEST_COAST_PATH[index], end) <= 35);
}
function getLocalDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}
function createSatelliteTileLayer() {
  const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const options = {
    maxZoom: 19,
    attribution: 'Imagery &copy; <a href="https://www.esri.com/en-us/legal/terms/full-master-agreement">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
  };
  return L.tileLayer(tileUrl, options);
}
function createLeafletMap(elementId) {
  const map = L.map(elementId, {
    scrollWheelZoom: true,
    zoomDelta: 0.5,
    zoomSnap: 0.5,
    wheelPxPerZoomLevel: 120,
    maxBounds: WEST_COAST_BOUNDS,
    maxBoundsViscosity: 0.8,
    minZoom: 3
  }).fitBounds(WEST_COAST_BOUNDS, { padding: [12, 12] });
  const tiles = createSatelliteTileLayer().addTo(map);
  tiles.on("tileerror", () => {
    const messageId = elementId === "main-map" ? "map-message" : "picker-message";
    const message = document.getElementById(messageId);
    if (messageId === "picker-message") {
      setMessage(message, "Satellite images could not load. Check your internet connection and try again.", "error");
    } else {
      message.textContent = "Satellite images could not load. Check your internet connection and refresh the page.";
      message.className = "form-message error";
    }
  });
  return map;
}
function initReportMap() {
  const message = document.getElementById("picker-message");
  try {
    if (!window.L) throw new Error("Leaflet is unavailable");
    reportMap = createLeafletMap("report-map");
    reportMap.on("click", (event) => {
      const { lat, lng } = event.latlng;
      if (!isNearUsCoast(lat, lng)) {
        selectedLocation = null;
        if (pickerMarker) pickerMarker.remove();
        pickerMarker = null;
        document.getElementById("selected-location").textContent = "No location selected";
        setMessage(message, "That spot is outside the U.S. West Coast reporting area. Try a U.S. Pacific shoreline.", "error");
        return;
      }
      selectedLocation = { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
      if (pickerMarker) pickerMarker.remove();
      pickerMarker = L.circleMarker([lat, lng], { radius: 8, color: "#07221f", weight: 2, fillColor: "#72e1d0", fillOpacity: 1 }).addTo(reportMap);
      document.getElementById("selected-location").textContent = `${selectedLocation.lat}, ${selectedLocation.lng}`;
      setMessage(message, "Location selected. Add the details above, then save your report.", "success");
    });
  } catch (error) {
    setMessage(message, "The map could not load. Check your internet connection and reload to choose a location.", "error");
  }
}
function createReportCard(report) {
  const card = document.createElement("article");
  card.className = "report-item";
  const details = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = `${report.isTestReport ? "TEST · " : ""}${TYPE_NAMES[report.type] || "Other"} · ${report.concern} concern`;
  const summary = document.createElement("p");
  summary.textContent = `${report.date} · ${report.description} · ${report.lat}, ${report.lng}`;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", `Delete ${TYPE_NAMES[report.type] || "report"} report from ${report.date}`);
  remove.addEventListener("click", () => deleteReport(report.id));
  details.append(title, summary);
  card.append(details, remove);
  return card;
}
function renderReportList() {
  const list = document.getElementById("report-list");
  list.replaceChildren();
  if (!reports.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No reports saved yet. Your reports will appear here.";
    list.append(empty);
    return;
  }
  [...reports].reverse().forEach((report) => list.append(createReportCard(report)));
}
function deleteReport(reportId) {
  if (!window.confirm("Delete this report from this device?")) return;
  reports = reports.filter((report) => report.id !== reportId);
  if (!saveReports()) window.alert("Browser storage is unavailable, so this change could not be saved.");
  renderReportList();
  renderMapMarkers();
  updateTestReportButton();
}
function updateTestReportButton() {
  const button = document.getElementById("add-test-reports");
  if (!button) return;
  const alreadyAdded = reports.some((report) => report.isTestReport);
  button.disabled = alreadyAdded;
  button.textContent = alreadyAdded ? "Test reports added" : "Add test reports";
}
function addTestReports() {
  const message = document.getElementById("test-report-message");
  if (reports.some((report) => report.isTestReport)) {
    message.textContent = "Test reports are already saved here. Delete them from the Report page before adding them again.";
    return;
  }
  const date = getLocalDate();
  const added = TEST_USER_REPORTS.map((sample, index) => ({
    ...sample,
    id: `test-${Date.now()}-${index}`,
    date,
    isTestReport: true
  }));
  reports.push(...added);
  if (!saveReports()) {
    reports.splice(-added.length);
    message.textContent = "Browser storage is unavailable, so test reports could not be saved.";
    return;
  }
  renderReportList();
  renderMapMarkers();
  updateTestReportButton();
  message.textContent = "Added 3 TEST reports to this device. Delete them from the Report page when you are done.";
}
function handleReportSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("picker-message");
  if (!form.reportValidity()) return;
  if (!selectedLocation) {
    setMessage(message, "Please pick a location close to the U.S. West Coast before saving.", "error");
    return;
  }
  const date = document.getElementById("report-date").value;
  if (date > getLocalDate()) {
    setMessage(message, "Please choose today or an earlier date.", "error");
    return;
  }
  const report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: document.getElementById("report-type").value,
    concern: document.getElementById("report-concern").value,
    date,
    description: document.getElementById("report-description").value.trim(),
    lat: selectedLocation.lat,
    lng: selectedLocation.lng
  };
  if (!report.description) {
    setMessage(message, "Please add a short description before saving.", "error");
    return;
  }
  reports.push(report);
  if (!saveReports()) {
    reports.pop();
    setMessage(message, "Browser storage is unavailable, so the report could not be saved.", "error");
    return;
  }
  form.reset();
  document.getElementById("report-date").value = getLocalDate();
  selectedLocation = null;
  if (pickerMarker) pickerMarker.remove();
  document.getElementById("selected-location").textContent = "No location selected";
  setMessage(message, "Report saved on this device. It was not sent to anyone.", "success");
  renderReportList();
  renderMapMarkers();
}
function initReportPage() {
  const today = getLocalDate();
  const dateInput = document.getElementById("report-date");
  dateInput.max = today;
  dateInput.value = today;
  document.getElementById("report-form").addEventListener("submit", handleReportSubmit);
  renderReportList();
}
function createPopupContent(report) {
  const wrapper = document.createElement("div");
  const title = document.createElement("p");
  title.className = "popup-title";
  title.textContent = `${report.isTestReport ? "TEST REPORT · " : ""}${TYPE_NAMES[report.type] || "Other"}`;
  const detail = document.createElement("p");
  detail.className = "popup-detail";
  detail.textContent = `${report.concern} concern · ${report.date}`;
  const description = document.createElement("p");
  description.className = "popup-detail";
  description.textContent = report.description;
  wrapper.append(title, detail, description);
  return wrapper;
}
function createPublicReportPopupContent(report) {
  const wrapper = document.createElement("div");
  const title = document.createElement("p");
  title.className = "popup-title";
  title.textContent = `Public example · ${report.location}`;
  const detail = document.createElement("p");
  detail.className = "popup-detail";
  detail.textContent = `${TYPE_NAMES[report.type]} · ${report.date} · Aqua Watch filter: ${report.concern}`;
  const description = document.createElement("p");
  description.className = "popup-description";
  description.textContent = report.description;
  const note = document.createElement("p");
  note.className = "popup-detail";
  note.textContent = "Historical example, not a live warning. The map pin marks the approximate affected area.";
  const source = document.createElement("a");
  source.className = "public-source-link";
  source.href = report.source;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = `Source: ${report.sourceLabel}`;
  wrapper.append(title, detail, description, note, source);
  return wrapper;
}
function renderPublicReportMarkers(visibleReports) {
  if (!publicReportLayer) return;
  publicReportLayer.clearLayers();
  visibleReports.forEach((report) => {
    L.marker([report.lat, report.lng], {
      icon: createReportIcon(report.concern, true),
      title: `Public example · ${report.location}`
    })
      .bindPopup(createPublicReportPopupContent(report))
      .addTo(publicReportLayer);
  });
}
function distanceBetweenKm(first, second) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latDifference = radians(second[0] - first[0]);
  const lngDifference = radians(second[1] - first[1]);
  const arc = Math.sin(latDifference / 2) ** 2
    + Math.cos(radians(first[0])) * Math.cos(radians(second[0])) * Math.sin(lngDifference / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}
function getBeachSafety(beach) {
  const now = Date.now();
  const windowMs = BEACH_REPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const beachPoint = [beach.lat, beach.lng];
  const recentReports = reports.filter((report) => {
    const reportTime = new Date(`${report.date}T00:00:00`).getTime();
    const reportPoint = [Number(report.lat), Number(report.lng)];
    const age = now - reportTime;
    return Number.isFinite(reportTime)
      && age >= 0
      && age <= windowMs
      && Number.isFinite(reportPoint[0])
      && Number.isFinite(reportPoint[1])
      && distanceBetweenKm(beachPoint, reportPoint) <= BEACH_REPORT_RADIUS_KM;
  });
  const highCount = recentReports.filter((report) => report.concern === "high").length;
  const level = highCount > 0 || recentReports.length >= 3 ? "red" : recentReports.length > 0 ? "orange" : "green";
  const label = level === "red" ? "High concern nearby" : level === "orange" ? "Reports nearby" : "No recent reports";
  return { level, label, count: recentReports.length, highCount };
}
function createBeachLabel(beach, safety) {
  const label = document.createElement("span");
  label.className = "beach-label-content";
  const name = document.createElement("strong");
  name.textContent = beach.name;
  const badge = document.createElement("span");
  badge.className = `beach-safety beach-safety-${safety.level}`;
  const dot = document.createElement("i");
  dot.setAttribute("aria-hidden", "true");
  badge.append(dot, document.createTextNode(safety.label));
  label.append(name, badge);
  return label;
}
function createBeachPopupContent(beach, safety) {
  const wrapper = document.createElement("div");
  const title = document.createElement("p");
  title.className = "popup-title";
  title.textContent = `${beach.name} · ${beach.region}`;
  const description = document.createElement("p");
  description.className = "popup-description";
  description.textContent = beach.description;
  const status = document.createElement("p");
  status.className = "popup-detail";
  status.textContent = safety.label;
  const reportsDetail = document.createElement("p");
  reportsDetail.className = "popup-detail";
  reportsDetail.textContent = `${safety.count} saved report${safety.count === 1 ? "" : "s"} within ${BEACH_REPORT_RADIUS_KM} km in the past ${BEACH_REPORT_WINDOW_DAYS} days.`;
  const note = document.createElement("p");
  note.className = "popup-detail";
  note.textContent = "Community reports only; this is not an official water-quality or safety notice.";
  wrapper.append(title, description, status, reportsDetail, note);
  return wrapper;
}
function createBeachIcon() {
  return L.divIcon({
    className: "beach-wave-icon",
    html: '<span class="beach-wave-symbol" aria-hidden="true"><svg viewBox="0 0 32 24"><path d="M2 8c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 6 4M2 17c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 6 4"/></svg></span>',
    iconSize: [34, 34],
    iconAnchor: [29, 17],
    popupAnchor: [0, -15]
  });
}
function createCityPopupContent(city) {
  const wrapper = document.createElement("div");
  const title = document.createElement("p");
  title.className = "popup-title";
  title.textContent = city.name;
  const detail = document.createElement("p");
  detail.className = "popup-detail";
  detail.textContent = `Major Pacific city · ${city.region}`;
  wrapper.append(title, detail);
  return wrapper;
}
function renderCityMarkers() {
  if (!cityLayer) return;
  cityLayer.clearLayers();
  WEST_COAST_CITIES.forEach((city) => {
    L.circleMarker([city.lat, city.lng], {
      radius: 6,
      color: "#0b1719",
      weight: 2,
      fillColor: "#ffffff",
      fillOpacity: 1
    })
      .bindTooltip(city.name, { permanent: true, direction: "right", offset: [8, 0], className: "city-label" })
      .bindPopup(createCityPopupContent(city))
      .addTo(cityLayer);
  });
}
function renderBeachMarkers() {
  if (!beachLayer) return;
  beachLayer.clearLayers();
  FEATURED_BEACHES.forEach((beach) => {
    const safety = getBeachSafety(beach);
    const direction = "left";
    L.marker([beach.lat, beach.lng], {
      icon: createBeachIcon(),
      title: `${beach.name}: ${safety.label}`
    })
      .bindTooltip(createBeachLabel(beach, safety), {
        permanent: true,
        direction,
        offset: [direction === "right" ? 15 : -15, 0],
        className: "beach-label-tooltip"
      })
      .bindPopup(createBeachPopupContent(beach, safety))
      .addTo(beachLayer);
  });
}
function createReportIcon(concern, isPublicExample = false) {
  const level = ["low", "medium", "high"].includes(concern) ? concern : "low";
  return L.divIcon({
    className: `${isPublicExample ? "public-example-marker " : ""}report-marker-icon report-marker-${level}`,
    html: '<svg class="report-warning" viewBox="0 0 36 36" aria-hidden="true"><path class="warning-outline" d="M18 2.5 34 32H2Z"/><path class="warning-fill" d="m18 7 12.2 22H5.8Z"/><path class="warning-mark" d="M18 13v8"/><circle class="warning-dot" cx="18" cy="25" r="1.3"/></svg>',
    iconSize: [36, 38],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
  });
}
function renderMapMarkers() {
  if (!mainMap || !reportLayer || !publicReportLayer) return;
  reportLayer.clearLayers();
  const selectedType = document.getElementById("filter-type").value;
  const selectedConcern = document.getElementById("filter-concern").value;
  const visible = reports.filter((report) => isNearUsCoast(report.lat, report.lng)
    && (selectedType === "all" || report.type === selectedType)
    && (selectedConcern === "all" || report.concern === selectedConcern));
  const visiblePublic = PUBLIC_REPORT_EXAMPLES.filter((report) =>
    (selectedType === "all" || report.type === selectedType)
    && (selectedConcern === "all" || report.concern === selectedConcern));
  visible.forEach((report) => {
    L.marker([report.lat, report.lng], {
      icon: createReportIcon(report.concern),
      title: `${TYPE_NAMES[report.type] || "Other"} · ${report.concern} concern`
    })
      .bindPopup(createPopupContent(report))
      .addTo(reportLayer);
  });
  renderPublicReportMarkers(visiblePublic);
  const count = visible.length + visiblePublic.length;
  document.getElementById("report-count").textContent = `${count} visible ${count === 1 ? "report" : "reports"} · ${visiblePublic.length} public examples, ${visible.length} on this device`;
  renderBeachMarkers();
}
function initMainMap() {
  try {
    if (!window.L) throw new Error("Leaflet is unavailable");
    mainMap = createLeafletMap("main-map");
    cityLayer = L.layerGroup().addTo(mainMap);
    renderCityMarkers();
    beachLayer = L.layerGroup().addTo(mainMap);
    publicReportLayer = L.layerGroup().addTo(mainMap);
    reportLayer = L.layerGroup().addTo(mainMap);
    document.getElementById("filter-type").addEventListener("change", renderMapMarkers);
    document.getElementById("filter-concern").addEventListener("change", renderMapMarkers);
    document.getElementById("add-test-reports").addEventListener("click", addTestReports);
    document.getElementById("clear-filters").addEventListener("click", () => {
      document.getElementById("filter-type").value = "all";
      document.getElementById("filter-concern").value = "all";
      renderMapMarkers();
    });
    updateTestReportButton();
    renderMapMarkers();
  } catch (error) {
    document.getElementById("main-map").textContent = "The map could not load. Check your internet connection and reload.";
  }
}

const QUIZ_QUESTIONS = [
  { question: "Which places can coastal wetlands and estuaries support?", options: ["Fish and wildlife habitat", "Only desert plants", "No living things", "Only city roads"], answer: 0, why: "Coastal wetlands and estuaries provide habitat for fish and wildlife." },
  { question: "What can wetlands help soften for coastal communities?", options: ["The effects of storms", "The color of ocean water", "The tides everywhere", "The wind each day"], answer: 0, why: "Wetlands can reduce some storm impacts and help protect coastal places." },
  { question: "How can litter from inland areas reach the sea?", options: ["It can travel through streets, streams, and rivers", "It disappears when it rains", "It only moves by airplane", "It cannot reach water"], answer: 0, why: "Trash can move from land into waterways and onward to the coast." },
  { question: "What can rain carry from land into nearby water?", options: ["Extra nutrients", "More beaches", "Clean sand only", "Sea turtles"], answer: 0, why: "Runoff can carry nutrients from land into streams, bays, and coastal water." },
  { question: "What can too many nutrients help cause?", options: ["Algae blooms", "Cleaner water every time", "More shoreline", "Less rainfall"], answer: 0, why: "Excess nutrients can fuel algae blooms and harm water quality." },
  { question: "Which is one possible effect of a harmful algae bloom?", options: ["It can harm aquatic life", "It always helps every fish", "It removes all pollution", "It makes runoff stop"], answer: 0, why: "Algae blooms can harm aquatic life and some can produce toxins." },
  { question: "How can a cleanup help if you live far from the coast?", options: ["Picking up litter can keep it from reaching waterways", "It changes the ocean tide", "It stops all storms", "It makes plastic dissolve"], answer: 0, why: "Cleaning up litter near home or streams can help keep debris out of the ocean." },
  { question: "Which everyday choice can help reduce marine debris?", options: ["Put trash in the proper bin", "Leave litter beside a stream", "Use more single-use items", "Drop waste on the beach"], answer: 0, why: "Putting trash in the right place helps prevent it from becoming marine debris." }
];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
function showQuizStart() {
  const box = document.getElementById("quiz-box");
  box.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "quiz-start";
  const copy = document.createElement("p");
  copy.textContent = "Eight multiple-choice questions. You will see a short explanation after each answer.";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "button-primary";
  start.textContent = "Start quiz";
  start.addEventListener("click", startQuiz);
  wrap.append(copy, start);
  box.append(wrap);
}
function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuizQuestion();
}
function renderQuizQuestion() {
  const box = document.getElementById("quiz-box");
  const item = QUIZ_QUESTIONS[quizIndex];
  box.replaceChildren();
  const progress = document.createElement("p");
  progress.className = "quiz-progress";
  progress.textContent = `Question ${quizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
  const question = document.createElement("h2");
  question.className = "quiz-question";
  question.textContent = item.question;
  const choices = document.createElement("div");
  choices.className = "quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");
  item.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option;
    button.addEventListener("click", () => answerQuestion(optionIndex, feedback, choices));
    choices.append(button);
  });
  const next = document.createElement("button");
  next.type = "button";
  next.className = "button-primary quiz-next";
  next.textContent = quizIndex === QUIZ_QUESTIONS.length - 1 ? "See my score" : "Next question";
  next.hidden = true;
  next.addEventListener("click", advanceQuiz);
  box.append(progress, question, choices, feedback, next);
}
function answerQuestion(optionIndex, feedback, choices) {
  if (quizAnswered) return;
  quizAnswered = true;
  const item = QUIZ_QUESTIONS[quizIndex];
  const buttons = [...choices.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add("correct");
    else if (index === optionIndex) button.classList.add("incorrect");
  });
  const isCorrect = optionIndex === item.answer;
  if (isCorrect) quizScore += 1;
  feedback.classList.add(isCorrect ? "correct" : "incorrect");
  feedback.textContent = `${isCorrect ? "That's right." : "Not quite."} ${item.why}`;
  document.querySelector(".quiz-next").hidden = false;
}
function advanceQuiz() {
  if (!quizAnswered) return;
  if (quizIndex === QUIZ_QUESTIONS.length - 1) {
    showQuizResult();
    return;
  }
  quizIndex += 1;
  quizAnswered = false;
  renderQuizQuestion();
}
function showQuizResult() {
  const box = document.getElementById("quiz-box");
  box.replaceChildren();
  const result = document.createElement("div");
  result.className = "quiz-result";
  const label = document.createElement("p");
  label.textContent = "Your score";
  const score = document.createElement("strong");
  score.textContent = `${quizScore} / ${QUIZ_QUESTIONS.length}`;
  const copy = document.createElement("p");
  copy.textContent = quizScore === QUIZ_QUESTIONS.length ? "Perfect score. Thanks for learning about our coasts." : "Nice work. Revisit Learn and give it another try.";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "button-primary";
  retry.textContent = "Retry quiz";
  retry.addEventListener("click", startQuiz);
  result.append(label, score, copy, retry);
  box.append(result);
}
function initQuiz() {
  showQuizStart();
}
function initApp() {
  document.querySelectorAll("[data-page]").forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(item.dataset.page);
  }));
  initReportPage();
  initQuiz();
  const requestedPage = window.location.hash.slice(1);
  const validPages = ["home", "report", "map", "learn", "quiz"];
  showPage(validPages.includes(requestedPage) ? requestedPage : "home");
}

document.addEventListener("DOMContentLoaded", initApp);
