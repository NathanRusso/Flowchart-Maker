//------------------------------ IMPORTS ------------------------------//
import * as color from "/js/color.js";

//------------------------------ DATA BELOW ------------------------------//

export const years = [
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
export const semesters = ["Fall", "Spring", "Summer"];
const courseRegex = /^[A-Z]{4}-[0-9]{1,3}H?$/;

let hyperDictionary = {}        // A mapping of hyperParentIds to hyperChildIds to their courseDivs
let initialHyperChildIds = {}   // A mapping of hyperParentIds to the initial hyperChildIds
let exoticDictionary = {}       // A mapping of exoticIds to lists if related courseDivs
let initialExoticIndexes = {}   // A mapping of exoticIds to the initial selected index

//------------------------------ FUNCTIONS ------------------------------//

/**
 * This makes the given div element sortable.
 * 
 * @param {*} element - the given semester div
 */
export function makeSortable(element) {
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
 * This creates a new year div and adds it to the body based on the template flowchart.
 * 
 * @param {*} yearInfo - The object containing the semester objects
 * @param {int} academicYearCount - The current number of academic years
 */
export function createYear(yearInfo, academicYearCount) {
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
        const semesterDiv = createSemester(yearInfo[index], term);
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
 * @param {int} academicYearCount - The current number of academic years
 * @returns the semester div
 */
function createSemester(semesterInfo, term, academicYearCount) {
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
export function createCourse(courseInfo) {
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
            courseDiv.style.borderColor = color.getDisciplineColor(courseDiscipline);
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
            courseDiv.style.borderColor = color.getAttributeColor(courseAttribute);
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
                        courseDiv.style.borderColor = color.getAttributeColor(optionAttribute);
                    } else {
                        courseDiv.style.borderColor = color.getDisciplineColor(optionDiscipline);
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
                    courseDiv.style.borderColor = color.getDisciplineColor(option.dataset.optionDiscipline);
                } else { // Option is input
                    label.style.display = "none";
                    label.textContent = "";
                    select.style.height = "50px";
                    courseDiv.style.borderColor = color.getAttributeColor(option.dataset.optionAttribute);
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
                    courseDiv.style.borderColor = color.getAttributeColor(optionAttribute ?? courseAttribute);
                }
            });

            // Configures exotic ids and their course divs
            if (validExoticId) {
                if (courseExoticId in initialExoticIndexes) {
                    let savedInitialExoticId = initialExoticIndexes[courseExoticId];
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

    // This adds an event listener to display the class information pop-up
    courseDiv.addEventListener("click", (event) => displayCoursePopup(event.target));

    return courseDiv;
}

/**
 * This will query the database for course information and display its popup.
 * 
 * @param {*} target - the courseDiv event target
 */
function displayCoursePopup(target) {
    const tagName = target.tagName;
    if (tagName == "INPUT" || tagName == "OPTION" || tagName == "SELECT") return;

    const courseDataset = tagName == "LABEL" ? target.parentElement.dataset : target.dataset;
    const courseChildren = tagName == "LABEL" ? target.parentElement.children : target.children;
    console.log(courseDataset);

    const courseType = courseDataset.courseType;
    console.log(courseType);
    console.log(courseChildren);

    switch (courseType) {
        case "co-op-required": {
            coursePopup.style.borderColor = "var(--co-op-color)";

            break;
        }
        case "co-op-option": {
            coursePopup.style.borderColor = "var(--co-op-color)";

            break;
        }
        case "class-required": {
            coursePopup.style.borderColor = color.getDisciplineColor(courseDataset.courseDiscipline);
            break;
        }
        case "class-input": {
            coursePopup.style.borderColor = color.getAttributeColor(courseDataset.courseAttribute);

            break;
        }
        case "class-option-mix": {
            // coursePopup.style.borderColor = color.getDisciplineColor(courseDataset.courseAttribute);

            break;
        }
        case "class-option-attribute": {
            coursePopup.style.borderColor = color.getAttributeColor(courseDataset.courseAttribute);

            break;
        }
    }
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
 * This makes sure only the hyper classes linked to a selected option are shown
 */
export function initializeHyper() {
    for (const [hyperParentId, hyperChildId] of Object.entries(initialHyperChildIds)) {
        updateHyperCourseDivs(Number(hyperParentId), Number(hyperChildId));
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
                courseDiv.style.borderColor = color.getAttributeColor(attribute);
                courseDiv.style.display = "flex";
            } else {
                courseDiv.style.display = "none";
            }
        });
    }
}

/**
 * This makes sure exotic option classes are set properly
 */
export function initializeExotic() {
    for (const [exoticId, selectedIndex] of Object.entries(initialExoticIndexes)) {
        updateExoticCourseDivs(Number(exoticId), Number(selectedIndex));
    }
}
