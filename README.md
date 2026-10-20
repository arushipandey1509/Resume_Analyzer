#Resume Analyzer

ResumeAnalyzer is a web-based application that helps users analyze their resumes by identifying matching and missing skills against a predefined list of required skills. It provides a simple visual summary of skill coverage and recommendations to help users identify areas for improvement.

## 🚀 Features

- **Resume Upload:** Upload a resume in PDF or TXT format.
- **PDF Text Extraction:** Extract text from PDF resumes using PDF.js.
- **Skill Matching:** Compare extracted resume content against predefined skills using keyword matching and regular expressions.
- **Matched Skills:** Display skills identified in the resume.
- **Missing Skills:** Highlight required skills that were not found.
- **Skill Match Percentage:** Calculate and display the percentage of matched skills.
- **Visual Analytics:** Present skill analysis using charts powered by Chart.js.
- **Recommendations:** Help users identify skills they may need to improve or highlight.
- **Input Validation:** Validate uploaded files before processing.
- **Reset Functionality:** Clear the current analysis and start again.

## 🛠️ Technologies Used

- **HTML** – Structure of the application
- **CSS** – Styling and responsive user interface
- **JavaScript** – Application logic, file handling, and skill matching
- **PDF.js** – Extracting text from PDF resumes
- **Chart.js** – Visualizing skill analysis and results


## ⚙️ How It Works

1. The user uploads a resume in PDF or TXT format.
2. The application validates the selected file.
3. JavaScript reads the file and extracts its text. PDF.js is used for PDF files.
4. The extracted text is compared against a predefined list of required skills.
5. The application identifies matched and missing skills.
6. A skill-match percentage is calculated.
7. The results, charts, and recommendations are displayed to the user.

## 📊 Skill Matching Logic

ResumeLens uses keyword-based matching to compare the resume content with a predefined collection of skills.

For example, if the required skills are Java, SQL, and Python, and the resume contains Java and SQL:

- **Matched Skills:** Java, SQL
- **Missing Skills:** Python
- **Match Percentage:** 66.67%

The percentage is calculated as:

`(Number of Matched Skills / Total Required Skills) × 100`

## 💻 Getting Started

### Prerequisites

- A modern web browser
- A code editor such as Visual Studio Code
- An internet connection if the application loads PDF.js or Chart.js from a CDN

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Open the project folder:

   ```bash
   cd <your-project-folder>
   ```

3. Open `index.html` in your browser, or use the Live Server extension in Visual Studio Code.

No backend server or database is required for the current implementation.

## 🧪 Example Use Case

A user wants to check whether their resume covers the skills required for a technical role.

ResumeAnalyzer analyzes the resume, compares its text with the configured skill list, and displays the matched skills, missing skills, and overall match percentage. This helps the user identify potential gaps before applying for the role.

## ⚠️ Limitations

- Skill matching is based on keywords rather than semantic understanding.
- A skill may be detected even if it appears in a context that does not demonstrate practical experience.
- Results depend on the predefined skill list.
- The application does not use AI or machine learning to evaluate candidates.
- A missing skill means the keyword was not detected; it does not necessarily mean the user lacks that skill.

## 🔮 Future Enhancements

- Add role-specific skill lists for different technical positions.
- Support skill synonyms and related keywords.
- Improve text analysis to distinguish practical experience from simple keyword mentions.
- Add more detailed recommendations based on the selected job role.
- Explore NLP-based analysis for more context-aware skill matching.

## 🎯 Project Objective

The objective of ResumeAnalyzer is to make resume self-assessment easier by providing a quick overview of relevant skills, potential skill gaps, and areas for improvement.
