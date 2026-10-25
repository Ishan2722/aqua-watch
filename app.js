const TEST_REPORTS_STORAGE_KEY = "aquaWatchTestReports";
const OWNED_REPORTS_STORAGE_KEY = "aquaWatchOwnedReportIds";
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

const appConfig = window.AQUA_WATCH_CONFIG || {};
const sharedReportsClient = window.supabase && appConfig.url && appConfig.publishableKey
  ? window.supabase.createClient(appConfig.url, appConfig.publishableKey)
  : null;
let reports = [];
let testReports = loadTestReports();
let ownedReportIds = loadOwnedReportIds();
let reportMap;
let mainMap;
let pickerMarker;
let cityLayer;
let beachLayer;
let publicReportLayer;
let reportLayer;
let selectedLocation = null;
function loadTestReports() {
  try {
    const saved = localStorage.getItem(TEST_REPORTS_STORAGE_KEY) || localStorage.getItem("aquaWatchReports");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((report) => report && report.isTestReport) : [];
  } catch (error) {
    return [];
  }
}
function saveTestReports() {
  try {
    localStorage.setItem(TEST_REPORTS_STORAGE_KEY, JSON.stringify(testReports));
    return true;
  } catch (error) {
    return false;
  }
}
function loadOwnedReportIds() {
  try {
    const saved = localStorage.getItem(OWNED_REPORTS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch (error) {
    return [];
  }
}
function saveOwnedReportIds() {
  try {
    localStorage.setItem(OWNED_REPORTS_STORAGE_KEY, JSON.stringify(ownedReportIds));
    return true;
  } catch (error) {
    return false;
  }
}
function allReports() {
  return [...reports, ...testReports];
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
  const mine = [
    ...reports.filter((report) => ownedReportIds.includes(report.id)),
    ...testReports
  ];
  if (!mine.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = sharedReportsClient
      ? "No reports from this browser yet. Reports shared by everyone appear on the map."
      : "Shared reporting is not connected yet. Test reports can still be added from the map.";
    list.append(empty);
    return;
  }
  [...mine].reverse().forEach((report) => list.append(createReportCard(report)));
}
async function deleteReport(reportId) {
  if (!window.confirm("Delete this report? Shared reports are removed from the public map.")) return;
  const testReport = testReports.find((report) => report.id === reportId);
  if (testReport) {
    testReports = testReports.filter((report) => report.id !== reportId);
    if (!saveTestReports()) window.alert("Browser storage is unavailable, so this test report could not be deleted.");
  } else if (ownedReportIds.includes(reportId) && sharedReportsClient) {
    const { error } = await sharedReportsClient.from("reports").delete().eq("id", reportId);
    if (error) {
      window.alert("This report could not be deleted. Check your connection and try again.");
      return;
    }
    ownedReportIds = ownedReportIds.filter((id) => id !== reportId);
    saveOwnedReportIds();
    await loadSharedReports();
  }
  renderReportList();
  renderMapMarkers();
  updateTestReportButton();
}
function updateTestReportButton() {
  const button = document.getElementById("add-test-reports");
  if (!button) return;
  const alreadyAdded = testReports.length > 0;
  button.disabled = alreadyAdded;
  button.textContent = alreadyAdded ? "Test reports added" : "Add test reports";
}
function addTestReports() {
  const message = document.getElementById("test-report-message");
  if (testReports.length > 0) {
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
  testReports.push(...added);
  if (!saveTestReports()) {
    testReports.splice(-added.length);
    message.textContent = "Browser storage is unavailable, so test reports could not be saved.";
    return;
  }
  renderReportList();
  renderMapMarkers();
  updateTestReportButton();
  message.textContent = "Added 3 TEST reports saved only on this device. Delete them from the Report page when you are done.";
}
async function handleReportSubmit(event) {
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
  if (!sharedReportsClient) {
    setMessage(message, "Shared reporting is not connected yet. Ask the site owner to finish the database setup.", "error");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sharing report…";
  }
  try {
    let { data: authData, error: authError } = await sharedReportsClient.auth.getSession();
    if (authError) throw authError;
    if (!authData.session) {
      const signInResult = await sharedReportsClient.auth.signInAnonymously();
      if (signInResult.error) throw signInResult.error;
      authData = { session: signInResult.data.session };
    }
    const ownerId = authData.session.user.id;
    const { data, error } = await sharedReportsClient.from("reports").insert({
      owner_id: ownerId,
      type: report.type,
      concern: report.concern,
      report_date: report.date,
      description: report.description,
      lat: report.lat,
      lng: report.lng
    }).select("id").single();
    if (error) throw error;
    report.id = data.id;
    reports.unshift(report);
    ownedReportIds = [...new Set([...ownedReportIds, report.id])];
    saveOwnedReportIds();
  } catch (error) {
    setMessage(message, "The report could not be shared. Check your connection and try again.", "error");
    return;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Share report publicly";
    }
  }
  form.reset();
  document.getElementById("report-date").value = getLocalDate();
  selectedLocation = null;
  if (pickerMarker) pickerMarker.remove();
  document.getElementById("selected-location").textContent = "No location selected";
  setMessage(message, "Report shared on the public map with its exact location and description.", "success");
  renderReportList();
  renderMapMarkers();
}
async function loadSharedReports() {
  if (!sharedReportsClient) return;
  try {
    const { data, error } = await sharedReportsClient
      .from("reports")
      .select("id,type,concern,report_date,description,lat,lng,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    reports = (Array.isArray(data) ? data : []).map((report) => ({
      id: report.id,
      type: report.type,
      concern: report.concern,
      date: report.report_date,
      description: report.description,
      lat: Number(report.lat),
      lng: Number(report.lng)
    }));
    renderReportList();
    renderMapMarkers();
    return true;
  } catch (error) {
    const message = document.getElementById("map-message");
    if (message) {
      message.textContent = "Shared reports could not load. Check your internet connection and try again.";
      message.className = "form-message error";
    }
    return false;
  }
}
function initReportPage() {
  const today = getLocalDate();
  const dateInput = document.getElementById("report-date");
  dateInput.max = today;
  dateInput.value = today;
  document.getElementById("report-form").addEventListener("submit", handleReportSubmit);
  const submitButton = document.querySelector('#report-form button[type="submit"]');
  const storageNote = document.getElementById("report-storage-note");
  if (submitButton && !sharedReportsClient) submitButton.disabled = true;
  if (storageNote && !sharedReportsClient) {
    storageNote.textContent = "Shared reporting is not connected yet. The site owner must finish database setup before public reports can be submitted.";
  }
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
  const recentReports = allReports().filter((report) => {
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
  const visible = allReports().filter((report) => isNearUsCoast(report.lat, report.lng)
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
  const sharedCount = visible.filter((report) => !report.isTestReport).length;
  const testCount = visible.filter((report) => report.isTestReport).length;
  document.getElementById("report-count").textContent = `${count} visible ${count === 1 ? "report" : "reports"} · ${sharedCount} shared, ${visiblePublic.length} historical examples, ${testCount} local tests`;
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

const QUIZ_BANK = [
  { topic: "connected", question: "What does a watershed describe?", answer: "Land that drains rain and snowmelt toward waterways", distractors: ["Only the land beside an ocean beach", "A channel used only by ocean tides", "An underwater forest made of kelp"], why: "A watershed channels rain and snowmelt to creeks, rivers, bays, or the ocean." },
  { topic: "connected", question: "How might litter from a neighborhood reach the coast?", answer: "It can move through storm drains, streams, and rivers", distractors: ["It changes into seawater", "It travels only when carried by ocean fish", "It cannot move once it leaves a person's hand"], why: "Storm drains and waterways can connect inland places to coastal water." },
  { topic: "connected", question: "What is an estuary?", answer: "A place where river water and seawater mix", distractors: ["A beach with no plants or animals", "A deep part of the open ocean far from land", "A lake that never receives freshwater"], why: "Estuaries form where rivers meet the sea and fresh and salt water mix." },
  { topic: "connected", question: "Why can activities far from a beach matter to coastal water?", answer: "Water can carry materials downstream through connected watersheds", distractors: ["Every inland activity changes the ocean tide", "Coastal water is sealed off from rivers", "Wind carries all inland pollution directly offshore"], why: "Waterways can carry runoff and debris from inland areas toward the coast." },
  { topic: "connected", question: "Which set includes places that are part of coastal systems?", answer: "Estuaries, tidal wetlands, rocky shores, and nearshore waters", distractors: ["Only sandy beaches", "Only deep ocean trenches", "Mountaintops with no water connection"], why: "Coastal systems include many habitats beyond the beach itself." },
  { topic: "connected", question: "What helps create changing conditions in an estuary?", answer: "River flow, tides, and mixing fresh and salt water", distractors: ["A permanent lack of tides", "Only daily changes in air temperature", "A wall that keeps rivers and oceans separate"], why: "Estuaries change as river water and tides mix and move through them." },
  { topic: "connected", question: "Which path best shows how water can move from land to the sea?", answer: "Rain → creek → river → coastal bay", distractors: ["Rain → mountain peak → desert → moon", "Ocean → road → rooftop → cloud only", "Beach sand → storm drain → sidewalk with no water"], why: "Rain and snowmelt can drain through streams and rivers into bays or the ocean." },
  { topic: "connected", question: "A storm drain near a school matters to a coast because it may connect to…", answer: "A nearby stream or other waterway", distractors: ["A sealed container under the school", "A water filter that removes every pollutant", "A path that always ends in a drinking fountain"], why: "Storm drains can carry water into streams and other waterways." },

  { topic: "habitats", question: "Why are estuaries sometimes called nurseries?", answer: "Many animals find food, shelter, or places to grow there", distractors: ["They are where all ocean animals are born", "They contain no predators or changing conditions", "They are used only to grow coastal plants for people"], why: "Many fish and other animals use estuary habitats during early life stages." },
  { topic: "habitats", question: "Which is a coastal habitat named in Learn?", answer: "A kelp forest", distractors: ["A paved parking lot", "A dry desert dune far inland", "An underground cave with no water connection"], why: "Kelp forests are one of the coastal ecosystems described in Learn." },
  { topic: "habitats", question: "What can wetland plants and seagrasses do as water moves through them?", answer: "Trap some sediment and absorb some nutrients", distractors: ["Remove every kind of pollution from all water", "Stop tides from reaching the shore", "Turn salt water into rain immediately"], why: "Wetland plants and seagrasses can trap some sediment and absorb nutrients." },
  { topic: "habitats", question: "How can wetlands help during some floods?", answer: "They can hold and slow some floodwater", distractors: ["They prevent every storm from reaching land", "They move all floodwater offshore", "They keep rivers from ever rising"], why: "Wetlands can store and slow some floodwater, depending on local conditions." },
  { topic: "habitats", question: "Which animal group may use beaches and mudflats to feed?", answer: "Shorebirds", distractors: ["Only animals that live in deserts", "No wildlife; beaches are lifeless", "Only deep-sea fish"], why: "Shorebirds feed along beaches and mudflats." },
  { topic: "habitats", question: "Which is one way coastal places support people?", answer: "They support fishing, recreation, shipping, and tourism", distractors: ["They eliminate the need for local jobs", "They are useful only as places to build roads", "They prevent all coastal hazards"], why: "Coastal waters support work, recreation, and community life." },
  { topic: "habitats", question: "Which statement about wetlands and storms is most accurate?", answer: "Wetlands can reduce some flooding and erosion, but not prevent every storm impact", distractors: ["Wetlands make every storm harmless", "Wetlands have no connection to flooding", "Wetlands stop all waves everywhere"], why: "Wetlands provide some natural protection, but their benefits depend on local conditions." },
  { topic: "habitats", question: "What can a kelp forest provide?", answer: "Underwater habitat for marine life", distractors: ["A barrier that blocks all ocean currents", "A source of freshwater for rivers", "A place where no animals can live"], why: "Kelp forests provide underwater habitat." },

  { topic: "pollution", question: "What is marine debris?", answer: "Human-made material that ends up in oceans, waterways, or shorelines", distractors: ["Any naturally occurring seaweed", "Only oil released from ships", "Sand moved by ordinary waves"], why: "Marine debris is human-made material in marine and other aquatic environments." },
  { topic: "pollution", question: "What can happen to plastic exposed to sunlight, saltwater, and waves?", answer: "It can fragment into smaller pieces called microplastics", distractors: ["It always dissolve completely within a day", "It becomes harmless sand", "It turns into nutrients that clean the water"], why: "Plastic can break into smaller pieces that are difficult to remove." },
  { topic: "pollution", question: "What may runoff carry from roads, yards, and fields?", answer: "Soil, pet waste, fertilizer, pesticides, or oil", distractors: ["Only clean drinking water", "Only seawater and shells", "Nothing, because rain filters itself"], why: "Runoff can pick up a mix of materials as it flows over land." },
  { topic: "pollution", question: "Why can paved areas increase runoff?", answer: "Water cannot soak through pavement as easily", distractors: ["Pavement creates extra rain", "Pavement absorbs all pollutants", "Pavement makes storm drains flow uphill"], why: "Hard surfaces keep water from soaking into the ground, so more can flow away." },
  { topic: "pollution", question: "Which two nutrients can cause problems when too much enters water?", answer: "Nitrogen and phosphorus", distractors: ["Oxygen and sunlight", "Sand and salt", "Carbon dioxide and water vapor only"], why: "Too much nitrogen and phosphorus can fuel excessive algae growth." },
  { topic: "pollution", question: "Are nitrogen and phosphorus always pollutants?", answer: "No. They are natural nutrients, but excess amounts can cause harm", distractors: ["Yes. Any amount is poisonous", "No. They cannot affect aquatic ecosystems", "Yes. They occur only in plastic"], why: "These nutrients are natural, but too much can disrupt water ecosystems." },
  { topic: "pollution", question: "What can an excess of nutrients help cause?", answer: "Algae to grow faster than the ecosystem can handle", distractors: ["All plastic to disappear", "Every estuary to dry up", "Tides to stop moving"], why: "Excess nutrients can contribute to rapid algae growth and blooms." },
  { topic: "pollution", question: "Which statement about algae blooms is correct?", answer: "Some are harmful, but not every bloom is harmful", distractors: ["Every bloom produces a toxin", "No bloom can affect aquatic life", "A bloom's color proves exactly what caused it"], why: "Some blooms can be harmful, but appearance alone cannot confirm toxicity." },

  { topic: "observe", question: "What should you do if you notice an unusual sheen or dead wildlife?", answer: "Keep a safe distance and make a careful observation", distractors: ["Touch it to identify the material", "Move the animal yourself", "Taste nearby water to check it"], why: "Avoid touching unknown substances or wildlife; observe from a safe distance." },
  { topic: "observe", question: "Can a photo or community report prove that water is unsafe?", answer: "No. It is an observation, not a lab result or official advisory", distractors: ["Yes. Any report is an official beach closure", "Yes, if the water looks unusual", "No, because photos can never help describe a concern"], why: "A report can flag what someone saw, but it cannot verify water quality." },
  { topic: "observe", question: "Where should someone check for current swimming advisories?", answer: "Local or state beach and health department guidance", distractors: ["Only the Aqua Watch report map", "A random social media comment", "The color of the water from a photo"], why: "Local and state agencies provide current beach advisories and health guidance." },
  { topic: "observe", question: "What should you do around a suspected algae bloom?", answer: "Keep people and pets away and follow posted local guidance", distractors: ["Swim through it to see if it is toxic", "Let pets drink the water", "Collect algae with bare hands"], why: "Do not contact a suspected bloom; check trusted local safety guidance." },
  { topic: "observe", question: "Which report description is most useful?", answer: "Describe visible details without guessing the cause", distractors: ["Name a chemical without evidence", "Write only 'the ocean is bad'", "Include a personal phone number for context"], why: "Clear observations are more useful than guesses or personal information." },
  { topic: "observe", question: "Why should a report avoid personal details?", answer: "Exact locations and descriptions are public on this site", distractors: ["The map deletes every report immediately", "Only agencies can read reports", "Names are required for the map to work"], why: "Reports are public, so keep personal information out of descriptions." },
  { topic: "observe", question: "A patch of discolored water appears on a beach. What can you conclude from its color alone?", answer: "Not enough to identify the cause or whether it is harmful", distractors: ["It is definitely a toxic bloom", "It is definitely harmless", "It must be oil"], why: "Color alone cannot identify a bloom or determine whether it is harmful." },
  { topic: "observe", question: "Why do posted beach signs matter?", answer: "They can share current local safety information", distractors: ["They are only decorations", "They replace all water testing forever", "They guarantee that hazards cannot happen"], why: "Follow posted signs and current advisories when making beach safety decisions." },

  { topic: "actions", question: "Why can picking up litter near a stream help the coast?", answer: "It may keep litter from traveling downstream", distractors: ["It changes the river's direction", "It turns plastic into clean water", "It prevents all future flooding"], why: "Litter collected near waterways may never reach coastal water." },
  { topic: "actions", question: "What is a responsible way to use yard fertilizer?", answer: "Follow its directions and avoid applying it before rain", distractors: ["Apply extra before a storm", "Sweep unused fertilizer into a storm drain", "Use it on every surface"], why: "Careful use can reduce nutrients washing into nearby waterways." },
  { topic: "actions", question: "Where should motor oil or paint go?", answer: "Use local hazardous-waste or disposal instructions", distractors: ["A storm drain", "A creek or beach", "A roadside gutter"], why: "Do not pour oil or chemicals into drains; follow local disposal guidance." },
  { topic: "actions", question: "Why check local recycling rules?", answer: "Accepted items and instructions differ by place", distractors: ["All plastics are recycled everywhere", "Recycling rules never change", "Only beaches have recycling bins"], why: "Local guidance explains which items belong in local recycling programs." },
  { topic: "actions", question: "What is a useful way to reduce litter before it reaches waterways?", answer: "Secure trash so it cannot blow or wash away", distractors: ["Leave loose waste outside overnight", "Put wrappers beside a storm drain", "Wait for a beach cleanup to collect it"], why: "Keeping waste contained helps prevent it from entering runoff and waterways." },
  { topic: "actions", question: "What is a safe way to join a shoreline cleanup?", answer: "Take part in a supervised cleanup and follow its safety instructions", distractors: ["Handle unknown containers and liquids", "Approach sick or dead wildlife", "Enter closed areas without permission"], why: "Cleanups can help remove litter; follow organizers' safety directions." },
  { topic: "actions", question: "Which action can help keep pet waste out of waterways?", answer: "Pick it up, bag it, and place it in the trash", distractors: ["Leave it beside a storm drain", "Wash it into the street", "Put it on the beach"], why: "Picking up pet waste helps keep it from washing into streams and beaches." },
  { topic: "actions", question: "What can people do together to support healthier coasts?", answer: "Learn local stormwater practices and share reliable advisories", distractors: ["Replace official water testing with guesses", "Assume one cleanup solves every pollution source", "Ignore signs if the beach looks clear"], why: "Community learning and trusted information can complement everyday prevention." }
];

const QUIZ_TOPICS = ["connected", "habitats", "pollution", "observe", "actions"];
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

// Returns a shuffled copy of an array.
function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

// Builds an eight-question round with balanced correct answer positions.
function buildQuizRound() {
  const topicsWithExtraQuestion = new Set(shuffleItems(QUIZ_TOPICS).slice(0, 3));
  const selected = QUIZ_TOPICS.flatMap((topic) => {
    const count = topicsWithExtraQuestion.has(topic) ? 2 : 1;
    return shuffleItems(QUIZ_BANK.filter((item) => item.topic === topic)).slice(0, count);
  });
  const answerPositions = shuffleItems([0, 0, 1, 1, 2, 2, 3, 3]);
  return shuffleItems(selected).map((item, index) => {
    const distractors = shuffleItems(item.distractors);
    const options = [...distractors];
    options.splice(answerPositions[index], 0, item.answer);
    return { ...item, options, answerIndex: answerPositions[index] };
  });
}

// Shows the quiz introduction and question bank size.
function showQuizStart() {
  const box = document.getElementById("quiz-box");
  box.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "quiz-start";
  const copy = document.createElement("p");
  copy.textContent = `The bank has ${QUIZ_BANK.length} questions across all five Learn topics. Each round gives you eight questions with a short explanation after each answer.`;
  const start = document.createElement("button");
  start.type = "button";
  start.className = "button-primary";
  start.textContent = "Start quiz";
  start.addEventListener("click", startQuiz);
  wrap.append(copy, start);
  box.append(wrap);
}

// Starts a fresh question round.
function startQuiz() {
  quizQuestions = buildQuizRound();
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuizQuestion();
}

// Renders the current question and its answer buttons.
function renderQuizQuestion() {
  const box = document.getElementById("quiz-box");
  const item = quizQuestions[quizIndex];
  box.replaceChildren();
  const progress = document.createElement("p");
  progress.className = "quiz-progress";
  progress.textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
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
  next.textContent = quizIndex === quizQuestions.length - 1 ? "See my score" : "Next question";
  next.hidden = true;
  next.addEventListener("click", advanceQuiz);
  box.append(progress, question, choices, feedback, next);
}

// Scores a selected answer and reveals its explanation.
function answerQuestion(optionIndex, feedback, choices) {
  if (quizAnswered) return;
  quizAnswered = true;
  const item = quizQuestions[quizIndex];
  const buttons = [...choices.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answerIndex) button.classList.add("correct");
    else if (index === optionIndex) button.classList.add("incorrect");
  });
  const isCorrect = optionIndex === item.answerIndex;
  if (isCorrect) quizScore += 1;
  feedback.classList.add(isCorrect ? "correct" : "incorrect");
  feedback.textContent = `${isCorrect ? "That's right." : "Not quite."} ${item.why}`;
  document.querySelector(".quiz-next").hidden = false;
}

// Advances the round or displays the final score.
function advanceQuiz() {
  if (!quizAnswered) return;
  if (quizIndex === quizQuestions.length - 1) {
    showQuizResult();
    return;
  }
  quizIndex += 1;
  quizAnswered = false;
  renderQuizQuestion();
}

// Displays the score and allows a new question round.
function showQuizResult() {
  const box = document.getElementById("quiz-box");
  box.replaceChildren();
  const result = document.createElement("div");
  result.className = "quiz-result";
  const label = document.createElement("p");
  label.textContent = "Your score";
  const score = document.createElement("strong");
  score.textContent = `${quizScore} / ${quizQuestions.length}`;
  const copy = document.createElement("p");
  copy.textContent = quizScore === quizQuestions.length ? "Perfect score. Thanks for learning about our coasts." : "Nice work. Revisit Learn and try a fresh set of questions.";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "button-primary";
  retry.textContent = "Retry with new questions";
  retry.addEventListener("click", startQuiz);
  result.append(label, score, copy, retry);
  box.append(result);
}

// Shows the quiz introduction when the app loads.
function initQuiz() {
  showQuizStart();
}
async function initApp() {
  document.querySelectorAll("[data-page]").forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(item.dataset.page);
  }));
  initReportPage();
  initQuiz();
  if (sharedReportsClient) await loadSharedReports();
  else {
    const mapMessage = document.getElementById("map-message");
    if (mapMessage) {
      mapMessage.textContent = "Shared reports are not connected yet. Historical examples and local test reports are still available.";
      mapMessage.className = "form-message error";
    }
  }
  const requestedPage = window.location.hash.slice(1);
  const validPages = ["home", "report", "map", "learn", "quiz"];
  showPage(validPages.includes(requestedPage) ? requestedPage : "home");
}

document.addEventListener("DOMContentLoaded", initApp);
