const jobSkills = {
    "Frontend Developer": ["html", "css", "javascript", "react", "bootstrap"],
    "Backend Developer": ["c++", "java", "sql", "api", "database"],
    "Data Analyst": ["python", "sql", "excel", "powerbi", "statistics"]
};

async function extractTextFromPDF(file) {
    const reader = new FileReader();

    return new Promise((resolve) => {
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => {
                    text += item.str + " ";
                });
            }
            resolve(text.toLowerCase());
        };
        reader.readAsArrayBuffer(file);
    });
}

async function analyzeResume() {
    const fileInput = document.getElementById("resumeInput");
    const role = document.getElementById("jobRole").value;

    if (!fileInput.files.length || !role) {
        alert("Upload resume & select role");
        return;
    }

    const file = fileInput.files[0];
    let text = "";

    if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
    } else {
        text = await file.text();
        text = text.toLowerCase();
    }

    const requiredSkills = jobSkills[role];

    let matched = [];
    let missing = [];

    requiredSkills.forEach(skill => {
        if (text.includes(skill)) matched.push(skill);
        else missing.push(skill);
    });

    const percent = Math.round((matched.length / requiredSkills.length) * 100);

    displayResults(percent, matched, missing, text);
    drawChart(matched.length, missing.length);
}

function displayResults(percent, matched, missing, text) {

    let sectionScore = 0;
    const sections = ["project", "internship", "certification"];

    sections.forEach(sec => {
        if (text.includes(sec)) sectionScore++;
    });

    document.getElementById("output").innerHTML = `
        <h2>Match Score: ${percent}%</h2>
        <p><strong>Matched Skills:</strong> ${matched.join(", ") || "None"}</p>
        <p><strong>Missing Skills:</strong> ${missing.join(", ") || "None"}</p>
        <p><strong>Resume Strength Score:</strong> ${sectionScore}/3</p>
        <p><strong>Recommendation:</strong> Improve missing skills & add strong projects.</p>
    `;
}

function drawChart(matched, missing) {
    const ctx = document.getElementById('skillChart');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Matched Skills', 'Missing Skills'],
            datasets: [{
                data: [matched, missing],
                backgroundColor: ['#2ecc71', '#e74c3c']
            }]
        }
    });
}
