//------------------------------ STATIC DATA BELOW ------------------------------//

// I added the "General Education: Immersion", "Lab Science: Lab", "Lab Science: Lecture", etc. attributes
// I also count No attributes as open electives

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

const body = document.body;

const fileInput = document.getElementById("fileInput");
const uploadTemplateButton = document.getElementById(`uploadTemplateButton`);
const downloadTemplateButton = document.getElementById(`downloadTemplateButton`);
const pushYearButton = document.getElementById(`pushYearButton`);
const popYearButton = document.getElementById(`popYearButton`);
const showTransferButton = document.getElementById(`showTransferButton`);
const hideTransferButton = document.getElementById(`hideTransferButton`);
const clearFlowchartButton = document.getElementById(`clearFlowchartButton`);

const transferDividerDiv = document.getElementById(`year-divider-1`);
const transferYearDiv = document.getElementById(`year-0`);
const transferDiv = document.getElementById(`transfer`);
makeSortable(transferDiv);

//------------------------------ EVENT LISTENERS BELOW ------------------------------//

fileInput.addEventListener("change", async (event) => {
    // const template  = (await import("/json/cs_bsms_2526_template.json", { with: { type: "json" } })).default;
    // const template  = (await import("/json/cs_bs_2526_template.json", { with: { type: "json" } })).default;
    const file = event.target.files[0];
    const fileText = await file.text();
    const fileData = JSON.parse(fileText);
    uploadTemplate(fileData);
});
// uploadTemplateButton.addEventListener("click", uploadTemplate);
uploadTemplateButton.addEventListener("click", () => fileInput.click());
downloadTemplateButton.addEventListener("click", downloadTemplate);
pushYearButton.addEventListener("click", pushYear);
popYearButton.addEventListener("click", popYear);
showTransferButton.addEventListener("click", showTransferSection);
hideTransferButton.addEventListener("click", hideTransferSection);
clearFlowchartButton.addEventListener("click", clearFlowchart);

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
 * This updates and populates the body given the json template flowchart.
 * This adds a Transfer section for transfer classes.
 * It then adds years, each of which has 3 semesters that may or many not contain courses.
 * 
 * @param {*} template - the flowchart with transfer, year, semester, and course information
 */
function uploadTemplate(template) {
    // Check JSON file formatting
    if (template == null || typeof template != "object" || Array.isArray(template) 
        || template.transfer == undefined || template.college == undefined) {
        alert("The given JSON file does not meet the required formatting.");
        return;
    }

    const transferCourses = template.transfer;
    const years = template.college;

    clearFlowchart(); // This removed the current flowchart
    fillTransferYear(transferCourses); // This handles all transfer classes
    years.forEach(yearInfo => createYear(yearInfo, ++academicYearCount)); // This handles all other semesters and their classes
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
        transferDiv.appendChild(courseDiv);
    });
    showTransferSection();
}

/**
 * This creates a new year div and adds it to the body based on the template flowchart.
 * 
 * @param {*} yearInfo - The object containing the semester objects
 */
function createYear(yearInfo) {
    if (academicYearCount != 1) {
        const yearDividerDiv = document.createElement("div");
        yearDividerDiv.id = `year-divider-${academicYearCount}`
        yearDividerDiv.className = "year-divider";
        body.appendChild(yearDividerDiv);
    }

    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${academicYearCount}`;
    yearDiv.className = "year";

    const yearTextDiv = document.createElement("div");
    yearTextDiv.id = `year-text-${academicYearCount}`
    yearTextDiv.className = "year-text";
    yearTextDiv.textContent = academicYearCount <= 100 ? `${years[academicYearCount - 1]} Year` : `#${academicYearCount} Year`;
    yearDiv.appendChild(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.appendChild(yearBlockDiv);

    semesters.forEach((term, index) => {
        const semesterDiv = createSemester(yearInfo[index], term)
        yearBlockDiv.appendChild(semesterDiv);
    });
    /*yearInfo.forEach((semesterInfo, index) => {
        const semesterDiv = createSemester(semesterInfo, semesters[index])
        yearBlockDiv.appendChild(semesterDiv);
    });*/
    body.appendChild(yearDiv);
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
        semesterDiv.appendChild(courseDiv);
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
    // courseDiv.id = `c10`
    if (courseInfo["co-op"]) {
        courseDiv.className = "co-op";
        courseDiv.textContent = `${courseInfo.name} (${courseInfo.discipline}-${courseInfo.number})`
    } else if (courseInfo.set_course) {
        courseDiv.className = "class";
        courseDiv.textContent = `${courseInfo.discipline}-${courseInfo.number}\n\n${courseInfo.name}`
        switch (courseInfo.discipline) {
            case "CSCI":
            case "SWEN":
                courseDiv.style.borderColor = "Orange";
                break;
            case "MATH":
                courseDiv.style.borderColor = "Blue";
                break;
            case "YOPS":
                courseDiv.style.borderColor = "OrangeRed";
                break;
        }
    } else {
        courseDiv.className = "class";
        courseDiv.textContent = `${courseInfo.attribute}\n\n________`
        const attribute = courseInfo.attribute;
        if (attribute == null || attribute == "") {
            courseDiv.textContent = `Open Elective`
            courseDiv.style.borderColor = "Purple";
        } else if (attribute.startsWith("Activity Course")) {
            courseDiv.style.borderColor = "Yellow";
        } else if (attribute.startsWith("CS")) {
            courseDiv.style.borderColor = "Orange";
        } else if (attribute.startsWith("Gen")) {
            courseDiv.style.borderColor = "Green";
        } else if (attribute.startsWith("Lab Science")) {
            courseDiv.style.borderColor = "Red";
        } else if (attribute.startsWith("Writing Intensive")) {
            courseDiv.style.borderColor = "Green";
        }
    }
    return courseDiv;
}

/**
 * This saves the current flowchart into the needed JSON format.
 */
function downloadTemplate() {
    console.log("TODO");
    const transfer = [];
    const college = [];

    Array.from(transferDiv.children).forEach(courseDiv => {
        const course = processCourse(courseDiv);
        transfer.push(course);
    })

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

    // Downloads the JSON file
    const json = { "transfer": transfer, "college": college };
    const jsonString = JSON.stringify(json);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonObjectUrl = URL.createObjectURL(jsonBlob);
    const jsonFilename = "template.json";
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

    // Examples
    // { "set_course": false, "co-op": false, "attribute": "CS Undergraduate Elective" },
    // { "set_course": true, "co-op": false, "discipline": "CSCI", "number": 344, "name": "Programming Language Concepts" },
    // { "set_course": true, "co-op": true, "discipline": "CSCI", "number": 499, "name": "Semester Co-op" }

    const className = courseDiv.className; // "class" or "co-op"
    const classContent = courseDiv.textContent;
    if (className == "co-op") {
        const classInformation = classContent.split(/[\(\)\-]+/);
        course = {
            "set_course": true,
            "co-op": true,
            "discipline": classInformation[1].trim(),
            "number": parseInt(classInformation[2].trim()),
            "name": classInformation[0].trim()
        };
    } else if (classContent.includes("-")) {
        const classInformation = classContent.split(/[\-\n]+/);
        course = {
            "set_course": true,
            "co-op": false,
            "discipline": classInformation[0].trim(),
            "number": parseInt(classInformation[1].trim()),
            "name": classInformation[2].trim()
        };
    } else {
        course = {
            "set_course": false,
            "co-op": false,
            "attribute": classContent.trim()
        };
    }
    console.log(course);
    return course;
}

/**
 * This adds a new year div to the end of the body.
 */
function pushYear() {
    ++academicYearCount;
    if (academicYearCount > 1) {
        const yearDividerDiv = document.createElement("div");
        yearDividerDiv.id = `year-divider-${academicYearCount}`
        yearDividerDiv.className = "year-divider";
        body.appendChild(yearDividerDiv);
    }

    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${academicYearCount}`;
    yearDiv.className = "year";

    const yearTextDiv = document.createElement("div");
    yearTextDiv.id = `year-text-${academicYearCount}`
    yearTextDiv.className = "year-text";
    yearTextDiv.textContent = academicYearCount <= 100 ? `${years[academicYearCount - 1]} Year` : `#${academicYearCount} Year`;
    yearDiv.appendChild(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.appendChild(yearBlockDiv);

    semesters.forEach(term => {
        const semesterDiv = document.createElement("div");
        semesterDiv.id = `${term}-${academicYearCount}`;
        semesterDiv.className = "semester";
        makeSortable(semesterDiv);
        yearBlockDiv.appendChild(semesterDiv);
    });
    body.appendChild(yearDiv);
}

/**
 * This removes the year div at the end of the body.
 */
function popYear() {
    if (academicYearCount == 0) return;
    if (academicYearCount > 1) document.getElementById(`year-divider-${academicYearCount}`).remove();
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
 */
function clearFlowchart() {
    transferDiv.replaceChildren(); // Removes all transfer courses
    hideTransferSection();
    for (let i = 1; i <= academicYearCount; i++) {
        if (i != 1) document.getElementById(`year-divider-${i}`).remove();
        document.getElementById(`year-${i}`).remove();
    }
    academicYearCount = 0; // Resets the year count
}
