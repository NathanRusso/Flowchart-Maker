//------------------------------ IMPORTS ------------------------------//
import * as load from "/js/load.js";
import * as color from "/js/color.js";

//------------------------------ DATA BELOW ------------------------------//

// The 4 course types are "co-op", "required", "option", and "input"
// I added the "General Education: Immersion", "Lab Science: Lab", "Lab Science: Lecture", "Open Elective", etc. attributes

const defaultTitle = "GCCIS 2025-2026 Flowchart";

let academicYearCount = 0;      // The numbers of years of school currently being listed.
let transferSection = false;    // Whether or not the transfer section is visible.
let uploadedFilename = null;    // The filename of the uploaded file.

const body = document.body;
const pageTitle = document.getElementById("pageTitle");
const fileInput = document.getElementById("fileInput");
const templateSelect = document.getElementById("templateSelect");
const uploadTemplateButton = document.getElementById("uploadTemplateButton");
const downloadTemplateButton = document.getElementById("downloadTemplateButton");
const pushYearButton = document.getElementById("pushYearButton");
const popYearButton = document.getElementById("popYearButton");
const showTransferButton = document.getElementById("showTransferButton");
const hideTransferButton = document.getElementById("hideTransferButton");
const showCheckboxesButton = document.getElementById("showCheckboxesButton");
const hideCheckboxesButton = document.getElementById("hideCheckboxesButton");
const clearFlowchartButton = document.getElementById("clearFlowchartButton");

const coursePopup = document.getElementById("coursePopup");
const coursePopupTitle = document.getElementById("coursePopupTitle");
const coursePopupDescription = document.getElementById("coursePopupDescription");
const coursePopupPrerequisites = document.getElementById("coursePopupPrerequisites");

const flowchartBody = document.getElementById("flowchartBody");
const transferYearDiv = document.getElementById("year-0");
const transferDiv = document.getElementById("transfer");
const transferDividerDiv = document.getElementById("year-divider-0");
const allCheckboxes = document.getElementsByName("courseCheckbox");
load.makeSortable(transferDiv);

const flowchartNotesList = document.getElementById("flowchartNotesList");

//------------------------------ EVENT LISTENERS BELOW ------------------------------//

templateSelect.addEventListener("change", (event) => getTemplateFlowchart(event.target.value));
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

//------------------------------ FUNCTIONS BELOW ------------------------------//

/**
 * This uploads a flowchart using a preset template.
 * 
 * @param {*} filename - the template flowchart filename
 */
async function getTemplateFlowchart(filename) {
    if (!filename) { pageTitle.textContent = defaultTitle; return; };
    const template  = (await import(`/json/templates/${filename}`, { with: { type: "json" } })).default;
    processFlowchart(template, false, true);
}

/**
 * This processes the uploaded flowchart file.
 * 
 * @param {*} file - the given flowchart file object
 */
async function processUploadedFile(file) {
    uploadedFilename = file.name;
    const fileText = await file.text();
    const fileData = JSON.parse(fileText);
    processFlowchart(fileData, true, false);
    fileInput.value = ""; // Makes sure the same file can be uploaded in a row
}

/**
 * This updates and populates the body given the json template flowchart.
 * This adds a Transfer section for transfer classes.
 * It then adds years, each of which has 3 semesters that may or many not contain courses.
 * 
 * @param {*} template - the flowchart with transfer, year, semester, and course information
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function processFlowchart(template, resetChoose, resetUpload) {
    // Check JSON file formatting
    if (!template || typeof template != "object" || Array.isArray(template)
        || typeof template.title !== "string" ||  !Array.isArray(template.transfer) 
        || !Array.isArray(template.college) || !Array.isArray(template.notes)) {
        alert("The given JSON file does not meet the required formatting.");
        pageTitle.textContent = defaultTitle;
        return;
    }

    const title = template.title;
    const transferCourses = template.transfer;
    const years = template.college;
    const notes = template.notes;

    clearFlowchart(title, resetChoose, resetUpload);                            // This removes the previous flowchart
    load.fillTransferYear(transferCourses);                                     // This handles all transfer classes
    years.forEach(yearInfo => load.createYear(yearInfo, ++academicYearCount));  // This handles all other semesters and their classes
    fillFlowchartNotes(notes);                                                  // This handles the flowchart notes
    hideCheckboxesButton.style.display == "none" ? hideCheckboxes() : showCheckboxes();

    // This makes sure only the hyper classes linked to a selected option are shown
    load.initializeHyper()

    // This makes sure exotic option classes are set properly
    load.initializeExotic()
}

/**
 * This adds the notes to the flowchart notes section.
 * 
 * @param {*} notesInfo - the flowchart notes array
 */
function fillFlowchartNotes(notesInfo) {
    if (notesInfo.length == 0) {
        const noteItem = document.createElement("li");
        noteItem.innerHTML = "This flowchart has no saved notes. Edit this note and add more.";
        flowchartNotesList.append(noteItem);
    } else {
        notesInfo.forEach(note => {
            const noteItem = document.createElement("li");
            noteItem.innerHTML = note;
            flowchartNotesList.append(noteItem);
        });
    }
}

/**
 * This converts the current flowchart into JSON and downloads it onto your computer.
 */
function downloadTemplate() {
    const transfer = [];
    const college = [];
    const notes = [];

    // Process transfer classes
    Array.from(transferDiv.children).forEach(courseDiv => {
        const course = processCourse(courseDiv);
        transfer.push(course);
    });

    // Process remaining classes
    for (let i = 1; i <= academicYearCount; i++) {
        const year = [];
        const yearDiv = document.getElementById(`year-block-${i}`);
        Array.from(yearDiv.children).forEach(semesterDiv => {
            const semester = [];
            Array.from(semesterDiv.children).forEach(courseDiv => {
                const course = processCourse(courseDiv);
                semester.push(course);
            });
            year.push(semester);
        });
        college.push(year);
    }

    // Process notes
    Array.from(flowchartNotesList.children).forEach(listItem => {
        const note = listItem.innerHTML.replace("&amp;", "&");
        notes.push(note);
    });

    // Creates and downloads the JSON file
    const json = {
        "title": pageTitle.textContent,
        "transfer": transfer,
        "college": college,
        "notes": notes
    };
    const jsonString = JSON.stringify(json);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonObjectUrl = URL.createObjectURL(jsonBlob);
    const selectValue = templateSelect.value;
    let jsonFilename;
    if (selectValue) {
        jsonFilename = templateSelect.value;
    } else if (uploadedFilename) {
        jsonFilename = uploadedFilename;
    } else {
        jsonFilename = "template.json";
    }
    const anchor = document.createElement("a");
    anchor.href = jsonObjectUrl;
    anchor.download = jsonFilename;
    anchor.click();
    URL.revokeObjectURL(jsonObjectUrl);
}

/**
 * This turns the given course div back into an object for flowchart downloading.
 * 
 * @param {*} courseDiv - the given course Div
 */
function processCourse(courseDiv) {
    let course = {};

    // Get all possible data
    const courseType = courseDiv.dataset.courseType;
    const courseContent = courseDiv.textContent;
    const courseDiscipline = courseDiv.dataset?.courseDiscipline;
    let courseNumber = courseDiv.dataset?.courseNumber;
    if (courseNumber.at(-1) !== "H") courseNumber = Number(courseNumber); // Accounts for Honors courses
    const courseName = courseDiv.dataset?.courseName;
    const courseAttribute = courseDiv.dataset?.courseAttribute;
    const courseHyperParentId = Number(courseDiv.dataset?.courseHyperParentId);
    const courseHyperChildId = Number(courseDiv.dataset?.courseHyperChildId);
    const courseExoticId = Number(courseDiv.dataset?.courseExoticId);
    const courseOfferedOnlyFall = courseDiv.style.borderStyle === "dotted";
    const courseOfferedOnlySpring = courseDiv.style.borderStyle === "dashed";

    switch (courseType) {
        case "co-op-required": {
            course = {
                "courseType": courseType,
                "discipline": courseDiscipline,
                "number": courseNumber,
                "name": courseName
            };
            break;
        }
        case "co-op-option": {
            const select = courseDiv.children[0];                       // Select
            const options = select.options;                             // Options
            const createdOptions = [];
            Array.from(options).forEach(option => {
                const optionNumber = option.dataset.optionNumber;
                const optionObject = {
                    "discipline": option.dataset.optionDiscipline,
                    "number": optionNumber.at(-1) === "H" ? optionNumber : Number(optionNumber),
                    "name": option.value,
                }
                createdOptions.push(optionObject);
            });

            course = {
                "courseType": courseType,
                "selectedIndex": select.selectedIndex,
                "options": createdOptions
            };
            break;
        }
        case "class-required": {
            course = {
                "courseType": courseType,
                "discipline": courseDiscipline,
                "number": courseNumber,
                "name": courseName
            };
            break;
        }
        case "class-input": {
            const inputs = courseDiv.children[1].value.split(/[\-]+/);  // Input
            course = {
                "courseType": courseType,
                "discipline": inputs[0],
                "number": inputs.length == 2 && inputs[1].at(-1) === "H" ? inputs[1] : Number(inputs[1]),
                "attribute": courseAttribute
            };
            break;
        }
        case "class-option-mix": {
            const select = courseDiv.children[0];                       // Select
            const options = select.options;                             // Options

            const createdOptions = [];
            let inputIndex = 2
            Array.from(options).forEach((option, index) => {
                const optionInfo = option.textContent.split(/[\-]+/);
                const optionAttribute = option.dataset.optionAttribute;
                const optionHyperChildId = Number(option.dataset.optionHyperChildId);
                const validOptionHyperParentId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 1;
                let optionObject = {}
                if (!optionAttribute) {
                    optionObject = {
                        "discipline": optionInfo[0],
                        "number": optionInfo[1].at(-1) === "H" ? optionInfo[1] : Number(optionInfo[1]),
                        "name": option.value,
                    }
                } else {
                    const inputs = courseDiv.children[inputIndex++].value.split(/[\-]+/);  // Input
                    optionObject = {
                        "discipline": inputs[0],
                        "number": inputs.length == 2 && inputs[1].at(-1) === "H" ? inputs[1] : Number(inputs[1]),
                        "attribute": optionAttribute,
                    }
                }
                if (validOptionHyperParentId) optionObject["hyperChildId"] = optionHyperChildId;
                createdOptions.push(optionObject);
            });

            course = {
                "courseType": courseType,
                "selectedIndex": select.selectedIndex,
                "options": createdOptions
            };
            break;
        }
        case "class-option-attribute": {
            const select = courseDiv.children[1];                       // Select
            const options = select.options;                             // Options

            const createdOptions = [];
            Array.from(options).forEach(option => {
                const optionInfo = option.textContent.split(/[\-]+/);
                let optionObject = {
                    "discipline": optionInfo[0],
                    "number": optionInfo[1].at(-1) === "H" ? optionInfo[1] : Number(optionInfo[1]),
                    "name": option.value,
                }
                const optionAttribute = option.dataset?.optionAttribute;
                if (optionAttribute) optionObject["attribute"] = optionAttribute;
                createdOptions.push(optionObject);
            });

            course = {
                "courseType": courseType,
                "attribute": courseAttribute,
                "selectedIndex": select.selectedIndex,
                "options": createdOptions
            };

            // Assign exotic id if it exists
            if (courseExoticId) course["exoticId"] = courseExoticId;        // 0 is false
            break;
        }
        default:
            console.log(`A course was found with an unknown type: ${courseType}.`);
            break;
    }

    // Assign extra fields if they exists
    if (courseHyperParentId) course["hyperParentId"] = courseHyperParentId; // 0 is false
    if (courseHyperChildId) course["hyperChildId"] = courseHyperChildId;    // 0 is false
    if (courseOfferedOnlyFall || courseOfferedOnlySpring) {
        course["offeredFall"] = courseOfferedOnlyFall;
        course["offeredSpring"] = courseOfferedOnlySpring;
    }
    course["completed"] = courseDiv.children.courseCheckbox.checked;

    return course;
}

/**
 * This adds a new year div to the end of the body.
 */
function pushYear() {
    ++academicYearCount;

    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${academicYearCount}`;
    yearDiv.className = "year";

    const yearTextDiv = document.createElement("div");
    yearTextDiv.id = `year-text-${academicYearCount}`
    yearTextDiv.className = "year-text";
    yearTextDiv.textContent = academicYearCount <= 100 ? `${load.years[academicYearCount - 1]} Year` : `#${academicYearCount} Year`;
    yearDiv.append(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.append(yearBlockDiv);

    load.semesters.forEach(term => {
        const semesterDiv = document.createElement("div");
        semesterDiv.id = `${term}-${academicYearCount}`;
        semesterDiv.className = "semester";
        yearBlockDiv.append(semesterDiv);
    });
    flowchartBody.append(yearDiv);

    const yearDividerDiv = document.createElement("div");
    yearDividerDiv.id = `year-divider-${academicYearCount}`
    yearDividerDiv.className = "year-divider";
    flowchartBody.append(yearDividerDiv);
}

/**
 * This removes the year div at the end of the body.
 */
function popYear() {
    if (academicYearCount == 0) return;
    const yearDiv = document.getElementById(`year-${academicYearCount}`);
    const yearDividerDiv = document.getElementById(`year-divider-${academicYearCount}`);
    if (yearIsEmpty(yearDiv)) {
        yearDiv.remove();
        yearDividerDiv.remove();
        academicYearCount--;
    } else {
        alert("The lowest year is not empty. Remove all courses before deleting it.");
    }
}

/**
 * This checks if the given year div has any courses inside of it.
 * 
 * @param {*} yearDiv - the given year div
 * @returns True if there are no courses in any of the year semesters, False otherwise.
 */
function yearIsEmpty(yearDiv) {
    const semesterDivs = yearDiv.children[1].children; // yearDiv => yearBlockDiv
    return semesterDivs[0].children.length == 0 && semesterDivs[1].children.length == 0 && semesterDivs[2].children.length == 0;
}

/**
 * This shows the Transfer Class section and shows the remove transfer button.
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
 * This hides the Transfer Class section and shows the add transfer button.
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
 * This shows the checkboxes in the corner of courses.
 */
function showCheckboxes() {
    allCheckboxes.forEach(checkbox => checkbox.style.display = "inline-block");
    showCheckboxesButton.style.display = "none";
    hideCheckboxesButton.style.display = "inline-block";
}

/**
 * This hides the checkboxes in the corner of courses.
 */
function hideCheckboxes() {
    allCheckboxes.forEach(checkbox => checkbox.style.display = "none");
    showCheckboxesButton.style.display = "inline-block";
    hideCheckboxesButton.style.display = "none";
}

/**
 * This removed all courses and sections.
 * 
 * @param {string} title - the title to display at the top of the flowchart
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function clearFlowchart(title, resetChoose, resetUpload) {
    pageTitle.textContent = title;                      // Sets the title
    if (resetChoose) templateSelect.selectedIndex = 0;  // Resets the "Choose Template" selector to the 1st option.
    if (resetUpload) uploadedFilename = null;           // Resets the name of the uploaded file
    transferDiv.replaceChildren();                      // Removes all transfer courses
    hideTransferSection();
    for (let i = 1; i <= academicYearCount; i++) {
        document.getElementById(`year-${i}`).remove();
        document.getElementById(`year-divider-${i}`).remove();
    }
    flowchartNotesList.textContent = "";                // Gets rid of the flowchart notes
    academicYearCount = 0;                              // Resets the year count
}
