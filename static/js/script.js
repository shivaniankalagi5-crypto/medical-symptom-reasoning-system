/**
 * Medical Symptom Reasoning System - Client Logic
 * Handles interactive demo presets, NLP extraction display,
 * AJAX analysis submission, and dynamic Explainable AI results rendering.
 */

// Filter symptoms in checklist
function filterSymptoms(query) {
  const container = document.getElementById("symptom-container");
  if (!container) return;
  const items = container.querySelectorAll(".symptom-checkbox-item");
  const q = query.toLowerCase().trim();

  items.forEach((item) => {
    const name = item.getAttribute("data-name") || "";
    const cat = item.getAttribute("data-category") || "";
    if (name.includes(q) || cat.includes(q)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Reset form
function resetForm() {
  const form = document.getElementById("assessment-form");
  if (form) form.reset();
  const nlpBox = document.getElementById("nlp-feedback");
  if (nlpBox) nlpBox.style.display = "none";
  const errBox = document.getElementById("error-message");
  if (errBox) errBox.style.display = "none";
  const resBox = document.getElementById("results-container");
  if (resBox) resBox.style.display = "none";
}

// Apply Viva Demo Presets
function applyDemoPreset(type) {
  resetForm();
  const narrative = document.getElementById("narrative");
  const ageGroup = document.getElementById("age_group");
  const duration = document.getElementById("duration");
  const severity = document.getElementById("severity");

  if (type === "ili") {
    // Test 1: Fever + Cough + Fatigue
    checkSymptomById("SYM01");
    checkSymptomById("SYM03");
    checkSymptomById("SYM05");
    if (narrative) narrative.value = "I have had a high temperature, persistent cough, and feeling completely exhausted.";
    if (duration) duration.value = "1–2 days";
    if (severity) severity.value = "Moderate";
  } else if (type === "headache") {
    // Test 2: Headache + Nausea
    checkSymptomById("SYM02");
    checkSymptomById("SYM07");
    if (narrative) narrative.value = "Constant throbbing headache accompanied by feeling queasy and sick to my stomach.";
    if (duration) duration.value = "1–2 days";
    if (severity) severity.value = "Moderate";
  } else if (type === "gastro") {
    // Test 3: Vomiting + Diarrhea + Abdominal pain
    checkSymptomById("SYM08");
    checkSymptomById("SYM09");
    checkSymptomById("SYM10");
    if (narrative) narrative.value = "Severe stomach cramps with vomiting and watery diarrhea.";
    if (duration) duration.value = "1–2 days";
    if (severity) severity.value = "Moderate";
  } else if (type === "nlp1") {
    // Test 4: NLP "I have fever, headache and body pain."
    if (narrative) narrative.value = "I have fever, headache and body pain.";
    if (duration) duration.value = "3–7 days";
    if (severity) severity.value = "Moderate";
  } else if (type === "nlp2") {
    // Test 5: NLP "My head hurts and I feel like vomiting."
    if (narrative) narrative.value = "My head hurts and I feel like vomiting.";
    if (duration) duration.value = "1–2 days";
    if (severity) severity.value = "Moderate";
  } else if (type === "warning") {
    // Test 6: Red Flag
    checkSymptomById("SYM20");
    checkSymptomById("SYM19");
    if (narrative) narrative.value = "I have severe crushing chest pain and shortness of breath.";
    if (severity) severity.value = "Severe";
  }
}

function checkSymptomById(id) {
  const chk = document.getElementById(`sym-${id}`);
  if (chk) chk.checked = true;
}

// Form submission handler
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("assessment-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submit-btn");
      const errBox = document.getElementById("error-message");
      const resContainer = document.getElementById("results-container");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Reasoning...";
      }
      if (errBox) errBox.style.display = "none";

      const narrative = document.getElementById("narrative")?.value || "";
      const ageGroup = document.getElementById("age_group")?.value || "Adult";
      const duration = document.getElementById("duration")?.value || "1–2 days";
      const severity = document.getElementById("severity")?.value || "Moderate";

      const checkedSyms = Array.from(document.querySelectorAll("input[name='selected_symptoms']:checked")).map(
        (el) => el.value
      );

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            narrative: narrative,
            selected_symptoms: checkedSyms,
            age_group: ageGroup,
            duration: duration,
            severity: severity,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
          throw new Error(data.message || "Failed to process symptoms.");
        }

        if (data.status === "empty_input" || data.status === "no_symptoms_matched") {
          if (errBox) {
            errBox.textContent = data.message;
            errBox.style.display = "block";
          }
          if (resContainer) resContainer.style.display = "none";
          return;
        }

        // Cache result for results page
        localStorage.setItem("last_assessment_result", JSON.stringify(data));

        // Render in-place on assessment page
        renderResults(data, resContainer);
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message || "An error occurred during symptom reasoning.";
          errBox.style.display = "block";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Analyze Symptoms";
        }
      }
    });
  }

  // Check if on dedicated results page
  const resultsContent = document.getElementById("results-content");
  if (resultsContent) {
    const cached = localStorage.getItem("last_assessment_result");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        renderResults(parsed, resultsContent);
      } catch (e) {
        console.error("Failed to parse cached results", e);
      }
    }
  }
});

// Render Results Dashboard HTML
function renderResults(data, targetContainer) {
  if (!targetContainer) return;

  const detectedSyms = data.detected_symptoms || [];
  const topPatterns = data.top_patterns || [];
  const risk = data.risk_assessment || {};
  const meta = data.metadata || {};

  let html = `
    <div class="results-card">
      <div class="results-header-meta">
        <span>Patient Context: <strong>${meta.age_group || "Adult"}</strong></span>
        <span class="meta-separator">·</span>
        <span>Duration: <strong>${meta.duration || "1–2 days"}</strong></span>
        <span class="meta-separator">·</span>
        <span>Perceived Severity: <strong>${meta.severity || "Moderate"}</strong></span>
      </div>
  `;

  // Predefined Urgent Red Flag Warning
  if (risk.has_urgent_warning) {
    html += `
      <div class="urgent-alert-box">
        <h3 class="urgent-alert-title">URGENT MEDICAL ATTENTION</h3>
        <p class="urgent-alert-desc">
          Some reported symptoms may require urgent professional evaluation.
          Please seek immediate medical or emergency care at the nearest hospital emergency department or contact emergency services.
        </p>
        <ul class="urgent-flags-list">
          ${(risk.triggered_warnings || [])
            .map((w) => `<li><strong>${w.symptom_name}:</strong> ${w.clinical_concern}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  }

  // 1. Detected Symptoms Section
  html += `
    <div class="section-label">1. Normalized Detected Symptoms (${detectedSyms.length})</div>
    <div class="symptoms-detected-list">
      ${
        detectedSyms.length > 0
          ? detectedSyms
              .map(
                (s) =>
                  `<div class="symptom-detected-badge">${s.symptom_name} <span style="color:#64748b; font-size:0.75rem;">(${s.category})</span></div>`
              )
              .join("")
          : `<em>None identified</em>`
      }
    </div>
  `;

  // 2. Top Symptom Patterns
  html += `<div class="section-label">2. Top Symptom Patterns (AI Reasoning Engine)</div>`;

  topPatterns.forEach((pat, idx) => {
    const isTop = idx === 0;
    const matchedNames = (pat.matched_symptoms || []).map((m) => `${m.symptom_name} (weight: ${m.weight})`).join(", ");
    const missingNames = (pat.missing_symptoms || []).join(", ");

    html += `
      <div class="pattern-card ${isTop ? "top-rank" : ""}">
        <div class="pattern-header">
          <div class="pattern-title">${idx + 1}. ${pat.pattern_name}</div>
          <div class="match-score-badge">Symptom Pattern Match: ${pat.match_score_str}</div>
        </div>
        <p class="pattern-desc">${pat.description}</p>

        <div style="font-size: 0.875rem; margin-bottom: 0.5rem;">
          <strong>Matched Symptoms:</strong> ${matchedNames || "None direct"}
        </div>
        ${
          missingNames
            ? `<div style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.5rem;">
                <strong>Missing Pattern Symptoms:</strong> ${missingNames}
               </div>`
            : ""
        }

        <div class="explain-section">
          <div class="explain-title">Why did the system generate this result? (Explainable AI)</div>
          <p>${pat.explanation}</p>
          <div style="margin-top:0.5rem; font-family: monospace; font-size:0.75rem; color:#475569;">
            Coverage Ratio: ${(pat.metrics?.kb_coverage_ratio * 100).toFixed(1)}% ·
            TF-IDF Semantic Cosine Sim: ${pat.metrics?.cosine_similarity}
          </div>
        </div>
      </div>
    `;
  });

  // 3. Risk Assessment
  html += `
    <div style="margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
      <div class="section-label">3. Informational Risk Guidance Tier</div>
      <div style="font-size: 1.125rem; font-weight: 700; color: ${
        risk.badge_color === "red" ? "#e11d48" : risk.badge_color === "amber" ? "#d97706" : "#059669"
      }; margin-bottom: 0.5rem;">
        ${risk.level}
      </div>
      <p style="font-size: 0.875rem; color: #475569; margin-bottom: 0.5rem;">${risk.summary_message}</p>
      <p style="font-size: 0.8125rem; color: #64748b;"><em>${risk.disclaimer}</em></p>
    </div>
  `;

  // 4. General Safe Guidance
  html += `
    <div style="margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
      <div class="section-label">4. General Guidance</div>
      <p style="font-size: 0.9375rem; color: #334155; line-height: 1.6;">${data.general_guidance}</p>
    </div>
  `;

  // 5. Mandatory Disclaimer
  html += `
    <div style="margin-top: 1.5rem; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 1rem; font-size: 0.8125rem; color: #92400e;">
      <strong>Important Disclaimer:</strong> ${data.disclaimer}
      <br>Consult a qualified healthcare professional for diagnosis and treatment.
    </div>
  `;

  html += `</div>`;

  targetContainer.innerHTML = html;
  targetContainer.style.display = "block";
  targetContainer.scrollIntoView({ behavior: "smooth" });
}
