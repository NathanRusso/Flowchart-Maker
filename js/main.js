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

const body = document.body;
const classRegex = /^[A-Z]{4}-[0-9]{1,3}H?$/;

const pageTitle = document.getElementById("pageTitle");
const fileInput = document.getElementById("fileInput");
const templateSelect = document.getElementById("templateSelect");
const uploadTemplateButton = document.getElementById("uploadTemplateButton");
const downloadTemplateButton = document.getElementById("downloadTemplateButton");
const pushYearButton = document.getElementById("pushYearButton");
const popYearButton = document.getElementById("popYearButton");
const showTransferButton = document.getElementById("showTransferButton");
const hideTransferButton = document.getElementById("hideTransferButton");
const clearFlowchartButton = document.getElementById("clearFlowchartButton");

const flowchartBody = document.getElementById("flowchartBody");
const transferYearDiv = document.getElementById("year-0");
const transferDiv = document.getElementById("transfer");
const transferDividerDiv = document.getElementById("year-divider-0");
makeSortable(transferDiv);

const finalNotesList = document.getElementById("finalNotesList");

//------------------------------ EVENT LISTENERS BELOW ------------------------------//

templateSelect.addEventListener("change", (event) => getTemplateFlowchart(event.target.value));
fileInput.addEventListener("change", (event) => processUploadedFile(event.target.files[0]));
uploadTemplateButton.addEventListener("click", () => fileInput.click());
downloadTemplateButton.addEventListener("click", downloadTemplate);
pushYearButton.addEventListener("click", pushYear);
popYearButton.addEventListener("click", popYear);
showTransferButton.addEventListener("click", showTransferSection);
hideTransferButton.addEventListener("click", hideTransferSection);
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
    fillFinalNotes(notes);                                                  // This handles the final notes

    // This makes sure only the hyper classes linked to a selected option are shown
    for (const [hyperParentId, hyperChildId] of Object.entries(initialHyperChildIds)) {
        updateHyperCourseDivs(Number(hyperParentId), Number(hyperChildId));
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
 * This adds the notes to the final notes section.
 * 
 * @param {*} notesInfo - the final notes string
 */
function fillFinalNotes(notesInfo) {
    notesInfo.forEach(note => {
        const noteDiv = document.createElement("li");
        noteDiv.innerHTML = note;
        finalNotesList.append(noteDiv);
    });
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
    let courseOfferedFall = courseInfo.offeredFall;
    let courseOfferedSpring = courseInfo.offeredSpring;
    let courseDiscipline = courseInfo?.discipline;
    let courseNumber = courseInfo?.number;                      // May be a string if Honors class. Ex: 999H
    let courseName = courseInfo?.name;
    let courseAttribute = courseInfo?.attribute;
    let courseSelectedIndex = courseInfo?.selectedIndex ?? 0;   // Excluded from below
    let courseOptions = courseInfo?.options;                    // Excluded from below
    let courseHyperParentId = courseInfo?.hyperParentId;
    let courseHyperChildId = courseInfo?.hyperChildId;

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
    const validHyperParentId = Number.isInteger(courseHyperParentId) && courseHyperParentId >= 0;
    const validHyperChildId = Number.isInteger(courseHyperChildId) && courseHyperChildId >= 0;
    if (validHyperParentId) courseDiv.dataset.courseHyperParentId = courseHyperParentId;
    if (validHyperChildId) courseDiv.dataset.courseHyperChildId = courseHyperChildId;

    // Add everything to the course divs
    if (courseType == "co-op") {
        courseDiv.className = "co-op";
        courseDiv.textContent = `${courseName} (${courseDiscipline}-${courseNumber})`;
    } else if (courseType == "co-op option") {    
        courseDiv.className = "co-op";
  
        // Creates the class selector
        const classSelect = document.createElement("select");

        // Sets the dropdown options
        courseOptions.forEach((optionInfo, index) => {
            const classOption = document.createElement("option");
            classOption.textContent = `${optionInfo.name} (${optionInfo.discipline}-${optionInfo.number})`;
            classOption.value = optionInfo.name;
            classOption.dataset.optionDiscipline = optionInfo.discipline;
            classOption.dataset.optionNumber = optionInfo.number;

            classSelect.append(classOption); // Must come before

            if (courseSelectedIndex == index) classSelect.selectedIndex = index;
        });
        
        // Adds the select to the course div
        courseDiv.append(classSelect);
    } else if (courseType == "required") {
        courseDiv.className = "class";
        courseDiv.textContent = `${courseDiscipline}-${courseNumber}\n\n${courseName}`

        // Set border color
        courseDiv.style.borderColor = getDisciplineColor(courseDiscipline);
    } else if (courseType == "option") {
        courseDiv.className = "class";

        // Creates the class selector and adds options
        const classSelect = document.createElement("select");

        if (courseAttribute) {
            // Updates styles
            classSelect.style.marginTop= "10px";
            classSelect.style.borderBottom = "1px Solid Black";
            classSelect.style.borderRadius = "0px";

            // Sets the upper attribute label
            const classAttributeLabel = document.createElement("label");
            classAttributeLabel.textContent = courseAttribute;

            // Sets the dropdown options
            courseOptions.forEach((optionInfo, index) => {
                const classOption = document.createElement("option");
                const classTextContent = `${optionInfo.discipline}-${optionInfo.number}`;
                classOption.textContent = classTextContent;
                classOption.value = optionInfo.name;

                const optionHyperChildId = optionInfo?.hyperChildId;
                let validOptionHyperChildId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 0;
                if (validOptionHyperChildId) classOption.dataset.optionHyperChildId = optionHyperChildId;

                classSelect.append(classOption); // Must come before

                if (courseSelectedIndex == index) {
                    classSelect.selectedIndex = index;
                    if (validHyperParentId && validOptionHyperChildId) initialHyperChildIds[courseHyperParentId] = optionHyperChildId;
                }
            });

            // Sets the border color
            courseDiv.style.borderColor = getAttributeColor(courseAttribute);

            // Adds the select and label to the course div
            courseDiv.append(classAttributeLabel);
            courseDiv.append(classSelect);
        } else {
            // Creates a label to change based on the selector
            const classLabel = document.createElement("label");
            classLabel.textContent = courseOptions[0].name;

            // Creates a dictionary of indexes to input objects if needed
            const inputObjects = {};

            // Sets the dropdown options
            courseOptions.forEach((optionInfo, index) => {
                const optionDiscipline = optionInfo.discipline;
                const optionNumber = optionInfo.number;
                const optionName = optionInfo?.name;
                const optionAttribute = optionInfo?.attribute;
                const optionHyperChildId = optionInfo?.hyperChildId;

                // Creates the option object to go inside the select object
                const classOption = document.createElement("option");

                // Creates the option input object which is only used is the option is an input (not often)
                const optionInput = document.createElement("input");
                optionInput.style.marginTop = "10px";

                if (optionName) {                   // Required option
                    classOption.textContent = `${optionDiscipline}-${optionNumber}`;
                    classOption.value = optionName;
                } else if (optionAttribute) {       // Input option
                    classOption.textContent = optionAttribute;
                    classOption.value = "";
                    classOption.dataset.optionAttribute = optionAttribute;

                    // Applies restrictions to the option input
                    Object.assign(optionInput, {
                        type: "text",
                        placeholder: "ABCD-123",
                        pattern: "[A-Z]{4}-[0-9]{1,3}H?",
                        minlength: 6,
                        maxlength: 9
                    });

                    // Ensures valid characters are entered in the option input.
                    optionInput.addEventListener("keypress", (event) => {
                        const preInputLength = optionInput.value.length;
                        const key = event.key;
                        const condition1 = preInputLength < 4 && !/[A-Z]/.test(key);                        // Characters 1-4
                        const condition2 = preInputLength == 4 && key != "-";                               // Character 5
                        const condition3 = preInputLength > 4 && preInputLength < 8 && !/[0-9]/.test(key);  // Characters 6-8
                        const condition4 = preInputLength == 8 && key != "H";                               // Character 9 (Optional)
                        const condition5 = preInputLength == 9;                                             // Extra
                        if (condition1 || condition2 || condition3 || condition4 || condition5) event.preventDefault();
                    });
                    
                    // Ensures a valid string is saved in the option input
                    optionInput.addEventListener("blur", (event) => {
                        const currentValue = event.target.value;
                        if (currentValue && !classRegex.test(currentValue)) {
                            alert("Format must be in ABCD-123 or blank");
                            setTimeout(() => optionInput.focus(), 0); // Prevents alert loop
                        }
                    });

                    // Checks current class
                    const savedCourse = `${optionDiscipline}-${optionNumber}`;
                    if (classRegex.test(savedCourse)) optionInput.value = savedCourse;
                    inputObjects[index] = optionInput;
                }

                let validOptionHyperChildId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 0;
                if (validOptionHyperChildId) classOption.dataset.optionHyperChildId = optionHyperChildId;

                classSelect.append(classOption); // Must come before

                if (courseSelectedIndex == index) {
                    classLabel.textContent = optionInfo.name;
                    classSelect.selectedIndex = index;
                    if (validHyperParentId && validOptionHyperChildId) initialHyperChildIds[courseHyperParentId] = optionHyperChildId;
                    optionInput.style.display = "inline-block";
                } else {
                    optionInput.style.display = "none";
                }
            });

            // Sets the border color
            const discipline = classSelect.options[classSelect.selectedIndex].textContent.split(/[\-]+/)[0];
            const attribute = classSelect.options[classSelect.selectedIndex].dataset.optionAttribute;
            if (attribute) {
                courseDiv.style.borderColor = getAttributeColor(attribute);
                classSelect.style.height = "50px"; // Extends the hight of the select
            } else if (discipline) {
                courseDiv.style.borderColor = getDisciplineColor(discipline);
            }

            // Updates color and text
            classSelect.addEventListener("change", (event) => {
                const text = event.target.value;
                const index = classSelect.selectedIndex;
                if (text) {
                    classLabel.style.display = "inline";
                    classLabel.textContent = text;
                    classSelect.style.height = "auto";
                    const discipline = classSelect.options[index].textContent.split(/[\-]+/)[0];
                    courseDiv.style.borderColor = getDisciplineColor(discipline);
                } else {
                    classLabel.style.display = "none";
                    classLabel.textContent = "";
                    classSelect.style.height = "50px";
                    const attribute = classSelect.options[index].dataset.optionAttribute;
                    courseDiv.style.borderColor = getAttributeColor(attribute);
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

            // Adds the select, label, and any existing input to the course div
            courseDiv.append(classSelect);
            courseDiv.append(classLabel);
            Object.values(inputObjects).forEach(input => courseDiv.append(input));
        }

        // Updates visible hyper classes based on selected options
        if (validHyperParentId && !validHyperChildId) {
            classSelect.addEventListener("change", (event) =>{
                updateHyperCourseDivs(courseHyperParentId, Number(classSelect.options[classSelect.selectedIndex].dataset.optionHyperChildId))
            });
        }
    } else if (courseType == "input") {
        courseDiv.className = "class";

        // Creates the label for the input
        const classLabel = document.createElement("label");
        classLabel.textContent = courseAttribute;

        // Creates the class input
        const classInput = document.createElement("input");
        classInput.style.marginTop = "10px";

        // Applies restrictions to the input
        Object.assign(classInput, {
            type: "text",
            placeholder: "ABCD-123",
            pattern: "[A-Z]{4}-[0-9]{1,3}H?",
            minlength: 6,
            maxlength: 9
        });

        // Ensures valid characters are entered in the input.
        classInput.addEventListener("keypress", (event) => {
            const preInputLength = classInput.value.length;
            const key = event.key;
            const condition1 = preInputLength < 4 && !/[A-Z]/.test(key);                        // Characters 1-4
            const condition2 = preInputLength == 4 && key != "-";                               // Character 5
            const condition3 = preInputLength > 4 && preInputLength < 8 && !/[0-9]/.test(key);  // Characters 6-8
            const condition4 = preInputLength == 8 && key != "H";                               // Character 9 (Optional)
            const condition5 = preInputLength == 9;                                             // Extra
            if (condition1 || condition2 || condition3 || condition4 || condition5) event.preventDefault();
        });
        
        // Ensures a valid string is saved
        classInput.addEventListener("blur", (event) => {
            const currentValue = event.target.value;
            if (currentValue && !classRegex.test(currentValue)) {
                alert("Format must be in ABCD-123 or blank");
                setTimeout(() => classInput.focus(), 0); // Prevents alert loop
            }
        });

        // Checks current class
        const savedCourse = `${courseDiscipline}-${courseNumber}`;
        if (classRegex.test(savedCourse)) classInput.value = savedCourse;

        // Sets the border color
        courseDiv.style.borderColor = getAttributeColor(courseAttribute);

        // Adds the label and input to the course div
        courseDiv.append(classLabel);
        courseDiv.append(classInput);
    } else {
        console.log("A course was found with an unknown type.");
    }

    // This handles adding all course divs that are linked to a hyper-option to a global dictionary.
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
    
    return courseDiv;
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
    Array.from(finalNotesList.children).forEach(listItem => {
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
 * This turns the given course div back into an object.
 * 
 * @param {*} courseDiv - the given course Div
 */
function processCourse(courseDiv) {
    let course = {};

    // Get all possible data
    const courseType = courseDiv.dataset.courseType; // "co-op", "required", "option", "input"
    const courseContent = courseDiv.textContent;
    const courseOfferedOnlyFall = courseDiv.style.borderStyle === "dotted";
    const courseOfferedOnlySpring = courseDiv.style.borderStyle === "dashed";
    const courseDiscipline = courseDiv.dataset?.courseDiscipline;
    let courseNumber = courseDiv.dataset?.courseNumber;
    if (courseNumber.at(-1) !== "H") courseNumber = Number(courseNumber); // Accounts for Honors courses
    const courseName = courseDiv.dataset?.courseName;
    const courseAttribute = courseDiv.dataset?.courseAttribute;
    const courseHyperParentId = Number(courseDiv.dataset?.courseHyperParentId);
    const courseHyperChildId = Number(courseDiv.dataset?.courseHyperChildId);

    if (courseType == "co-op") {
        course = {
            "courseType": "co-op",
            "offeredFall": null,
            "offeredSpring": null,
            "discipline": courseDiscipline,
            "number": courseNumber,
            "name": courseName
        };
    } else if (courseType == "co-op option") {
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
            "courseType": "co-op option",
            "offeredFall": null,
            "offeredSpring": null,
            "selectedIndex": select.selectedIndex,
            "options": createdOptions
        };
    } else if (courseType == "required") {
        course = {
            "courseType": "required",
            "offeredFall": !(courseOfferedOnlySpring),
            "offeredSpring": !(courseOfferedOnlyFall),
            "discipline": courseDiscipline,
            "number": courseNumber,
            "name": courseName
        };
    } else if (courseType == "option") {
        if (courseAttribute) {
            const select = courseDiv.children[1];                       // Select
            const options = select.options;                             // Options

            const createdOptions = [];
            Array.from(options).forEach(option => {
                const optionInfo = option.textContent.split(/[\-]+/);
                const optionHyperChildId = Number(option.dataset.optionHyperChildId);
                const validOptionHyperParentId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 0;
                let optionObject = {
                    "discipline": optionInfo[0],
                    "number": optionInfo[1].at(-1) === "H" ? optionInfo[1] : Number(optionInfo[1]),
                    "name": option.value,
                }
                if (validOptionHyperParentId) optionObject["hyperChildId"] = optionHyperChildId;
                createdOptions.push(optionObject);
            });

            course = {
                "courseType": "option",
                "offeredFall": !(courseOfferedOnlySpring),
                "offeredSpring": !(courseOfferedOnlyFall),
                "attribute": courseAttribute,
                "selectedIndex": select.selectedIndex,
                "options": createdOptions
            };
        } else {
            const select = courseDiv.children[0];                       // Select
            const options = select.options;                             // Options

            const createdOptions = [];
            let inputIndex = 2
            Array.from(options).forEach((option, index) => {
                const optionInfo = option.textContent.split(/[\-]+/);
                const optionAttribute = option.dataset.optionAttribute;
                const optionHyperChildId = Number(option.dataset.optionHyperChildId);
                const validOptionHyperParentId = Number.isInteger(optionHyperChildId) && optionHyperChildId >= 0;
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
                        "number": optionInfo[1].at(-1) === "H" ? optionInfo[1] : Number(optionInfo[1]),
                        "attribute": optionAttribute,
                    }
                }
                if (validOptionHyperParentId) optionObject["hyperChildId"] = optionHyperChildId;
                createdOptions.push(optionObject);
            });

            course = {
                "courseType": "option",
                "offeredFall": !(courseOfferedOnlySpring),
                "offeredSpring": !(courseOfferedOnlyFall),
                "selectedIndex": select.selectedIndex,
                "options": createdOptions
            };
        }
    } else if (courseType == "input") {
        const inputs = courseDiv.children[1].value.split(/[\-]+/);  // Input
        course = {
            "courseType": "input",
            "offeredFall": !(courseOfferedOnlySpring),
            "offeredSpring": !(courseOfferedOnlyFall),
            "discipline": inputs[0],
            "number": inputs.length == 2 && inputs[1].at(-1) === "H" ? inputs[1] : Number(inputs[1]),
            "attribute": courseAttribute
        };
    } else {
        console.log("A course was found with an unknown type.");
    }

    if (courseHyperParentId || courseHyperParentId === 0) course["hyperParentId"] = courseHyperParentId;
    if (courseHyperChildId || courseHyperChildId === 0) course["hyperChildId"] = courseHyperChildId;

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
    document.getElementById(`year-divider-${academicYearCount}`).remove();
    document.getElementById(`year-${academicYearCount}`).remove();
    academicYearCount--;
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
    finalNotesList.textContent = "";                    // Gets rid of the final notes
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
            return "Black";
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
    } else if (attribute.includes("Gen Ed") || attribute.includes("Writing Intensive") || attribute.includes("Professional Elective")) {
        return "Green";
    } else if (attribute.includes("Lab Science")) {
        return "Crimson";
    } else if (attribute.includes("Math/Science")) {
        return "DarkViolet"
    } else if ( attribute.includes("DHSS") ) {
        return "HotPink";
    } else {
        return "Black"
    }
}
