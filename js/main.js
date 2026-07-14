//------------------------------ STATIC DATA BELOW ------------------------------//

// The 4 course types are "co-op", "required", "option", and "input"
// I added the "General Education: Immersion", "Lab Science: Lab", "Lab Science: Lecture", "Open Elective", etc. attributes

const years = [
  "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
  "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth",
  "Twenty-First", "Twenty-Second", "Twenty-Third", "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh", "Twenty-Eighth", "Twenty-Ninth", "Thirtieth",
  "Thirty-First", "Thirty-Second", "Thirty-Third", "Thirty-Fourth", "Thirty-Fifth", "Thirty-Sixth", "Thirty-Seventh", "Thirty-Eighth", "Thirty-Ninth", "Fortieth",
  "Forty-First", "Forty-Second", "Forty-Third", "Forty-Fourth", "Forty-Fifth", "Forty-Sixth", "Forty-Seventh", "Forty-Eighth", "Forty-Ninth", "Fiftieth",
  "Fifty-First", "Fifty-Second", "Fifty-Third", "Fifty-Fourth", "Fifty-Fifth", "Fifty-Sixth", "Fifty-Seventh", "Fifty-Eighth", "Fifty-Ninth", "Sixtieth",
  "Sixty-First", "Sixty-Second", "Sixty-Third", "Sixty-Fourth", "Sixty-Fifth", "Sixty-Sixth", "Sixty-Seventh", "Sixty-Eighth", "Sixty-Ninth", "Seventieth",
  "Seventy-First", "Seventy-Second", "Seventy-Third", "Seventy-Fourth", "Seventy-Fifth", "Seventy-Sixth", "Seventy-Seventh", "Seventy-Eighth", "Seventy-Ninth", "Eightieth",
  "Eighty-First", "Eighty-Second", "Eighty-Third", "Eighty-Fourth", "Eighty-Fifth", "Eighty-Sixth", "Eighty-Seventh", "Eighty-Eighth", "Eighty-Ninth", "Ninetieth",
  "Ninety-First", "Ninety-Second", "Ninety-Third", "Ninety-Fourth", "Ninety-Fifth", "Ninety-Sixth", "Ninety-Seventh", "Ninety-Eighth", "Ninety-Ninth", "One Hundredth"
];
const semesters = ["Fall", "Spring", "Summer"];
const defaultTitle = "GCCIS 2025-2026 Flowchart";

//------------------------------ DATA BELOW ------------------------------//

let academicYearCount = 0;      // The numbers of years of school currently being listed.
let transferSection = false;    // Whether or not the transfer section is visible.
let uploadedFilename = null;    // The filename of the uploaded file.
let hyperDictionary = {}        // A mapping of hyperParentIds to hyperChildIds to their courseDivs
let initialHyperChildIds = {}   // A mapping of hyperParentIds to the initial hyperChildIds
let exoticDictionary = {}       // A mapping of exoticIds to lists if related courseDivs
let initialExoticIndexes = {}   // A mapping of exoticIds to the initial selected index

const body = document.body;
const courseRegex = /^[A-Z]{4}-[0-9]{1,3}H?$/;

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

const flowchartBody = document.getElementById("flowchartBody");
const transferYearDiv = document.getElementById("year-0");
const transferDiv = document.getElementById("transfer");
const transferDividerDiv = document.getElementById("year-divider-0");
const allCheckboxes = document.getElementsByName("courseCheckbox");
makeSortable(transferDiv);

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
 * This makes the given div element sortable.
 * 
 * @param {*} element - the given semester div
 */
function makeSortable(element) {
    Sortable.create(element, {
        group: "semester",
        animation: 200,
        // Makes sure a class and co-op cannot be added to the same semester
        onMove: function (event, originalEvent) {
            const movingElement = event.dragged;
            const targetElement = event.to;
            const targetChildren = targetElement.children;
            if (targetChildren.length > 0) {
                // Note: Works because both "class" and "co-op" are length 5
                let movingClass = movingElement.className.slice(0, 5);
                let targetClass = targetChildren[0].className.slice(0, 5);
                return movingClass == targetClass;
            }
        }
    });
}

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

    clearFlowchart(title, resetChoose, resetUpload);                        // This removes the previous flowchart
    fillTransferYear(transferCourses);                                      // This handles all transfer classes
    years.forEach(yearInfo => createYear(yearInfo, ++academicYearCount));   // This handles all other semesters and their classes
    fillFlowchartNotes(notes);                                              // This handles the flowchart notes
    hideCheckboxesButton.style.display == "none" ? hideCheckboxes() : showCheckboxes();

    // This makes sure only the hyper classes linked to a selected option are shown
    for (const [hyperParentId, hyperChildId] of Object.entries(initialHyperChildIds)) {
        updateHyperCourseDivs(Number(hyperParentId), Number(hyperChildId));
    }

    // This makes sure exotic option classes are set properly
    for (const [exoticId, selectedIndex] of Object.entries(initialExoticIndexes)) {
        updateExoticCourseDivs(Number(exoticId), Number(selectedIndex));
    }
}

/**
 * This adds courses divs to the transfer div.
 * 
 * @param {*} transferInfo - The object containing the transfer course objects
 */
function fillTransferYear(transferInfo) {
    transferInfo.forEach(courseInfo => {
        const courseDiv = createCourse(courseInfo);
        transferDiv.append(courseDiv);
    });
    if (transferInfo.length > 0) showTransferSection();
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
 * This creates a new year div and adds it to the body based on the template flowchart.
 * 
 * @param {*} yearInfo - The object containing the semester objects
 */
function createYear(yearInfo) {
    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${academicYearCount}`;
    yearDiv.className = "year";

    const yearTextDiv = document.createElement("div");
    yearTextDiv.id = `year-text-${academicYearCount}`
    yearTextDiv.className = "year-text";
    yearTextDiv.textContent = academicYearCount <= 100 ? `${years[academicYearCount - 1]} Year` : `#${academicYearCount} Year`;
    yearDiv.append(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.append(yearBlockDiv);

    semesters.forEach((term, index) => {
        const semesterDiv = createSemester(yearInfo[index], term)
        yearBlockDiv.append(semesterDiv);
    });
    flowchartBody.append(yearDiv);

    const yearDividerDiv = document.createElement("div");
    yearDividerDiv.id = `year-divider-${academicYearCount}`
    yearDividerDiv.className = "year-divider";
    flowchartBody.append(yearDividerDiv);
}

/**
 * This creates a new semester div and adds it to the current year div based on the template flowchart.
 * 
 * @param {*} semesterInfo - The object containing the course objects
 * @param {*} term - The "Fall", "Spring", or "Summer" semester term
 * @returns the semester div
 */
function createSemester(semesterInfo, term) {
    const semesterDiv = document.createElement("div");
    semesterDiv.id = `${term}-${academicYearCount}`;
    semesterDiv.className = "semester";
    makeSortable(semesterDiv);

    semesterInfo.forEach(courseInfo => {
        const courseDiv = createCourse(courseInfo);
        semesterDiv.append(courseDiv);
    });
    return semesterDiv;
}

/**
 * This creates a new course div and adds it to the current semester div based on the template flowchart.
 * 
 * @param {*} courseInfo - The object containing the course information
 * @returns the course div
 */
function createCourse(courseInfo) {
    // Create course div
    const courseDiv = document.createElement("div");

    // Get all possible data
    let courseType = courseInfo.courseType;
    let courseDiscipline = courseInfo?.discipline;
    let courseNumber = courseInfo?.number;                      // May be a string if Honors class. Ex: 999H
    let courseName = courseInfo?.name;
    let courseAttribute = courseInfo?.attribute;
    let courseSelectedIndex = courseInfo?.selectedIndex ?? 0;   // Excluded from below
    let courseOptions = courseInfo?.options;                    // Excluded from below
    let courseHyperParentId = courseInfo?.hyperParentId;
    let courseHyperChildId = courseInfo?.hyperChildId;
    let courseExoticId = courseInfo?.exoticId;
    let courseOfferedFall = courseInfo?.offeredFall;
    let courseOfferedSpring = courseInfo?.offeredSpring;
    let courseCompleted = courseInfo?.completed;

    // Save all possible data
    if (typeof courseType === "string" && courseType.trim()) {
        courseType = courseType.trim();
        courseDiv.dataset.courseType = courseType;
    }
    courseDiv.dataset.courseDiscipline = courseDiscipline;  // Can be empty
    courseDiv.dataset.courseNumber = courseNumber;          // Can be null
    if (typeof courseName === "string" && courseName.trim()) {
        courseName = courseName.trim();
        courseDiv.dataset.courseName = courseName;
    }
    if (typeof courseAttribute === "string" && courseAttribute.trim()) {
        courseAttribute = courseAttribute.trim();
        courseDiv.dataset.courseAttribute = courseAttribute;
    }
    const validHyperParentId = Number.isInteger(courseHyperParentId) && courseHyperParentId >= 1;
    const validHyperChildId = Number.isInteger(courseHyperChildId) && courseHyperChildId >= 1;
    const validExoticId = Number.isInteger(courseExoticId) && courseExoticId >= 1;
    if (validHyperParentId) courseDiv.dataset.courseHyperParentId = courseHyperParentId;
    if (validHyperChildId) courseDiv.dataset.courseHyperChildId = courseHyperChildId;
    if (validExoticId) courseDiv.dataset.courseExoticId = courseExoticId;

    // Add everything to the course divs
    switch (courseType) {
        case "co-op-required": {
            courseDiv.className = "co-op";
            courseDiv.textContent = `${courseName} (${courseDiscipline}-${courseNumber})`;
            break;
        }
        case "co-op-option": {
            courseDiv.className = "co-op";
    
            // Creates the select and sets the dropdown options
            const select = document.createElement("select");
            courseOptions.forEach((optionInfo, index) => {
                const option = Object.assign(document.createElement("option"), {
                    textContent: `${optionInfo.name} (${optionInfo.discipline}-${optionInfo.number})`,
                    value: optionInfo.name,
                });
                option.dataset.optionDiscipline = optionInfo.discipline;
                option.dataset.optionNumber = optionInfo.number;

                select.append(option); // Must come before the following line
                if (courseSelectedIndex == index) select.selectedIndex = index;
            });
            
            // Adds the select to the course div
            courseDiv.append(select);
            break;
        }
        case "class-required": {
            courseDiv.className = "class";
            courseDiv.textContent = `${courseDiscipline}-${courseNumber}\n\n${courseName}`
            courseDiv.style.borderColor = getDisciplineColor(courseDiscipline);
            break;
        }
        case "class-input": {
            courseDiv.className = "class";

            // Creates the label to go above the input
            const label = document.createElement("label");
            label.textContent = courseAttribute;

            // Creates and sets up the class input
            const savedCourse = `${courseDiscipline}-${courseNumber}`;
            const input = createCourseInput(savedCourse);

            // Sets the border color and adds the label and input to the course div
            courseDiv.style.borderColor = getAttributeColor(courseAttribute);
            courseDiv.append(label);
            courseDiv.append(input);
            break;
        }
        case "class-option-mix": {
            courseDiv.className = "class";

            // Creates the select to go above the label
            const select = document.createElement("select");

            // Creates a label to change based on the selector
            const label = document.createElement("label");
            label.textContent = courseOptions[0].name; // Backup in case the selected index is not valid

            // Creates a dictionary of indexes to input objects if needed
            const inputObjects = {};

            // Sets the dropdown options
            courseOptions.forEach((optionInfo, index) => {
                const option = document.createElement("option");
                const optionDiscipline = optionInfo.discipline;
                const optionNumber = optionInfo.number;
                const optionName = optionInfo?.name;
                const optionAttribute = optionInfo?.attribute;
                const optionHyperChildId = optionInfo?.hyperChildId;
                const savedCourse = `${optionDiscipline}-${optionNumber}`;

                // Sets up the option inputs with general fields
                option.textContent = optionName ? savedCourse : optionAttribute;
                option.value = optionName ?? "";
                option.dataset.optionDiscipline = optionInfo.discipline;
                option.dataset.optionNumber = optionInfo.number;

                // Creates and sets up the option input which is only used if the option is an "input class", not a "required class"
                if (optionAttribute) {
                    option.dataset.optionAttribute = optionAttribute;
                    var optionInput = createCourseInput(savedCourse);
                    optionInput.style.marginTop = "0px";
                    inputObjects[index] = optionInput;
                }

                let validOptionHyperChildId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 1;
                if (validOptionHyperChildId) option.dataset.optionHyperChildId = optionHyperChildId;

                select.append(option); // Must come before
                if (courseSelectedIndex == index) {
                    label.textContent = optionInfo.name;
                    select.selectedIndex = index;
                    if (validHyperParentId && validOptionHyperChildId) initialHyperChildIds[courseHyperParentId] = optionHyperChildId;

                    // Sets style the border color
                    if (optionAttribute) {
                        optionInput.style.display = "inline-block";
                        select.style.height = "50px"; // Extends the hight of the select
                        courseDiv.style.borderColor = getAttributeColor(optionAttribute);
                    } else {
                        courseDiv.style.borderColor = getDisciplineColor(optionDiscipline);
                    }
                } else {
                    if (optionAttribute) optionInput.style.display = "none";
                }
            });

            // Sets an event listener update color and text
            select.addEventListener("change", (event) => {
                const text = select.value;
                const index = select.selectedIndex;
                const option = select.selectedOptions[0];
                if (text) { // Option is required
                    label.style.display = "inline";
                    label.textContent = text;
                    select.style.height = "auto";
                    courseDiv.style.borderColor = getDisciplineColor(option.dataset.optionDiscipline);
                } else { // Option is input
                    label.style.display = "none";
                    label.textContent = "";
                    select.style.height = "50px";
                    courseDiv.style.borderColor = getAttributeColor(option.dataset.optionAttribute);
                }
                
                for (const [inputIndex, inputObject] of Object.entries(inputObjects)) {
                    let strInputIndex = String(inputIndex);
                    if (strInputIndex == String(index)) {
                        inputObject.style.display = "inline-block";
                    } else {
                        inputObject.style.display = "none";
                    }
                }
            });

            // Updates visible hyper classes based on selected options
            if (validHyperParentId && !validHyperChildId) {
                select.addEventListener("change", () =>
                    updateHyperCourseDivs(courseHyperParentId, Number(select.selectedOptions[0].dataset.optionHyperChildId))
                );
            }

            // Adds the select, label, and any existing input to the course div
            courseDiv.append(select);
            courseDiv.append(label);
            Object.values(inputObjects).forEach(input => courseDiv.append(input));
            break;
        }
        case "class-option-attribute": {
            courseDiv.className = "class";

            // Creates the label to go above the select
            const label = document.createElement("label");
            label.textContent = courseAttribute;

            // Creates the select and updates its style
            const select = document.createElement("select");
            Object.assign(select.style, {
                marginTop: "10px",
                marginBottom: "0px",
                borderBottom: "1px solid var(--text-color)",
                borderRadius: "0px"
            });

            // Sets the dropdown options
            courseOptions.forEach((optionInfo, index) => {
                const option = Object.assign(document.createElement("option"), {
                    textContent: `${optionInfo.discipline}-${optionInfo.number}`,
                    value: optionInfo.name
                });
                option.dataset.optionDiscipline = optionInfo.discipline;
                option.dataset.optionNumber = optionInfo.number;
                const optionAttribute = optionInfo?.attribute;
                if (optionAttribute) option.dataset.optionAttribute = optionAttribute;

                select.append(option); // Must come before
                if (courseSelectedIndex == index) {
                    select.selectedIndex = index;

                    // Updates the color and label if there is a sub attribute
                    if (optionAttribute) label.textContent = optionAttribute;
                    courseDiv.style.borderColor = getAttributeColor(optionAttribute ?? courseAttribute);
                }
            });

            // Configures exotic ids and their course divs
            if (validExoticId) {
                if (courseExoticId in initialExoticIndexes) {
                    savedInitialExoticId = initialExoticIndexes[courseExoticId];
                    if (courseExoticId > savedInitialExoticId) initialExoticIndexes[courseExoticId] = courseSelectedIndex;
                } else {
                    initialExoticIndexes[courseExoticId] = courseSelectedIndex;
                }

                // Updates the options inside the related exotic courseDivs or hides if the selected index is to high.
                select.addEventListener("change", () => {
                    updateExoticCourseDivs(courseExoticId, select.selectedIndex);
                });

                // This handles saving all course divs that are linked to a exotic option.
                exoticDictionary[courseExoticId] ??= [];
                exoticDictionary[courseExoticId].push(courseDiv);
            }

            // Adds the label and input to the course div
            courseDiv.append(label);
            courseDiv.append(select);
            break;
        }
        default:
            console.log(`A course was found with an unknown type: ${courseType}.`);
            return;
    }

    // This handles saving all course divs that are linked to a hyper option.
    if (validHyperParentId && validHyperChildId) {
        hyperDictionary[courseHyperParentId] ??= {};
        const hyperChildDictionary = hyperDictionary[courseHyperParentId];

        hyperChildDictionary[courseHyperChildId] ??= [];
        const hyperChildCourseDivs = hyperChildDictionary[courseHyperChildId];

        hyperChildCourseDivs.push(courseDiv);
    }

    // Checks availability
    if (courseOfferedSpring === false) {        // Offered in Fall
        courseDiv.style.borderStyle = "dotted";
    } else if (courseOfferedFall === false) {   // Offered in Spring
        courseDiv.style.borderStyle = "dashed";
    }

    // This adds a checkbox to mark if a class has been taken yet.
    const checkbox = Object.assign(document.createElement("input"), {
        type: "checkbox",
        name: "courseCheckbox",
        checked: courseCompleted
    });
    courseDiv.append(checkbox); // Must come after text content assignment

    return courseDiv;
}

/**
 * This creates a input element that can be used in classes.
 * 
 * @param {string} savedCourse - the possible current class previously chosen for the input.
 * @returns the input object
 */
function createCourseInput(savedCourse) {
    // Creates the class input
    const input = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "ABCD-123",
        pattern: "[A-Z]{4}-[0-9]{1,3}H?",
        minLength: 6,
        maxLength: 9
    });

    // Ensures any letters given are uppercase
    input.addEventListener("input", () => input.value = input.value.toUpperCase());

    // Ensures valid characters are entered in the input.
    input.addEventListener("keypress", (event) => {
        const preInputLength = input.value.length;
        const key = event.key.toUpperCase(); // Converts letters to uppercase for the check only
        const condition1 = preInputLength < 4 && !/[A-Z]/.test(key);                        // Characters 1-4
        const condition2 = preInputLength == 4 && key != "-";                               // Character 5
        const condition3 = preInputLength > 4 && preInputLength < 8 && !/[0-9]/.test(key);  // Characters 6-8
        const condition4 = preInputLength == 8 && key != "H";                               // Character 9 (Optional)
        const condition5 = preInputLength == 9;                                             // Extra
        if (condition1 || condition2 || condition3 || condition4 || condition5) event.preventDefault();
    });
    
    // Ensures a valid string is saved
    input.addEventListener("blur", (event) => {
        const currentValue = event.target.value;
        if (currentValue && !courseRegex.test(currentValue)) {
            alert("Format must be in ABCD-123, ABCD-123H, or blank");
            setTimeout(() => input.focus(), 0); // Prevents alert loop
        }
    });

    // Sets the current class if possible
    if (courseRegex.test(savedCourse)) input.value = savedCourse;
    return input;
}

/**
 * This reveals and hides specific course divs if they are linked the hyper ids.
 * 
 * @param {int} hyperParentId - the id of the parent option div
 * @param {int} hyperChildId - the id that matches an option of the parent option div
 */
function updateHyperCourseDivs(hyperParentId, hyperChildId) {
    if (Number.isInteger(hyperParentId) && Number.isInteger(hyperChildId)) {
        const hyperChildDictionary = hyperDictionary[hyperParentId];
        for (const [hyperChildIdKey, courseDivs] of Object.entries(hyperChildDictionary)) {
            if (hyperChildIdKey == hyperChildId) {
                courseDivs.forEach(div => div.style.display = "flex");
            } else {
                courseDivs.forEach(div => div.style.display = "none");
            }
        }
    }
}

/**
 * This updates all related exotic dropdowns to the same index or hides them if they don't exists.
 * 
 * @param {int} exoticId - the id of the parent option div
 * @param {int} selectedIndex - the current selected index
 */
function updateExoticCourseDivs(exoticId, selectedIndex) {
    if (Number.isInteger(exoticId) && Number.isInteger(selectedIndex)) {
        const exoticDivs = exoticDictionary[exoticId];
        exoticDivs.forEach(courseDiv => {
            const courseAttribute = courseDiv.dataset.courseAttribute;
            const label = courseDiv.children[0];
            const select = courseDiv.children[1];
            if (selectedIndex < select.options.length) {
                select.selectedIndex = selectedIndex;
                const attribute = select.selectedOptions[0].dataset?.optionAttribute ?? courseAttribute;
                label.textContent = attribute;
                courseDiv.style.borderColor = getAttributeColor(attribute);
                courseDiv.style.display = "flex";
            } else {
                courseDiv.style.display = "none";
            }
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
    yearTextDiv.textContent = academicYearCount <= 100 ? `${years[academicYearCount - 1]} Year` : `#${academicYearCount} Year`;
    yearDiv.append(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.append(yearBlockDiv);

    semesters.forEach(term => {
        const semesterDiv = document.createElement("div");
        semesterDiv.id = `${term}-${academicYearCount}`;
        semesterDiv.className = "semester";
        makeSortable(semesterDiv);
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

/**
 * Gets the class border color based on its discipline.
 * 
 * @param {*} discipline - the string discipline
 * @returns the string HTML color
 */
function getDisciplineColor(discipline) {
    switch (discipline) {
        // College of Art and Design

        // College of Engineering Technology

        // College of Health Sciences and Technology

        // College of Liberal Arts
        case "COMM":
        case "ITDL":
        case "PUBL":
        case "STSO":
        case "PHIL":
        case "PSYC":
        case "DHSS":
            return "HotPink";
        case "ENGL":
        case "LING":
        case "UWRT":
            return "Green";

        //  College of Science
        case "BIOG":
        case "BIOL":
        case "CHMG":
        case "PHYS":
            return "Crimson";
        case "MATH":
        case "STAT":
            return "MediumBlue";

        //  Golisano College of Computing and Information Sciences
        case "CINT":
        case "CSCI":
        case "CSEC":
        case "GCIS":
        case "IDAI":
        case "IGME":
        case "ISTE":
        case "NMDE":
        case "NSSA":
        case "SWEN":
            return "DarkOrange";

        // Golisano Institute for Sustainability

        // Kate Gleason College of Engineering

        // National Technical Institute for the Deaf

        // Saunders College of Business

        // School of Individualized Study

        // RIT 365
        case "YOPS":
            return "OrangeRed";

        // Other
        default:
            return "var(--text-color)";
    }
}

/**
 * Gets the class border color based on its attribute.
 * 
 * @param {*} attribute - the string attribute
 * @returns the string HTML color
 */
function getAttributeColor(attribute) {
    if (attribute.includes("Open Elective") || attribute == "Graduate Elective") {
        return "Purple";
    } else if (attribute.includes("Wellness Course")) {
        return "Gold";
    } else if (attribute.includes("AI") || attribute.includes("IDAI") || attribute.includes("CIT")  
            || attribute.includes("CS") || attribute.includes("CSCI") || attribute.includes("CSEC") 
            || attribute.includes("Engineering Elective")
            || attribute.includes("GCIS") || attribute.includes("GDD") || attribute.includes("HCC") 
            || attribute.includes("IGM") || attribute.includes("IGME") || attribute.includes("ISTE") 
            || attribute.includes("NMID") || attribute.includes("NSSA") || attribute.includes("SE") 
            || attribute.includes("SWEN")) {
        return "DarkOrange";
    } else if (attribute.includes("Gen Ed") || attribute.includes("Writing Intensive") || attribute == "Professional Elective") {
        return "Green";
    } else if (attribute.includes("Lab Science")) {
        return "Crimson";
    } else if (attribute.includes("Math/Science")) {
        return "DarkViolet"
    } else if (attribute.includes("DHSS")) {
        return "HotPink";
    } else {
        return "var(--text-color)"
    }
}
