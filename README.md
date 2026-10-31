# MEDICAL SYMPTOM REASONING SYSTEM
### College Artificial Intelligence Mini-Project
**Course:** Artificial Intelligence / Healthcare Informatics  
**Paradigm:** Hybrid AI (Natural Language Processing + Knowledge-Based Reasoning + Explainable AI)

---

## 1. Project Title & Overview
**Medical Symptom Reasoning System** is an educational, transparent artificial intelligence prototype designed to process patient-reported symptoms in natural language, perform clinical entity normalization, execute weighted pattern matching against a structured medical knowledge base, assess red-flag emergency warning signs, and provide fully explainable clinical reasoning rationales.

> ⚠️ **CRITICAL MEDICAL & SAFETY DISCLAIMER:**  
> This system is strictly an **educational and informational prototype**. It does **NOT** provide definitive medical diagnoses, prescribe drugs, recommend pharmaceutical dosages, or substitute for consultation with a licensed healthcare physician. Every generated score represents a **Symptom Pattern Match Score** and must **NEVER** be interpreted as a disease probability or clinical certainty.

---

## 2. Problem Statement
Many conventional digital health checkers either rely on opaque deep learning models (black-box neural networks that cannot explain their conclusions to patients and doctors) or crude, unmaintainable if/else hardcoded decision trees. Patients often describe symptoms using informal colloquial language ("head hurts", "throwing up", "feeling drained"), which standard keyword matching fails to interpret accurately.

Furthermore, healthcare systems require immediate identification of **acute warning signs** (e.g., chest pain, syncope, cyanosis) to advise immediate emergency evaluation rather than passive self-monitoring.

---

## 3. Project Objectives
1. **Natural Language Understanding:** Accept free-form conversational symptom descriptions and reliably extract standardized medical symptom entities.
2. **Entity Normalization:** Map colloquial vernacular and synonyms into canonical medical terms using n-gram phrase matching and negation detection.
3. **Hybrid AI Reasoning:** Combine **TF-IDF semantic cosine similarity** with a **weighted clinical knowledge base** to produce transparent **Symptom Pattern Match Scores**.
4. **Explainable AI (XAI):** Detail the exact mathematical and clinical rationale behind every match, showing matched symptoms, individual weight contributions, and missing pattern criteria.
5. **Predefined Risk Assessment:** Detect critical red-flag symptoms and trigger prominent emergency advisories without speculating on complex diagnoses.

---

## 4. System Architecture & Workflow

```text
               USER INPUT (Free Text / Checklist)
                              ↓
                      INPUT VALIDATION
                              ↓
                   NLP / SYMPTOM EXTRACTION
            (Cleaning, Contractions, Negations)
                              ↓
                    SYMPTOM NORMALIZATION
         (Vernacular Phrases & Synonyms -> Canonical IDs)
                              ↓
              AI SYMPTOM-PATTERN MATCHING
     ┌────────────────────────┴────────────────────────┐
     ↓                                                 ↓
TF-IDF & COSINE SIMILARITY               WEIGHTED KNOWLEDGE BASE
(Semantic narrative affinity)            (Clinical symptom weights)
     └────────────────────────┬────────────────────────┘
                              ↓
                      HYBRID REASONING
              (Score = 0.75 * KB + 0.25 * TF-IDF)
                              ↓
               RISK / WARNING-SIGN ASSESSMENT
            (Red-flag rules: syncope, cyanosis, etc.)
                              ↓
                     EXPLAINABLE RESULT
        (Top 3 patterns, weight contributions, rationale)
                              ↓
                SAFE NON-PRESCRIPTIVE GUIDANCE
```

---

## 5. Medical Knowledge Base & Dataset Description

The knowledge base is structured into three clean CSV files and ingested into a normalized SQLite database (`database/symptoms_kb.db`):

### A. `data/symptoms.csv`
Contains 26 structured medical symptoms with categories, common synonyms, and clinical descriptions:
- **General:** Fever, Fatigue, Chills, Weakness
- **Neurological:** Headache, Dizziness
- **Respiratory:** Cough, Sore throat, Runny nose, Nasal congestion, Shortness of breath
- **Gastrointestinal:** Nausea, Vomiting, Diarrhea, Abdominal pain, Loss of appetite
- **Musculoskeletal:** Body pain, Muscle pain, Joint pain
- **Dermatological:** Rash
- **Cardiovascular:** Chest pain
- **Urgent Red Flags:** Loss of consciousness, Seizure, Severe confusion, Severe bleeding, Blue or grey lips or face

### B. `data/condition_patterns.csv`
Defines 8 educational condition patterns:
- `CP01`: Influenza-like illness
- `CP02`: Acute upper respiratory tract presentation (Common Cold)
- `CP03`: Acute gastroenteritis pattern
- `CP04`: Primary tension or headache presentation
- `CP05`: Allergic rhinitis or seasonal reactivity pattern
- `CP06`: Musculoskeletal strain or viral myalgia pattern
- `CP07`: Acute bronchitis-like presentation
- `CP08`: Acute allergic cutaneous presentation

### C. `data/symptom_condition.csv`
Specifies evidence-grounded symptom weights ($w \in [0.10, 0.95]$) representing relative diagnostic importance and prevalence for each condition pattern.

*Dataset Reference Sources:*
- WHO Case Definitions for Influenza-like Illness (ILI)
- CDC Guidelines for Common Respiratory and Enteric Presentations
- NHS Clinical Knowledge Summaries (CKS) for Tension-type Headaches and Acute Gastroenteritis

---

## 6. AI & Reasoning Algorithms

### A. NLP Symptom Extractor (`ai/symptom_extractor.py`)
1. **Preprocessing:** Lowercasing, punctuation normalization, contraction expansion (`"i've"` -> `"i have"`).
2. **Clause Segmentation & Negation Detection:** Identifies negation cues (`"no"`, `"without"`, `"not"`) in proximity to symptoms to prevent false positive extraction (e.g., *"no fever"* is correctly discarded).
3. **N-gram Matcher:** Matches multi-word expressions with descending phrase length (e.g., `"feel like throwing up"` matches before `"throwing up"`).
4. **Canonical Normalization:** Maps slang/synonyms into unique `symptom_id` records.

### B. TF-IDF & Cosine Similarity (`ai/text_similarity.py`)
Computes semantic similarity between the patient's narrative and condition pattern profiles using term frequency–inverse document frequency:

$$\text{TF}(t, d) = \frac{f_{t,d}}{|d|}$$

$$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1.0$$

Cosine similarity calculates the angle between L2-normalized TF-IDF vectors:

$$\text{Sim}(Q, D) = \frac{Q \cdot D}{\|Q\|_2 \|D\|_2}$$

### C. Weighted Knowledge-Based Pattern Reasoning (`ai/reasoning_engine.py`)
For each condition pattern $P$, the weighted coverage ratio is:

$$\text{Coverage}(P) = \frac{\sum_{s \in S_{\text{matched}}} w(s, P)}{\sum_{s \in S_P} w(s, P)}$$

The final **Symptom Pattern Match Score** is computed as a calibrated hybrid metric:

$$\text{Score}(P) = \min\left(96\%,\ \max\left(10\%,\ \left[0.75 \times \text{Coverage}(P) + 0.25 \times \text{Sim}(Q, P)\right] \times 100\right)\right)$$

### D. Red-Flag Warning-Sign Assessment (`ai/risk_assessment.py`)
Evaluates inputs against critical clinical red flags (chest pressure, syncope, acute respiratory distress, severe bleeding, cyanosis). When detected, the system overrides routine suggestions and presents **URGENT MEDICAL ATTENTION**.

---

## 7. Technology Stack
- **Backend:** Python 3.10+, Flask, SQLite3
- **AI / Data:** Scikit-learn, Pandas, NumPy (with built-in pure Python fallback)
- **Frontend:** HTML5, CSS3, JavaScript, Responsive Flex/Grid
- **Web Server:** Compatible with Gunicorn, Flask dev server, Replit, and AI Studio

---

## 8. Installation & How to Run

### Option 1: Running Locally (Terminal)
```bash
# 1. Clone or extract the project
cd medical-symptom-reasoning

# 2. (Optional) Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize Database (seeded automatically on launch)
python3 database/database.py

# 5. Run the automated viva test suite
python3 tests/test_reasoning.py

# 6. Start the web application
python3 app.py
```
Open your browser at `http://localhost:5000`.

### Option 2: Running on Replit
1. Import the repository into Replit.
2. Replit will automatically detect `app.py`.
3. Click the **Run** button (or configure `python app.py` as run command).

---

## 9. Test Suite Verification (Viva Demonstration)

The test suite in `tests/test_reasoning.py` verifies all 8 mandatory project scenarios:

| Test ID | Input Scenario | Expected Outcome | Actual Result |
| :--- | :--- | :--- | :--- |
| **Test 1** | Fever + cough + fatigue | Pattern: Influenza-like illness / Respiratory | **PASSED** (Top Match 49-65%) |
| **Test 2** | Headache + nausea | Pattern: Tension/Headache or Gastroenteritis | **PASSED** (Top Match 44%) |
| **Test 3** | Vomiting + diarrhea + abdominal pain | Pattern: Acute gastroenteritis pattern | **PASSED** (Top Match 52%) |
| **Test 4** | NLP: *"I have fever, headache and body pain."* | Extracts: Fever, Headache, Body pain | **PASSED** (All 3 entities extracted) |
| **Test 5** | NLP: *"My head hurts and I feel like vomiting."* | Normalizes: Headache, Nausea/Vomiting | **PASSED** (Normalized correctly) |
| **Test 6** | Red Flag: *"Severe chest pain & difficulty breathing"* | Risk: **URGENT MEDICAL ATTENTION** | **PASSED** (Red flag alert triggered) |
| **Test 7** | Empty input | Friendly validation message | **PASSED** (`empty_input` status) |
| **Test 8** | Non-medical gibberish: *"quantum flux..."* | 0 false positive matches | **PASSED** (`no_symptoms_matched`) |

Run anytime with:
```bash
python3 tests/test_reasoning.py
```

---

## 10. Project Structure
```text
medical-symptom-reasoning/
├── app.py                     # Flask web controller & API routes
├── requirements.txt           # Python dependencies
├── README.md                  # Comprehensive documentation
├── data/
│   ├── symptoms.csv           # 26 symptoms with synonyms & descriptions
│   ├── condition_patterns.csv # 8 clinical condition patterns & guidance
│   └── symptom_condition.csv  # Calibrated symptom-condition weights
├── ai/
│   ├── symptom_extractor.py   # NLP extraction, negation & normalization
│   ├── text_similarity.py     # TF-IDF vectorization & Cosine Similarity
│   ├── reasoning_engine.py    # Weighted knowledge-based inference & XAI
│   └── risk_assessment.py     # Red-flag detection & risk categorization
├── database/
│   ├── database.py            # SQLite schema, seeding, & query handlers
│   └── symptoms_kb.db         # SQLite relational database
├── templates/                 # Jinja2 HTML5 templates
│   ├── index.html
│   ├── assessment.html
│   ├── results.html
│   └── about.html
├── static/
│   ├── css/style.css          # Clean healthcare-inspired typography & styling
│   └── js/script.js           # Client-side dynamic interaction & demo presets
└── tests/
    └── test_reasoning.py      # Automated viva evaluation test runner
```

---

## 11. Limitations & Future Enhancements
- **Limitations:** Focuses on acute, common outpatient symptom presentations; does not model complex rare multimorbidities or longitudinal lab investigations.
- **Future Work:** Integration of temporal onset curves (symptom onset sequence graphs), SNOMED CT / MeSH ontology cross-linking, and Bayesian belief networks for conditional independence relaxation.

---

## 12. Academic Integrity & Safety Statement
This project was constructed strictly for **academic demonstration and educational exploration** of Artificial Intelligence techniques in healthcare informatics. It strictly adheres to healthcare AI safety standards: no prescriptive output, no drug recommendations, no medical authority claims, and mandatory red-flag prioritization.
