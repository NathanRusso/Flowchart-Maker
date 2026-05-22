const body = document.body;
let currentAcademicYear = 1; // The numbers of years of school currently being listed.

const fall_1 = document.getElementById(`fall-${currentAcademicYear}`);
const spring_1 = document.getElementById(`spring-${currentAcademicYear}`);
const summer_1 = document.getElementById(`summer-${currentAcademicYear}`);
makeSortable(fall_1);
makeSortable(spring_1);
makeSortable(summer_1);

/**
 * This makes the given div element sortable.
 * 
 * @param {*} element - the given semester div
 */
function makeSortable(element) {
    Sortable.create(element, {
        group: "semester",
        animation: 200,
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
 * This appends a new year divider and year element to the body.
 * The html being created is as follows:
 * 
 * <div id="year-divider-#" class="year-divider"></div>
 * <div id="year-#">
 *     <div id="fall-# class="semester"></div>
 *     <div id="spring-#" class="semester"></div>
 *     <div id="summer-#" class="semester"></div>
 * </div>
 */
function addYear() {
    currentAcademicYear++;
    console.log(`Add Year ${currentAcademicYear}`);

    const yearDividerDiv = document.createElement("div");
    yearDividerDiv.id = `year-divider-${currentAcademicYear}`
    yearDividerDiv.className = "year-divider";
    body.appendChild(yearDividerDiv);

    const yearDiv = document.createElement("div");
    yearDiv.id = `year-${currentAcademicYear}`
    const semesters = ["fall", "spring", "summer"];
    semesters.forEach(term => {
        const semesterDiv = document.createElement("div");
        semesterDiv.id = `${term}-${currentAcademicYear}`;
        semesterDiv.className = "semester";
        makeSortable(semesterDiv);
        yearDiv.appendChild(semesterDiv);
    });
    body.appendChild(yearDiv);
}

/**
 * This removes a year divider and year element from the body.
 */
function removeYear() {
    if (currentAcademicYear == 1) return;
    console.log(`Remove Year ${currentAcademicYear}`);
    document.getElementById(`year-divider-${currentAcademicYear}`).remove();
    document.getElementById(`year-${currentAcademicYear}`).remove();
    currentAcademicYear--;
}
