// File: script.js
// Body Fat Calculator – US Navy Method

(function () {
    const sexRadios = document.getElementsByName("sex");
    const hipRow = document.getElementById("hip-row");
    const calcBtn = document.getElementById("calc");
    const resetBtn = document.getElementById("reset");
    const copyBtn = document.getElementById("copy");
    const saveBtn = document.getElementById("save");
    const results = document.getElementById("results");

    // Get selected sex
    function getSex() {
        return Array.from(sexRadios).find((r) => r.checked).value;
    }

    // Show/Hide hip input (for female)
    Array.from(sexRadios).forEach((r) =>
        r.addEventListener("change", () => {
            hipRow.style.display = getSex() === "female" ? "block" : "none";
        })
    );

    // Simple error popup
    function showError(message) {
        alert(message);
    }

    // Calculate Body Fat %
    function calculate() {
        const sex = getSex();
        const age = Number(document.getElementById("age").value);
        const height = Number(document.getElementById("height").value);
        const weight = Number(document.getElementById("weight").value);
        const neck = Number(document.getElementById("neck").value);
        const waist = Number(document.getElementById("waist").value);
        const hip = Number(document.getElementById("hip").value);

        if (!height || !weight || !neck || !waist) {
            showError("Please fill in height, weight, neck and waist.");
            return;
        }
        if (sex === "female" && !hip) {
            showError("Please provide hip circumference for females.");
            return;
        }

        // Body density formulas (US Navy method)
        let density;
        try {
            if (sex === "male") {
                const v = waist - neck;
                if (v <= 0) throw new Error("Waist must be larger than neck.");
                density =
                    1.0324 - 0.19077 * Math.log10(v) + 0.15456 * Math.log10(height);
            } else {
                const v = waist + hip - neck;
                if (v <= 0) throw new Error("Waist + hip must be larger than neck.");
                density =
                    1.29579 - 0.35004 * Math.log10(v) + 0.22100 * Math.log10(height);
            }
        } catch (err) {
            showError(err.message || "Invalid measurements");
            return;
        }

        // Calculate body fat %
        const bodyFat = 495 / density - 450;
        const bfPct = Math.max(0, bodyFat);

        // BMI
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        // Lean mass
        const leanMass = weight * (1 - bfPct / 100);

        // Category
        const category = categorizeBF(bfPct, sex, age);

        // Show results
        document.getElementById("bf-percent").textContent = bfPct.toFixed(1) + " %";
        document.getElementById("bf-category").textContent = category;
        document.getElementById("bmi").textContent = bmi.toFixed(1);
        document.getElementById("lean-mass").textContent = leanMass.toFixed(1) + " kg";

        results.style.display = "block";
    }

    // Categorize body fat %
    function categorizeBF(pct, sex) {
        if (isNaN(pct)) return "—";
        const p = pct;
        if (sex === "male") {
            if (p < 6) return "Essential fat / Very low";
            if (p < 14) return "Athletes";
            if (p < 18) return "Fitness";
            if (p < 25) return "Average";
            return "Obese";
        } else {
            if (p < 14) return "Essential fat / Very low";
            if (p < 21) return "Athletes";
            if (p < 25) return "Fitness";
            if (p < 32) return "Average";
            return "Obese";
        }
    }

    // Event Listeners
    calcBtn.addEventListener("click", calculate);

    resetBtn.addEventListener("click", () => {
        document.getElementById("bf-form").reset();
        hipRow.style.display = getSex() === "female" ? "block" : "none";
        results.style.display = "none";
    });

    copyBtn.addEventListener("click", () => {
        const txt = `Body Fat: ${document.getElementById("bf-percent").textContent}
Category: ${document.getElementById("bf-category").textContent}
BMI: ${document.getElementById("bmi").textContent}`;
        navigator.clipboard
            ?.writeText(txt)
            .then(() => alert("Result copied to clipboard!"))
            .catch(() => showError("Unable to copy — browser may block clipboard access."));
    });

    saveBtn.addEventListener("click", () => {
        const text = `Body Fat Calculator Result

Sex: ${getSex()}
Age: ${document.getElementById("age").value}
Height: ${document.getElementById("height").value} cm
Weight: ${document.getElementById("weight").value} kg
Neck: ${document.getElementById("neck").value} cm
Waist: ${document.getElementById("waist").value} cm
Hip: ${document.getElementById("hip").value} cm

Body Fat: ${document.getElementById("bf-percent").textContent}
Category: ${document.getElementById("bf-category").textContent}
BMI: ${document.getElementById("bmi").textContent}
Lean Mass: ${document.getElementById("lean-mass").textContent}
`;

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bodyfat-result.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
})();
