const jobSkills = {
  "Frontend Developer": ["html", "css", "javascript", "react", "bootstrap", "responsive design", "git"],
  "Backend Developer": ["java", "python", "sql", "api", "database", "node.js", "authentication"],
  "Data Analyst": ["python", "sql", "excel", "power bi", "statistics", "data visualization", "pandas"],
  "Cybersecurity Analyst": ["Computer Networks","Linux and operating systems", "Python", "Security fundamentals"],
  "Database Engineer": ["SQL", "DBMS", "MySQL", "Oracle", "Database design and Query Optimization"]
};

const sectionKeywords = [
  { name: "Education", keywords: ["education", "bachelor", "b.tech", "btech", "degree", "university", "college"] },
  { name: "Projects", keywords: ["project", "projects"] },
  { name: "Experience", keywords: ["experience", "internship", "intern", "employment"] },
  { name: "Certifications", keywords: ["certification", "certifications", "certificate", "certificates"] }
];

const resumeInput = document.getElementById("resumeInput");
const jobRole = document.getElementById("jobRole");
const analyzeButton = document.getElementById("analyzeButton");
const dropzone = document.getElementById("dropzone");
const fileStatus = document.getElementById("fileStatus");
const errorMessage = document.getElementById("errorMessage");
const resultsSection = document.getElementById("resultsSection");
const resetButton = document.getElementById("resetButton");

let skillChart = null;
let selectedFile = null;

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
}

resumeInput.addEventListener("change", () => {
  const file = resumeInput.files[0];
  if (file) setSelectedFile(file);
});

["dragenter", "dragover"].forEach(eventName => {
  dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", event => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  setSelectedFile(file);
});

function setSelectedFile(file) {
  clearError();
  const extension = file.name.split(".").pop().toLowerCase();
  const supported = ["pdf", "txt"].includes(extension);
  const isTooLarge = file.size > 5 * 1024 * 1024;

  if (!supported) {
    selectedFile = null;
    resumeInput.value = "";
    showError("Please choose a PDF or TXT file.");
    updateFileStatus("Unsupported file type. Please choose PDF or TXT.", false);
    return;
  }
  if (isTooLarge) {
    selectedFile = null;
    resumeInput.value = "";
    showError("This file is larger than 5 MB. Please choose a smaller resume.");
    updateFileStatus("File is too large (maximum 5 MB).", false);
    return;
  }
  selectedFile = file;
  document.getElementById("uploadTitle").textContent = file.name;
  document.getElementById("uploadCopy").textContent = "Ready to analyze";
  updateFileStatus(`${file.name} · ${formatFileSize(file.size)}`, true);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function updateFileStatus(message, valid) {
  fileStatus.classList.toggle("valid", valid);
  fileStatus.innerHTML = `<span class="file-status-icon" aria-hidden="true">${valid ? "✓" : "i"}</span><span></span>`;
  fileStatus.querySelector("span:last-child").textContent = message;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    throw new Error("The PDF reader did not load. Check your internet connection and try again.");
  }
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pageTexts.push(content.items.map(item => item.str).join(" "));
  }
  return pageTexts.join(" ").toLowerCase();
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function containsSkill(text, skill) {
  // Use boundaries for simple skills so "java" doesn't match "javascript".
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z0-9+#.])${escaped}(?=$|[^a-z0-9+#.])`, "i");
  return pattern.test(text);
}

function detectSections(text) {
  return sectionKeywords.map(section => ({
    name: section.name,
    found: section.keywords.some(keyword => containsSkill(text, keyword))
  }));
}

function createRecommendations(missingSkills, sections, percent) {
  const tips = [];
  if (missingSkills.length) {
    tips.push(`Review the skills not detected: ${missingSkills.slice(0, 4).join(", ")}. Add a skill only if you can honestly demonstrate it.`);
  } else {
    tips.push("Your listed role skills were detected. Add a project bullet showing how you used the most important skills.");
  }

  const missingSections = sections.filter(section => !section.found).map(section => section.name.toLowerCase());
  if (missingSections.length) {
    tips.push(`Check whether you should include a clear ${missingSections.slice(0, 3).join(", ")} section.`);
  }
  if (percent < 60) {
    tips.push("Tailor your summary and project bullets to the job description, using accurate role-relevant terminology.");
  } else {
    tips.push("Strengthen your strongest matches with specific outcomes, tools used, and measurable results where possible.");
  }
  tips.push("Proofread formatting, dates, links, and spelling before applying.");
  return tips;
}

analyzeButton.addEventListener("click", analyzeResume);

async function analyzeResume() {
  clearError();
  const file = selectedFile || resumeInput.files[0];
  const role = jobRole.value;

  if (!file) {
    showError("Please upload a PDF or TXT resume first.");
    resumeInput.focus();
    return;
  }
  if (!role) {
    showError("Please select the job role you want to compare against.");
    jobRole.focus();
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing resume…";

  try {
    let rawText;
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      rawText = await extractTextFromPDF(file);
    } else {
      rawText = await file.text();
    }

    const text = normalizeText(rawText);
    if (!text || text.length < 20) {
      throw new Error("We couldn't find enough readable text. Try a text-based PDF or a TXT file. Scanned/image-only PDFs are not supported by this version.");
    }

    const requiredSkills = jobSkills[role];
    const matched = requiredSkills.filter(skill => containsSkill(text, skill));
    const missing = requiredSkills.filter(skill => !matched.includes(skill));
    const percent = Math.round((matched.length / requiredSkills.length) * 100);
    const sections = detectSections(text);
    const recommendations = createRecommendations(missing, sections, percent);

    displayResults({ role, fileName: file.name, percent, matched, missing, sections, recommendations });
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message || "Something went wrong while reading this file. Please try another PDF or TXT file.");
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.innerHTML = 'Analyze my resume <span aria-hidden="true">→</span>';
  }
}

function displayResults({ role, fileName, percent, matched, missing, sections, recommendations }) {
  document.getElementById("resultsSubtitle").textContent = `${fileName} · Compared with ${role}`;
  document.getElementById("matchPercent").textContent = `${percent}%`;
  document.getElementById("matchCaption").textContent = percent >= 70 ? "Strong keyword overlap" : percent >= 40 ? "Some keyword overlap" : "More tailoring may help";
  document.getElementById("matchProgress").style.width = `${percent}%`;
  document.getElementById("matchFoot").textContent = `${matched.length} of ${matched.length + missing.length} role keywords detected`;
  document.getElementById("matchedCount").textContent = matched.length;
  document.getElementById("missingCount").textContent = missing.length;

  renderSkillChips("matchedSkills", matched, false);
  renderSkillChips("missingSkills", missing, true);
  renderSections(sections);
  renderRecommendations(recommendations);
  drawChart(matched.length, missing.length);
}

function renderSkillChips(elementId, skills, missingStyle) {
  const container = document.getElementById(elementId);
  container.replaceChildren();
  if (!skills.length) {
    const empty = document.createElement("span");
    empty.className = "empty-copy";
    empty.textContent = missingStyle ? "No missing keywords detected." : "No role keywords detected yet.";
    container.appendChild(empty);
    return;
  }

  skills.forEach(skill => {
    const chip = document.createElement("span");
    chip.className = missingStyle ? "chip missing-chip" : "chip";
    chip.textContent = skill;
    container.appendChild(chip);
  });
}

function renderSections(sections) {
  const list = document.getElementById("sectionList");
  list.replaceChildren();
  const foundCount = sections.filter(section => section.found).length;
  document.getElementById("sectionScore").textContent = `${foundCount}/${sections.length}`;

  sections.forEach(section => {
    const row = document.createElement("div");
    row.className = "section-row";
    const name = document.createElement("span");
    name.className = "section-name";
    const dot = document.createElement("i");
    dot.className = `list-dot ${section.found ? "found" : "missing"}`;
    const label = document.createElement("span");
    label.textContent = section.name;
    name.append(dot, label);

    const status = document.createElement("span");
    status.className = `section-status ${section.found ? "" : "not-found"}`;
    status.textContent = section.found ? "Detected" : "Not detected";
    row.append(name, status);
    list.appendChild(row);
  });
}

function renderRecommendations(recommendations) {
  const list = document.getElementById("recommendationList");
  list.replaceChildren();
  recommendations.forEach(tip => {
    const item = document.createElement("li");
    item.textContent = tip;
    list.appendChild(item);
  });
}

function drawChart(matchedCount, missingCount) {
  const canvas = document.getElementById("skillChart");
  if (skillChart) skillChart.destroy();

  skillChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Skills found", "Not detected"],
      datasets: [{
        data: [matchedCount, missingCount],
        backgroundColor: ["#329b6b", "#e6a34e"],
        borderWidth: 0,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
}

resetButton.addEventListener("click", () => {
  resumeInput.value = "";
  selectedFile = null;
  jobRole.value = "";
  document.getElementById("uploadTitle").textContent = "Drop your resume here";
  document.getElementById("uploadCopy").innerHTML = 'or <span class="browse-text">browse files</span> from your device';
  updateFileStatus("No file selected yet", false);
  clearError();
  resultsSection.hidden = true;
  if (skillChart) {
    skillChart.destroy();
    skillChart = null;
  }
  document.querySelector(".hero").scrollIntoView({ behavior: "smooth", block: "start" });
});
