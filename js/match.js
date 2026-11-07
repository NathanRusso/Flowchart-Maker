/**
 * This file contains massive case functions for assigning colors and matching pathways.
 */

//------------------------------ FUNCTIONS BELOW ------------------------------//

/**
 * Gets the class border color based on its discipline.
 * 
 * @param {string} discipline - the string discipline
 * @returns the string HTML/CSS color
 */
export function getDisciplineColor(discipline) {
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
        case "DSCI":
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
 * @param {string} attribute - the string attribute
 * @returns the string HTML/CSS color
 */
export function getAttributeColor(attribute) {
    if (typeof attribute !== "string") return "var(--text-color)";

    if (attribute === "Wellness Course") {
        return "Gold";
    } else if (attribute.includes("Open Elective") || attribute === "Graduate Elective") {
        return "Purple";
    } else if (attribute.includes("Gen Ed") || attribute.includes("Writing Intensive") || attribute === "Professional Elective") {
        return "Green";
    } else if (attribute.includes("Lab Science")) {
        return "Crimson";
    } else if (attribute.includes("Math/Science")) {
        return "DarkViolet"
    } else if (attribute.includes("AI") || attribute.includes("IDAI") || attribute.includes("CIT")  
            || attribute.includes("CS") || attribute.includes("CSCI") || attribute.includes("CSEC") 
            || attribute.includes("DSCI") || attribute.includes("Engineering Elective")
            || attribute.includes("GCIS") || attribute.includes("GDD") || attribute.includes("HCC") 
            || attribute.includes("IGM") || attribute.includes("IGME") || attribute.includes("ISTE") 
            || attribute.includes("NMID") || attribute.includes("NSSA") || attribute.includes("SE") 
            || attribute.includes("SWEN")) {
        return "DarkOrange";
    } else if (attribute.includes("DHSS")) {
        return "HotPink";
    } else {
        return "var(--text-color)";
    }
}

/**
 * Gets a formatted pathway and its group to display in the template dropdown.
 * 
 * @param {string} pathway - the pathway code at the start of templates 
 * @returns the formatted pathway string and group if there is a match; otherwise [null, null]
 */
export function getDisplayPathwayAndGroup(pathway) {
	switch (pathway) {
        case "ai":
            return ["AI", "Artificial Intelligence"];
        case "ce":
            return ["CE", "Computing Exploration"];
        case "cit":
            return ["CIT", "Computing and Information Technology"];
        case "cs":
            return ["CS", "Computer Science"];
        case "cscsec":
            return ["CS/CSEC", "Computer Science"];
        case "csdsci":
            return ["CS/DSCI", "Computer Science"]
        case "csse":
            return ["CS/SE", "Computer Science"];
        case "csec":
            return ["CSEC", "Cybersecurity"];
        case "csecstpp":
            return ["CSEC/STPP", "Cybersecurity"];
        case "gdd":
            return ["GDD", "Game Design and Development"];
        case "hcc":
            return ["HCC", "Human-Centered Computing"];
        case "hcd":
            return ["HCD", "Humanities, Computing, and Design"];
        case "it":
            return ["IT", "Information Technology"];
        case "nmid":
            return ["NMID", "New Media Interactive Development"];
        case "se":
            return ["SE", "Software Engineering"];
        case "secs":
            return ["SE/CS", "Software Engineering"];
        case "secsec":
            return ["SE/CSEC", "Software Engineering"];
        default:
            return [null, null];
	}
}
