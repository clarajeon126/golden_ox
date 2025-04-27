function createSteps({
    isMedical,
    isConscious,
    noBreathing,
    yesCPR,
    priority,
    medications = [], // <-- now an array of meds
    traumaType,
    patientWeightKg,
    age,
    isPregnant = false,
    cardiacHistory = []
  }) {
    const steps = [];
  
    // --- Helper Functions ---
  
    function sceneSizeUp() {
      steps.push(["User asks if the scene is safe."]);
      steps.push([
        "User wears appropriate BSI/PPE.",
        "User determines the number of patients.",
        `User identifies ${isMedical ? "Nature of Illness (NOI)" : "Mechanism of Injury (MOI)"}.`,
        "User calls for additional resources if needed.",
        `User ${isMedical ? "does NOT" : "does"} consider spinal precautions (C-spine).`
      ]);
    }
  
    function primaryAssessment() {
      steps.push([
        "User forms general impression of the patient.",
        "User assesses Level of Consciousness using AVPU scale.",
        "User determines chief complaint or apparent life threats."
      ]);
  
      if (isConscious) {
        steps.push([
          "User assesses airway status.",
          "User assesses breathing status.",
        ]);
        if (noBreathing) {
          steps.push([
            "User provides oxygen therapy.",
            "User selects correct oxygen delivery device (NRB mask).",
            "User sets oxygen flow to 15 LPM.",
            "User reassesses patient's breathing after oxygen administration."
          ]);
        }
        steps.push(["User assesses circulation (pulse, skin, major bleeding)."]);
      } else {
        steps.push([
          "User immediately assesses circulation (pulse, skin, major bleeding)."
        ]);
        if (yesCPR) {
          steps.push([
            "User begins high-quality CPR immediately.",
            "User requests AED and prepares for use.",
            "User correctly identifies compression-to-breath ratio."
          ]);
        } else {
          steps.push([
            "User opens airway using jaw-thrust (if trauma) or head-tilt chin-lift (if no trauma).",
            "User assesses breathing and provides oxygen if needed."
          ]);
        }
      }
  
      steps.push([`User determines patient transport priority: Priority ${priority}.`]);
    }
  
    function secondaryAssessment() {
      if (isMedical) {
        steps.push([
          "User obtains SAMPLE history.",
          "User performs OPQRST pain assessment if appropriate.",
          "User obtains baseline vital signs (BP, HR, RR, SpO2, Pain scale)."
        ]);
  
        if (medications.length > 0) {
          medications.forEach(med => medicationAdministration(med));
        }
      } else {
        traumaManagement();
      }
    }
  
    function medicationAdministration(med) {
      const meds = {
        oxygen: { requiresDirection: false },
        aspirin: { requiresDirection: false },
        nitroglycerin: { requiresDirection: true },
        epinephrine: { requiresDirection: false },
        albuterol: { requiresDirection: false },
        narcan: { requiresDirection: false },
        oralGlucose: { requiresDirection: false },
        activatedCharcoal: { requiresDirection: false },
        acetaminophen: { requiresDirection: false }
      };
  
      const medInfo = meds[med.name.toLowerCase()];
  
      if (!medInfo) {
        steps.push([`(Unknown medication: ${med.name})`]);
        return;
      }
  
      // Prompt RPMDDD
      steps.push(["User states 5 rights of medication administration (RPMDDD)."]);
  
      // Confirm indication
      steps.push([`User correctly identifies indication for ${med.name}.`]);
  
      if (medInfo.requiresDirection || med.needsMedicalDirection) {
        steps.push(["User contacts medical direction for permission to administer medication."]);
      }
  
      // Administer medication
      steps.push([
        `User administers correct dose of ${med.name}: ${med.dose}.`,
        `User uses correct route: ${med.route}.`
      ]);
  
      // Reassess after medication
      steps.push(["User reassesses patient after medication administration."]);
    }
  
    function traumaManagement() {
      steps.push([
        "User conducts full body trauma assessment (DCAP-BTLS).",
        "User manages major bleeding, airway, and shock immediately."
      ]);
  
      if (traumaType === "evisceration") {
        steps.push([
          "User covers eviscerated organs with moist sterile dressing.",
          "User covers moist dressing with occlusive plastic wrap.",
          "User keeps patient warm and initiates rapid transport."
        ]);
      }
      if (traumaType === "suckingChestWound") {
        steps.push([
          "User applies occlusive dressing taped on three sides (flutter valve).",
          "User monitors for signs of tension pneumothorax."
        ]);
      }
      if (["bentKneeFracture", "closedFemurFracture", "openFracture"].includes(traumaType)) {
        steps.push([
          "User checks Pulse, Motor, Sensation (PMS) before splinting.",
          "User applies manual stabilization to the injured limb.",
          "User applies splint appropriate to injury.",
          "User reassesses PMS after splinting."
        ]);
      }
      if (traumaType === "pelvicFracture") {
        steps.push([
          "User applies pelvic binder or commercial splint.",
          "User minimizes movement of pelvis."
        ]);
      }
      if (traumaType === "headInjury") {
        steps.push([
          "User monitors Glasgow Coma Scale (GCS) score.",
          "User maintains airway and rapid transports if GCS deteriorates."
        ]);
      }
      if (traumaType === "spinalInjury") {
        steps.push([
          "User manually stabilizes C-spine.",
          "User applies cervical collar appropriately.",
          "User secures patient to longboard if necessary."
        ]);
      }
    }
  
    function transportPhase() {
      steps.push([
        "User makes final transport decision based on patient's condition.",
        "User prepares patient for transport (stretcher, immobilization as needed).",
        "User delivers comprehensive handoff report to receiving hospital."
      ]);
    }
  
    // --- Main Build ---
  
    sceneSizeUp();
    primaryAssessment();
    secondaryAssessment();
    transportPhase();
  
    return steps;
  }
  
  const steps = createSteps({
    isMedical: true,
    isConscious: true,
    noBreathing: false,
    yesCPR: false,
    priority: 2,
    medications: [
      { name: "aspirin", dose: "325 mg", route: "PO", needsMedicalDirection: false },
      { name: "nitroglycerin", dose: "0.4 mg", route: "SL", needsMedicalDirection: true }
    ],
    traumaType: null,
    patientWeightKg: 101,
    age: 80,
    isPregnant: false,
    cardiacHistory: ["Coronary Artery Disease", "Atrial Fibrillation", "Cardiac Stent", "Quadruple Bypass"]
  });

    console.log(steps);