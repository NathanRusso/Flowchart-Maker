/**
 * This file handles all base logic that can be triggered by the toolbar buttons and dropdowns.
 */

//------------------------------ IMPORTS BELOW ------------------------------//

import * as match from "/js/match.js";
import * as load from "/js/load.js";
import * as popup from "/js/popup.js";

//------------------------------ DATA BELOW ------------------------------//

const defaultTitle = "GCCIS Flowcharts";

let transferSection = false;    // Whether or not the transfer section is visible

const pageTitle = document.getElementById("pageTitle");
const yearSelect = document.getElementById("yearSelect");
const fileInput = document.getElementById("fileInput");
const uploadTemplateButton = document.getElementById("uploadTemplateButton");
const downloadTemplateButton = document.getElementById("downloadTemplateButton");
const pushYearButton = document.getElementById("pushYearButton");
const popYearButton = document.getElementById("popYearButton");
const showTransferButton = document.getElementById("showTransferButton");
const hideTransferButton = document.getElementById("hideTransferButton");
const showCheckboxesButton = document.getElementById("showCheckboxesButton");
const hideCheckboxesButton = document.getElementById("hideCheckboxesButton");
const clearFlowchartButton = document.getElementById("clearFlowchartButton");

const transferYearDiv = document.getElementById("year-0");
const transferDividerDiv = document.getElementById("year-divider-0");
const allCheckboxes = document.getElementsByName("courseCheckbox");

const flowchartNotesTitle = document.getElementById("flowchartNotesTitle");

//------------------------------ EVENT LISTENERS BELOW ------------------------------//

yearSelect.addEventListener("change", (event) => updateTemplateFlowcharts(event.target.value));
load.templateSelect.addEventListener("change", (event) => getTemplateFlowchart(event.target.value));
fileInput.addEventListener("change", (event) => processUploadedFile(event.target.files[0]));
uploadTemplateButton.addEventListener("click", () => fileInput.click());
downloadTemplateButton.addEventListener("click", downloadTemplate);
pushYearButton.addEventListener("click", pushYear);
popYearButton.addEventListener("click", popYear);
showTransferButton.addEventListener("click", showTransferSection);
hideTransferButton.addEventListener("click", hideTransferSection);
showCheckboxesButton.addEventListener("click", showCheckboxes);
hideCheckboxesButton.addEventListener("click", hideCheckboxes);
clearFlowchartButton.addEventListener("click", () => clearFlowchart(defaultTitle, true, true));

//------------------------------ INITIALIZATION BELOW ------------------------------//

load.makeSortable(load.transferDiv);

// Fill the template dropdown with flowcharts from the current year
updateTemplateFlowcharts(yearSelect.value);

// Loads a pre-saved flowchart if it exists
displayLocalFlowchart()

//------------------------------ FUNCTIONS BELOW ------------------------------//

/**
 * Displays the local flowchart and its filename if they exists.
 */
export function displayLocalFlowchart() {
    const [filename, flowchart] = load.getLocalFlowchart();
    if (filename && flowchart) {
        load.setUploadedFilename(filename);
        generateFlowchartFromTemplate(filename, flowchart, true, false);
    }
}

/**
 * Updates the "Choose Template" dropdown with the templates from the selected year.
 * 
 * @param {string} year - the selected year to view templates form
 */
async function updateTemplateFlowcharts(year) {
    load.templateSelect.innerHTML = "";     // Clears the dropdown options

    // Adds back the empty option
    const emptyOption = Object.assign(document.createElement("option"), {
        textContent: "Choose Template",
        value: "",
    });
    load.templateSelect.append(emptyOption);

    // Gets the template file names
    const response = await fetch(`/json/templates/${year}/`);
    const result = await response.json();
    const filenames = result.map(file => file.name);

    // Creates all outGroups and options
    const outGroups = {};
    filenames.forEach(filename => {
        const filenameContent = filename.split("_");    // pathway_degree_...
        const [formattedPathway, formattedGroup] = match.getDisplayPathwayAndGroup(filenameContent[0]);
        if (formattedPathway == null || formattedGroup == null) return;
        const formattedDegree = filenameContent[0] === "ce" ? "" : (filenameContent[1] === "bs" ? "BS" : "BS/MS");

        const option = Object.assign(document.createElement("option"), {
            textContent: `${formattedPathway} ${formattedDegree}`.toUpperCase(),
            value: filename
        });

        if (!Object.hasOwn(outGroups, formattedGroup)) {
            const outGroup = document.createElement("optgroup");
            outGroup.label = formattedGroup;
            outGroups[formattedGroup] = outGroup;
        }
        outGroups[formattedGroup].append(option);
    });

    // Adds all outGroups to the dropdown
    load.templateSelect.append(...Object.values(outGroups));
}

/**
 * Uploads a flowchart using a preset template.
 * 
 * @param {string} filename - the template flowchart filename
 */
async function getTemplateFlowchart(filename) {
    if (!filename) { pageTitle.textContent = defaultTitle; return; };
    const year = yearSelect.value;
    const template  = (await import(`/json/templates/${year}/${filename}`, { with: { type: "json" } })).default;
    generateFlowchartFromTemplate(filename, template, false, true);
}

/**
 * Processes the uploaded flowchart file.
 * 
 * @param {*} file - the given flowchart file object
 */
async function processUploadedFile(file) {
    load.setUploadedFilename(file.name);
    const fileText = await file.text();
    const fileData = JSON.parse(fileText);
    generateFlowchartFromTemplate(file.name, fileData, true, false);
    fileInput.value = ""; // Makes sure the same file can be uploaded in a row
}

/**
 * Updates and populates the body given the json template flowchart.
 * Adds a Transfer section for transfer classes.
 * Adds years, each of which have 3 semesters that may or many not contain courses.
 * 
 * @param {string} - the flowchart filename
 * @param {*} template - the flowchart with transfer, year, semester, and course information
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function generateFlowchartFromTemplate(filename, template, resetChoose, resetUpload) {
    // Check JSON file formatting
    if (!template || typeof template != "object" || Array.isArray(template)
        || typeof template.title !== "string" ||  !Array.isArray(template.transfer) 
        || !Array.isArray(template.college) || !Array.isArray(template.notes)) {
        alert("The given JSON file does not meet the required formatting!");
        pageTitle.textContent = defaultTitle;
        return;
    }

    // Saves the current flowchart to local storage
    load.setLocalFlowchart(filename, template);

    // Generates the flowchart
    clearFlowchart(template.title, resetChoose, resetUpload);   // Removes the previous flowchart
    fillFlowchartTransferYear(template.transfer);               // Handles all transfer classes
    load.fillFlowchartYears(template.college);                  // Handles all other semesters and their classes
    fillFlowchartNotes(template.notes);                         // Handles the flowchart notes
    hideCheckboxesButton.style.display == "none" ? hideCheckboxes() : showCheckboxes();

    // Makes sure only the hyper classes linked to a selected option are shown
    load.initializeHyper()

    // Makes sure exotic option classes are set properly
    load.initializeExotic()
}

/**
 * Adds courses divs to the transfer div.
 * 
 * @param {*} transferInfo - The object containing the transfer course objects
 */
function fillFlowchartTransferYear(transferInfo) {
    transferInfo.forEach(courseInfo => {
        const courseDiv = load.createCourse(courseInfo);
        load.transferDiv.append(courseDiv);
    });
    if (transferInfo.length > 0) showTransferSection();
}

/**
 * Adds the notes to the flowchart notes section.
 * 
 * @param {*} notesInfo - the flowchart notes array
 */
function fillFlowchartNotes(notesInfo) {
    if (notesInfo.length == 0) {
        const noteItem = document.createElement("li");
        noteItem.innerHTML = "This flowchart has no saved notes. Edit this note to add your own.";
        load.flowchartNotesList.append(noteItem);
    } else {
        notesInfo.forEach(note => {
            const noteItem = document.createElement("li");
            noteItem.innerHTML = note;
            load.flowchartNotesList.append(noteItem);
        });
    }
}

/**
 * Converts the current flowchart into a JSON file and downloads it onto your computer.
 */
function downloadTemplate() {
    // Creates the JSON template, and converts it into the necessary format
    const json = load.generateTemplateFromFlowchart()
    const jsonString = JSON.stringify(json);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonObjectUrl = URL.createObjectURL(jsonBlob);

    // Gets and sets the flowchart filename
    const jsonFilename = load.getCurrentTemplateFilename()

    // Saves the current flowchart to local storage
    load.setLocalFlowchart(jsonFilename, json);

    // Saves the flowchart onto your computer
    const anchor = document.createElement("a");
    anchor.href = jsonObjectUrl;
    anchor.download = jsonFilename;
    anchor.click();
    URL.revokeObjectURL(jsonObjectUrl);
}

/**
 * Adds a new year div to the end of the body.
 */
function pushYear() {
    load.setAcademicYearCount(load.academicYearCount + 1);
    const yearCount = load.academicYearCount;

    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${yearCount}`;
    yearDiv.className = "year";

    const yearTextDiv = document.createElement("div");
    yearTextDiv.id = `year-text-${yearCount}`
    yearTextDiv.className = "year-text";
    yearTextDiv.textContent = yearCount <= 100 ? `${load.years[yearCount - 1]} Year` : `#${yearCount} Year`;
    yearDiv.append(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${yearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.append(yearBlockDiv);

    load.semesters.forEach(term => {
        const semesterDiv = document.createElement("div");
        semesterDiv.id = `${term}-${yearCount}`;
        semesterDiv.className = "semester";
        semesterDiv.dataset.term = term;
        load.makeSortable(semesterDiv);
        yearBlockDiv.append(semesterDiv);
    });
    load.flowchartBody.append(yearDiv);

    const yearDividerDiv = document.createElement("div");
    yearDividerDiv.id = `year-divider-${yearCount}`
    yearDividerDiv.className = "year-divider";
    load.flowchartBody.append(yearDividerDiv);

    // Saves the current flowchart to local storage.
    load.setLocalFlowchartDefault();
}

/**
 * Removes the year div at the end of the body.
 */
function popYear() {
    const yearCount = load.academicYearCount;
    if (yearCount == 0) return;
    const yearDiv = document.getElementById(`year-${yearCount}`);
    const yearDividerDiv = document.getElementById(`year-divider-${yearCount}`);
    if (yearIsEmpty(yearDiv)) {
        yearDiv.remove();
        yearDividerDiv.remove();
        load.setAcademicYearCount(load.academicYearCount - 1);

        // Saves the current flowchart to local storage.
        load.setLocalFlowchartDefault();
    } else {
        alert("The lowest year is not empty. Remove all courses before deleting it!");
    }
}

/**
 * Checks if the given year div has any courses inside of it.
 * 
 * @param {*} yearDiv - the given year div
 * @returns True if there are no courses in any of the year semesters, False otherwise.
 */
function yearIsEmpty(yearDiv) {
    const semesterDivs = yearDiv.children[1].children; // yearDiv => yearBlockDiv
    return (semesterDivs[0].children.length == 0 && 
        semesterDivs[1].children.length == 0 && 
        semesterDivs[2].children.length == 0);
}

/**
 * Shows the Transfer class section and shows the remove transfer button.
 */
function showTransferSection() {
    if (transferSection) return;
    transferDividerDiv.style.display = "revert";
    transferYearDiv.style.display = "flex";
    transferSection = true;
    showTransferButton.style.display = "none";
    hideTransferButton.style.display = "inline-block";
}

/**
 * Hides the Transfer class section and shows the add transfer button.
 */
function hideTransferSection() {
    if (!transferSection) return;
    transferDividerDiv.style.display = "none";
    transferYearDiv.style.display = "none";
    transferSection = false;
    showTransferButton.style.display = "inline-block";
    hideTransferButton.style.display = "none";
}

/**
 * Shows the checkboxes in the corner of courses.
 */
function showCheckboxes() {
    allCheckboxes.forEach(checkbox => checkbox.style.display = "inline-block");
    showCheckboxesButton.style.display = "none";
    hideCheckboxesButton.style.display = "inline-block";
}

/**
 * Hides the checkboxes in the corner of courses.
 */
function hideCheckboxes() {
    allCheckboxes.forEach(checkbox => checkbox.style.display = "none");
    showCheckboxesButton.style.display = "inline-block";
    hideCheckboxesButton.style.display = "none";
}

/**
 * Removes all courses and resets information back to the website default.
 * 
 * @param {string} title - the title to display at the top of the website
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function clearFlowchart(title, resetChoose, resetUpload) {
    // Updates the title at the top of the page
    pageTitle.textContent = title;

    // Displays or hides the "Flowchart Notes" section and removes its text content
    if (resetChoose && resetUpload) {
        flowchartNotesTitle.style.display = "None";
        load.flowchartNotesList.style.display = "None";
    } else {
        flowchartNotesTitle.style.display = "Block";
        load.flowchartNotesList.style.display = "Block";
    }
    load.flowchartNotesList.textContent = "";

    // Resets the "Choose Template" selector to the 1st option
    if (resetChoose) load.templateSelect.selectedIndex = 0;

    // Resets the uploaded filename
    if (resetUpload) load.setUploadedFilename(null);

    // Hides the course popup
    popup.hideCoursePopupQuick();

    // Hides the "Transfer" section and removes its courses
    hideTransferSection();
    load.transferDiv.replaceChildren();

    // Removes all years, semesters, and courses, and resets the academic year count
    const yearCount = load.academicYearCount;
    for (let i = 1; i <= yearCount; i++) {
        document.getElementById(`year-${i}`).remove();
        document.getElementById(`year-divider-${i}`).remove();
    }
    load.setAcademicYearCount(0);
}
