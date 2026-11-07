/**
 * This file handles all logic for the course popup, including its database call.
 */

//------------------------------ DATA BELOW ------------------------------//

const coursePopup = document.getElementById("coursePopup");
const coursePopupButton = document.getElementById("coursePopupButton");
const coursePopupTitle = document.getElementById("coursePopupTitle");
const coursePopupDescription = document.getElementById("coursePopupDescription");
const coursePopupPrerequisites = document.getElementById("coursePopupPrerequisites");
const coursePopupOffered = document.getElementById("coursePopupOfferedContent");
const coursePopupContact = document.getElementById("coursePopupContactContent");

export const courseRegex = /^[A-Z]{4}-[0-9]{1,3}H?$/;
let courseInformationCache = {} // A mapping of courses to their database information

//------------------------------ EVENT LISTENERS BELOW ------------------------------//

coursePopupButton.addEventListener("click", hideCoursePopup);

//------------------------------ FUNCTIONS BELOW ------------------------------//

/**
 * This will hide the course information popup.
 */
function hideCoursePopup() {
    coursePopup.classList.remove("reveal");
    coursePopup.classList.add("hide");
    coursePopup.dataset.courseDiscipline = "";
    coursePopup.dataset.courseNumber = "";

    // Hides the element from the DOM view without blocking animation
    // "once: true" deletes the event listener
    coursePopup.addEventListener("animationend", () => { 
        coursePopup.style.display = "none";
        coursePopup.classList.remove("hide");
    }, { once: true });
}

/**
 * This will hide the course information popup with no animation..
 */
export function hideCoursePopupQuick() {
    coursePopup.classList.remove("reveal");
    coursePopup.dataset.courseDiscipline = "";
    coursePopup.dataset.courseNumber = ""; 
    coursePopup.style.display = "none";
}

/**
 * This will reveal the course information popup.W
 */
function revealCoursePopup() {
    coursePopup.style.display = "flex";
    coursePopup.classList.remove("hide");
    coursePopup.classList.add("reveal");
}

/**
 * This will query the database for course information and display its popup.
 * 
 * @param {*} target - the courseDiv event target
 */
export function displayCoursePopup(target) {
    const tagName = target.tagName;
    if (tagName == "INPUT" || tagName == "OPTION" || tagName == "SELECT") return;

    if (tagName == "LABEL") target = target.parentElement;
    const courseDataset = target.dataset;
    const courseChildren = target.children;
    const courseType = courseDataset.courseType;
    let courseDiscipline = courseDataset.courseDiscipline;
    let courseNumber = courseDataset.courseNumber;
    let courseColor = getComputedStyle(target).borderColor ?? "var(--text-color)";

    // Gets the correct course discipline and number. Required classes need no extra logic.
    switch (courseType) {
        case "co-op-option": {
            const courseSelectedDataset = courseChildren[0].selectedOptions[0].dataset;
            courseDiscipline = courseSelectedDataset.optionDiscipline;
            courseNumber = courseSelectedDataset.optionNumber;
            break;
        }
        case "class-input": {
            const currentInputValue = courseChildren[1].value;
            if (!currentInputValue || !courseRegex.test(currentInputValue)) {
                alert("Cannot find course information. Format must be in ABCD-123, ABCD-123H, or blank!");
                return;
            }
            const courseValues = currentInputValue.trim().split("-");
            courseDiscipline = courseValues[0];
            courseNumber = courseValues[1];
            break;
        }
        case "class-option-mix": {
            const courseSelected = courseChildren[0].selectedOptions[0];
            const courseSelectedValue = courseSelected.value;
            const courseSelectedDataset = courseSelected.dataset;

            if (courseSelectedValue) {
                courseDiscipline = courseSelectedDataset.optionDiscipline;
                courseNumber = courseSelectedDataset.optionNumber;
            } else {
                const currentInputValue = courseChildren[2].value;
                if (!currentInputValue || !courseRegex.test(currentInputValue)) {
                    alert("Cannot find course information. Format must be in ABCD-123, ABCD-123H, or blank!");
                    return;
                }
                const courseValues = currentInputValue.trim().split("-");
                courseDiscipline = courseValues[0];
                courseNumber = courseValues[1];
            }
            break;
        }
        case "class-option-attribute": {
            const courseSelectedDataset = courseChildren[1].selectedOptions[0].dataset;
            courseDiscipline = courseSelectedDataset.optionDiscipline;
            courseNumber = courseSelectedDataset.optionNumber;
            break;
        }
    }

    // Check if the current course is currently displayed. Hide it if it is
    const datasetDiscipline = coursePopup.dataset?.courseDiscipline;
    const datasetNumber = coursePopup.dataset?.courseNumber;
    if (datasetDiscipline === courseDiscipline && datasetNumber === courseNumber) {
        hideCoursePopup();
        return;
    }
    coursePopup.dataset.courseDiscipline = courseDiscipline;
    coursePopup.dataset.courseNumber = courseNumber;

    // Check if the user already asked for the course
    const courseKey = `${courseDiscipline}-${courseNumber}`;
    if (Object.hasOwn(courseInformationCache, courseKey)) {
        const popupInformation = courseInformationCache[courseKey];
        coursePopup.style.borderColor = popupInformation.borderColor;
        coursePopupTitle.textContent = popupInformation.title;
        coursePopupDescription.textContent = popupInformation.description;
        coursePopupPrerequisites.textContent = popupInformation.prerequisites;
        coursePopupOffered.textContent = popupInformation.typically_offered;
        coursePopupContact.textContent = popupInformation.contact_hours;
        revealCoursePopup();
        return;
    }

    // Gets the course information from the database and updates the popup.
    getCourseDatabaseInformation(courseDiscipline, courseNumber).then(courseDBInfo => {
        if (!courseDBInfo) {
            alert(`Cannot find information on course ${courseDiscipline}-${courseNumber}!`);
            return;
        }
        coursePopup.style.borderColor = courseColor;
        const courseCreditString = courseDBInfo.credits == 1 ? "Credit" : "Credits";
        coursePopupTitle.textContent = `${courseDBInfo.code}-${courseDBInfo.course} ${courseDBInfo.title} (${courseDBInfo.credits} ${courseCreditString})`;
        coursePopupDescription.textContent = courseDBInfo.description.replace(/\u001A/g, "'");              // Handles character issue in database dump.
        coursePopupPrerequisites.textContent = courseDBInfo.prerequisites.replace(/\u001A/g, "'") ?? "";    // Handles character issue in database dump.
        coursePopupOffered.textContent = courseDBInfo.typically_offered ?? "";
        coursePopupContact.textContent = courseDBInfo.contact_hours ?? "";
        courseInformationCache[courseKey] = {
            borderColor: courseColor,
            title: coursePopupTitle.textContent,
            description: coursePopupDescription.textContent,
            prerequisites: coursePopupPrerequisites.textContent,
            typically_offered: coursePopupOffered.textContent,
            contact_hours: coursePopupContact.textContent
        }
        revealCoursePopup();
    });
}

/**
 * This gets the most recent course information for the selected course.
 * 
 * @param {string} discipline - the course discipline. Ex: ABCD.
 * @param {string} number - the course number. Ex: 999.
 * @returns the course's information if successful; otherwise, null.
 */
async function getCourseDatabaseInformation(discipline, number) {
    const url = new URL("/api/course", window.location.origin);
    url.search = new URLSearchParams({ discipline: discipline, number: number });
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result;
    } catch (error) {
        console.error(`[ERROR] getCourseDatabaseInformation(): ${error.message}!`);
        return null;
    }
}
