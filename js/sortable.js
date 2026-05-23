// I added the "General Education: Immersion", "Lab Science: Lab", and "Lab Science: Lecture" attributes
// No attributes is an open elective
course_types = [
    "set_course",   // A predefined course in the RIT system
    "open_course"   // A selectable course to fulfil a requirement
]
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

const body = document.body;
let academicYearCount = 0; // The numbers of years of school currently being listed.

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
 */
async function uploadTemplate() {
    const template  = (await import("/json/cs_bsms_2526_template.json", { with: { type: "json" } })).default;
    template.forEach(yearInfo => createYear(yearInfo, ++academicYearCount));
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
    yearTextDiv.textContent = `${years[academicYearCount - 1]} Year` || "";
    yearDiv.appendChild(yearTextDiv);

    const yearBlockDiv = document.createElement("div");
    yearBlockDiv.id = `year-block-${academicYearCount}`
    yearBlockDiv.className = "year-block";
    yearDiv.appendChild(yearBlockDiv);

    yearInfo.forEach((semesterInfo, index) => {
        const semesterDiv = createSemester(semesterInfo, semesters[index])
        yearBlockDiv.appendChild(semesterDiv);
    });
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

function downloadTemplate() {
    console.log("TODO");
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
    yearTextDiv.textContent = `${years[academicYearCount - 1]} Year` || ". . .";
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

async function addClass() {
    console.log("addClass()");
    const module  = await import("/json/class.json", { with: { type: "json" } });
    console.log(module);
    const classDiv = document.createElement("div");
    classDiv.id = `c10`
    classDiv.className = "class";
    classDiv.textContent = "NEW CLASS";
    const latest_semester = document.getElementById(`summer-${currentAcademicYear}`);
    latest_semester.appendChild(classDiv);
}
