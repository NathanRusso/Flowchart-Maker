//------------------------------ STATIC DATA BELOW ------------------------------//

// The 4 course types are "co-op", "required", "option", and "input"
// I added the "General Education: Immersion", "Lab Science: Lab", "Lab Science: Lecture", etc. attributes
// I also count Open Electives

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

//------------------------------ DATA BELOW ------------------------------//

let academicYearCount = 0;      // The numbers of years of school currently being listed.
let transferSection = false;    // Whether or not the transfer section is visible.
let uploadedFilename = null;    // The filename of the uploaded file.

const body = document.body;
const classRegex = /^[A-Z]{4}-[0-9]{1,3}$/;

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
clearFlowchartButton.addEventListener("click", () => clearFlowchart(true, true));

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
        // Makes sure a class and co-op can't be added to the same semester
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
    if (filename == null || filename == "") { setPageTitle(null); return; };
    const template  = (await import(`/json/templates/${filename}`, { with: { type: "json" } })).default;
    processFlowchart(filename, template, false, true);
}

/**
 * This processes the uploaded flowchart file.
 * 
 * @param {*} file - the given flowchart file object
 */
async function processUploadedFile(file) {
    const filename = file.name;
    const fileText = await file.text();
    const fileData = JSON.parse(fileText);
    processFlowchart(filename, fileData, true, false);
    fileInput.value = ""; // Makes sure the same file can be uploaded in a row
}

/**
 * This updates and populates the body given the json template flowchart.
 * This adds a Transfer section for transfer classes.
 * It then adds years, each of which has 3 semesters that may or many not contain courses.
 * 
 * @param {*} filename - the flowchart filename
 * @param {*} template - the flowchart with transfer, year, semester, and course information
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function processFlowchart(filename, template, resetChoose, resetUpload) {
    // Check JSON file formatting
    if (template == null || typeof template != "object" || Array.isArray(template) 
        || template.transfer == undefined || template.college == undefined) {
        alert("The given JSON file does not meet the required formatting.");
        setPageTitle(null);
        return;
    }

    // Updates the page title
    setPageTitle(filename);

    const transferCourses = template.transfer;
    const years = template.college;
    const notes = template.notes;

    clearFlowchart(resetChoose, resetUpload);                               // This removed the current flowchart
    fillTransferYear(transferCourses);                                      // This handles all transfer classes
    years.forEach(yearInfo => createYear(yearInfo, ++academicYearCount));   // This handles all other semesters and their classes
    fillFinalNotes(notes);                                                  // This handles the final notes
}

/**
 * This adds courses divs to the transfer div.
 * 
 * @param {*} transferInfo - The object containing the transfer course objects
 */
function fillTransferYear(transferInfo) {
    if (transferInfo.length == 0) return;
    transferInfo.forEach(courseInfo => {
        const courseDiv = createCourse(courseInfo);
        transferDiv.append(courseDiv);
    });
    showTransferSection();
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
    const courseDiv = document.createElement("div");
    const courseType = courseInfo.courseType;
    courseDiv.dataset.courseType = courseType;

    if (courseType == "co-op") {
        courseDiv.className = "co-op";
        courseDiv.textContent = `${courseInfo.name} (${courseInfo.discipline}-${courseInfo.number})`;
    } else if (courseType == "required") {
        courseDiv.className = "class";
        courseDiv.textContent = `${courseInfo.discipline}-${courseInfo.number}\n\n${courseInfo.name}`

        // Set border color
        courseDiv.style.borderColor = getDisciplineColor(courseInfo.discipline);
    } else if (courseType == "option") {
        courseDiv.className = "class";
        const selectedOption = `${courseInfo.discipline}-${courseInfo.number}`;

        // Creates a label to change based on the selector
        const classLabel = document.createElement("label");

        // Creates the class selector and adds options
        const classSelect = document.createElement("select");
        const classOptions = courseInfo.options;

        classLabel.textContent = classOptions[0].name;
        classOptions.forEach(optionInfo => {
            const classOption = document.createElement("option");
            const classTextContent = `${optionInfo.discipline}-${optionInfo.number}`;
            classOption.textContent = classTextContent;
            if (selectedOption == classTextContent) {
                classLabel.textContent = classOptions[0].name;
            }
            classOption.value = optionInfo.name;
            classSelect.append(classOption);
        });
        classSelect.addEventListener("change", (event) => {
            classLabel.textContent = event.target.value;
            const courseDiscipline = classSelect.options[classSelect.selectedIndex].textContent.split(/[\-]+/)[0];
            courseDiv.style.borderColor = getDisciplineColor(courseDiscipline);
        });

        // Set border color
        courseDiv.style.borderColor = getDisciplineColor(courseInfo.discipline);

        // Adds the select and label to the course div
        courseDiv.append(classSelect);
        courseDiv.append(classLabel);
    } else if (courseType == "input") {
        courseDiv.className = "class";
        const courseDiscipline = courseInfo.discipline;
        const courseNumber = courseInfo.number;
        const attribute = courseInfo.attribute;

        // Creates the label for the input
        const classLabel = document.createElement("label");
        classLabel.textContent = attribute;

        // Creates the class input
        const classInput = document.createElement("input");

        // Applies restrictions to the input
        Object.assign(classInput, {
            type: "text",
            placeholder: "ABCD-123",
            pattern: "[A-Z]{4}-[0-9]{1,3}",
            minlength: 6,
            maxlength: 8
        });

        // Ensures valid characters are entered in the input.
        classInput.addEventListener("keypress", (event) => {
            const preInputLength = classInput.value.length;
            const key = event.key;
            const condition1 = preInputLength < 4 && !/[A-Z]/.test(key);    // Characters 1-4
            const condition2 = preInputLength == 4 && key != "-";           // Character 5
            const condition3 = preInputLength > 4 && !/[0-9]/.test(key);    // Character 6-8
            const condition4 = preInputLength == 8;                         // Extra
            if (condition1 || condition2 || condition3 || condition4) event.preventDefault();
        });
        
        // Ensures a valid string is saved
        classInput.addEventListener("blur", (event) => {
            const currentValue = event.target.value;
            const currentLength = currentValue.length;
            if (currentValue != null && currentValue != "" && !classRegex.test(currentValue)) {
                alert("Format must be in ABCD-123 or blank");
                setTimeout(() => classInput.focus(), 0); // Prevents alert loop
            }
        });

        // Checks current class
        const savedCourse = `${courseDiscipline}-${courseNumber}`;
        if (classRegex.test(savedCourse)) classInput.value = savedCourse;

        // Set border color
        if (attribute.includes("Open Elective")) {
            courseDiv.style.borderColor = "Purple";
        } else if (attribute.includes("Activity Course")) {
            courseDiv.style.borderColor = "Yellow";
        } else if (attribute.includes("CS") || attribute.includes("CSCI") || attribute.includes("CSEC") 
                || attribute.includes("GCIS") || attribute.includes("ISTE") || attribute.includes("NSSA") 
                || attribute.includes("SE") || attribute.includes("SWEN")) {
            courseDiv.style.borderColor = "Orange";
        } else if (attribute.includes("Gen Ed") || attribute.includes("Writing Intensive")) {
            courseDiv.style.borderColor = "Green";
        } else if (attribute.includes("Lab Science")) {
            courseDiv.style.borderColor = "Red";
        }

        // Adds the label and input to the course div
        courseDiv.append(classLabel);
        courseDiv.append(classInput);
    } else {
        console.log("A course was found with an unknown type.");
    }

    // Checks availability
    if (courseInfo.offeredSpring == false) {        // Offered in Fall
        courseDiv.style.borderStyle = "dotted";
    } else if (courseInfo.offeredFall == false) {   // Offered in Spring
        courseDiv.style.borderStyle = "dashed";
    }
    
    return courseDiv;
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
    })

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
        let note = listItem.innerHTML.replace("&amp;", "&");;
        notes.push(note);
    });

    // Creates and downloads the JSON file
    const json = { "transfer": transfer, "college": college, "notes": notes };
    const jsonString = JSON.stringify(json);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonObjectUrl = URL.createObjectURL(jsonBlob);
    const selectValue = templateSelect.value;
    let jsonFilename;
    if (selectValue != null && selectValue != "") {
        jsonFilename = templateSelect.value;
    } else if (uploadedFilename != null && uploadedFilename != "") {
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

    const courseType = courseDiv.dataset.courseType; // "co-op", "required", "option", "input"
    const classContent = courseDiv.textContent;
    const classOfferedOnlyFall = courseDiv.style.borderStyle == "dotted";
    const classOfferedOnlySpring = courseDiv.style.borderStyle == "dashed";

    if (courseType == "co-op") {
        const classInformation1 = classContent.split(/[\(\)]+/);
        const classInformation2 = classInformation1[1].split(/[\-]+/);
        course = {
            "courseType": "co-op",
            "offeredFall": null,
            "offeredSpring": null,
            "discipline": classInformation2[0].trim(),
            "number": parseInt(classInformation2[1].trim()),
            "name": classInformation1[0].trim()
        };
    } else if (courseType == "required") {
        const classInformation1 = classContent.split(/[\n]+/);
        const classInformation2 = classInformation1[0].split(/[\-]+/);
        course = {
            "courseType": "required",
            "offeredFall": !(classOfferedOnlySpring),
            "offeredSpring": !(classOfferedOnlyFall),
            "discipline": classInformation2[0].trim(),
            "number": parseInt(classInformation2[1].trim()),
            "name": classInformation1[1].trim()
        };
    } else if (courseType == "option") {
        const select = courseDiv.children[0];                       // Select
        const options = select.options;                             // Options
        const label = courseDiv.children[1];                        // Label

        const selectedOption = options[select.selectedIndex];
        const info = selectedOption.textContent.split(/[\-]+/);

        const createdOptions = [];
        Array.from(options).forEach(option => {
            const optionInfo = option.textContent.split(/[\-]+/);
            createdOptions.push({
                "discipline": optionInfo[0],
                "number": parseInt(optionInfo[1]),
                "name": option.value
            });
        });

        course = {
            "courseType": "option",
            "offeredFall": !(classOfferedOnlySpring),
            "offeredSpring": !(classOfferedOnlyFall),
            "discipline": info[0],
            "number": parseInt(info[1]),
            "options": createdOptions
        };
    } else if (courseType == "input") {
        const attribute = courseDiv.children[0].textContent;        // Label
        const inputs = courseDiv.children[1].value.split(/[\-]+/);  // Input
        course = {
            "courseType": "input",
            "offeredFall": !(classOfferedOnlySpring),
            "offeredSpring": !(classOfferedOnlyFall),
            "discipline": inputs[0],
            "number": parseInt(inputs[1]),
            "attribute": attribute
        };
    } else {
        console.log("A course was found with an unknown type.");
    }

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
    transferDividerDiv.style.display = 'revert';
    transferYearDiv.style.display = 'flex';
    transferSection = true;
    showTransferButton.style.display = 'none';
    hideTransferButton.style.display = 'inline-block';
}

/**
 * This hides the Transfer Class section and shows the add transfer button.
 */
function hideTransferSection() {
    if (!transferSection) return;
    transferDividerDiv.style.display = 'none';
    transferYearDiv.style.display = 'none';
    transferSection = false;
    showTransferButton.style.display = 'inline-block';
    hideTransferButton.style.display = 'none';
}

/**
 * This removed all courses and sections.
 * 
 * @param {boolean} resetChoose - whether to reset the "Choose Template"
 * @param {boolean} resetUpload - whether to reset the uploaded filename
 */
function clearFlowchart(resetChoose, resetUpload) {
    if (resetChoose) templateSelect.selectedIndex = 0;  // Resets the "Choose Template" selector to the 1st option.
    if (resetUpload) uploadedFilename = null;           // Resets the name of the uploaded file
    transferDiv.replaceChildren(); // Removes all transfer courses
    hideTransferSection();
    for (let i = 1; i <= academicYearCount; i++) {
        document.getElementById(`year-${i}`).remove();
        document.getElementById(`year-divider-${i}`).remove();
    }
    finalNotesList.textContent = "";                    // Gets rid of the final notes
    academicYearCount = 0; // Resets the year count
}

/**
 * Gets the class border color based on its discipline.
 * 
 * @param {*} discipline - the string discipline
 * @returns the string HTML color
 */
function getDisciplineColor(discipline) {
    switch (discipline) {
        case "CSCI":
        case "CSEC":
        case "GCIS":
        case "ISTE":
        case "NSSA":
        case "SWEN":
            return "Orange";
        case "COMM":
            return "Violet"
        case "MATH":
            return "Blue";
        case "STAT":
            return "DodgerBlue";
        case "PHIL":
            return "HotPink";
        case "PUBL":
            return "Brown";
        case "YOPS":
            return "OrangeRed";
        default:
            return "Black";
    }
}

/**
 * This updates the title at the top of the page based on the template.
 * 
 * @param {*} filename - the flowchart filename
 */
function setPageTitle(filename) {
    switch (filename) {
        case "cs_bs_2526_template.json":
            pageTitle.textContent = "Computer Science BS 2025-2026 Flowchart"
            break;
        case "csec_bs_2526_template.json":
            pageTitle.textContent = "Cyber Security BS 2025-2026 Flowchart"
            break;
        case "cs_bsms_project_2526_template.json":
        case "cs_bsms_thesis_2526_template.json":
            pageTitle.textContent = "Computer Science BS/MS 2025-2026 Flowchart"
            break
        case "cscsec_bsms_project_2526_template.json":
        case "cscsec_bsms_thesis_2526_template.json":
            pageTitle.textContent = "Computer Science/Cyber Security BS/MS 2025-2026 Flowchart"
            break;
        case "csse_bsms_2526_template.json":
            pageTitle.textContent = "Computer Science/Software Engineering BS/MS 2025-2026 Flowchart"
            break;
        default:
            pageTitle.textContent = "Computer Science 2025-2026 Flowchart";
            break;
    }
}
