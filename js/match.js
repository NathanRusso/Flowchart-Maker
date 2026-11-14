/**
 * This file contains massive mapping functions for assigning pathways and colors.
 * Note: Unlike other files, 'FUNCTIONS' is above 'DATA'
 */

//------------------------------ FUNCTIONS BELOW ------------------------------//

/**
 * Gets a formatted pathway and its group to display in the template dropdown.
 * 
 * @param {string} pathway - the pathway code at the start of templates 
 * @returns the formatted pathway string and group if there is a match; otherwise [null, null]
 */
export function getDisplayPathwayAndGroup(pathway) {
    return PATHWAY_GROUP_MAP[pathway] || [null, null];
}

/**
 * Gets the class border color based on its discipline.
 * 
 * @param {string} discipline - the string discipline
 * @returns the string HTML/CSS color
 */
export function getDisciplineColor(discipline) {
    return DISCIPLINE_COLORS_MAP[discipline] || "var(--text-color)";
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

//------------------------------ DATA BELOW ------------------------------//

// A map of pathways to their formatted pathway and group
const PATHWAY_GROUP_MAP = {
    "ai":       ["AI", "Artificial Intelligence"],
    "ce":       ["CE", "Computing Exploration"],
    "cit":      ["CIT", "Computing and Information Technology"],
    "cs":       ["CS", "Computer Science"],
    "cscsec":   ["CS/CSEC", "Computer Science"],
    "csdsci":   ["CS/DSCI", "Computer Science"],
    "csse":     ["CS/SE", "Computer Science"],
    "csec":     ["CSEC", "Cybersecurity"],
    "csecstpp": ["CSEC/STPP", "Cybersecurity"],
    "gdd":      ["GDD", "Game Design and Development"],
    "hcc":      ["HCC", "Human-Centered Computing"],
    "hcd":      ["HCD", "Humanities, Computing, and Design"],
    "it":       ["IT", "Information Technology"],
    "nmid":     ["NMID", "New Media Interactive Development"],
    "se":       ["SE", "Software Engineering"],
    "secs":     ["SE/CS", "Software Engineering"],
    "secsec":   ["SE/CSEC", "Software Engineering"],
}

// A map of all course disciplines to colors
const DISCIPLINE_COLORS_MAP = {
    // Academic Services
    "ELCE": "var(--text-color)",

    // College of Art and Design, 
    "ARED": "Turquoise",
    "ARTH": "Turquoise",
    "ARTX": "Turquoise",
    "CCER": "Turquoise",
    "CGEN": "Turquoise",
    "CGLS": "Turquoise",
    "CMTJ": "Turquoise",
    "CWFD": "Turquoise",
    "CWTD": "Turquoise",
    "DDDD": "Turquoise",
    "FDTN": "Turquoise",
    "GAMA": "Turquoise",
    "GRDE": "Turquoise",
    "IDDE": "Turquoise",
    "IDEA": "Turquoise",
    "ILLM": "Turquoise",
    "ILLS": "Turquoise",
    "IMSM": "Turquoise",
    "INDE": "Turquoise",
    "INGD": "Turquoise",
    "ITDI": "Turquoise",
    "MAKE": "Turquoise",
    "NMDE": "Turquoise",
    "PAIT": "Turquoise",
    "PHAP": "Turquoise",
    "PHAR": "Turquoise",
    "PHFA": "Turquoise",
    "PHGR": "Turquoise",
    "PHMS": "Turquoise",
    "PHPJ": "Turquoise",
    "PHPS": "Turquoise",
    "PHVM": "Turquoise",
    "PRNT": "Turquoise",
    "SCUL": "Turquoise",
    "SOFA": "Turquoise",
    "STAR": "Turquoise",
    "VCDE": "Turquoise",

    // [Legacy] College of Imaging Arts and Sciences
    "ADGR": "Turquoise",
    "ARDE": "Turquoise",
    "CEXT": "Turquoise",
    "FNAS": "Turquoise",
    "IMPT": "Turquoise",
    "PHBM": "Turquoise",
    "UXDE": "Turquoise",

    // College of Engineering Technology
    "CETL": "DarkOrange",
    "CONM": "DarkOrange",
    "CPET": "DarkOrange",
    "CVET": "DarkOrange",
    "EEET": "DarkOrange",
    "EMET": "DarkOrange",
    "ENGT": "DarkOrange",
    "ESHS": "DarkOrange",
    "FCMG": "DarkOrange",
    "GRCS": "DarkOrange",
    "MAAT": "DarkOrange",
    "MCET": "DarkOrange",
    "MECA": "DarkOrange",
    "MFET": "DarkOrange",
    "PACK": "DarkOrange",
    "PPRT": "DarkOrange",
    "RMET": "DarkOrange",
    "TCET": "DarkOrange",

    // [Legacy] College of Applied Science & Technology
    "DEMT": "DarkOrange",
    "FOOD": "DarkOrange",
    "GEOT": "DarkOrange",
    "PLTW": "DarkOrange",

    // College of Health Sciences and Technology
    "BHNS": "MediumSlateBlue",
    "CHST": "MediumSlateBlue",
    "DCHP": "MediumSlateBlue",
    "DMSO": "MediumSlateBlue",
    "ECHO": "MediumSlateBlue",
    "EXSC": "MediumSlateBlue",
    "GLPH": "MediumSlateBlue",
    "HLTH": "MediumSlateBlue",
    "HMIL": "MediumSlateBlue",
    "MEDG": "MediumSlateBlue",
    "MEDS": "MediumSlateBlue",
    "NUTR": "MediumSlateBlue",
    "OCTH": "MediumSlateBlue",
    "PHYA": "MediumSlateBlue",
    "WSHN": "MediumSlateBlue",

    // College of Liberal Arts
    "ANTH": "HotPink",
    "CLA": "HotPink",
    "COGS": "HotPink",
    "COMM": "HotPink",
    "CRIM": "HotPink",
    "DHSS": "HotPink",
    "ECON": "HotPink",
    "FNRT": "HotPink",
    "HIST": "HotPink",
    "HUMA": "HotPink",
    "INGS": "HotPink",
    "ITDA": "HotPink",
    "ITDL": "HotPink",
    "MUSE": "HotPink",
    "PHIL": "HotPink",
    "POLS": "HotPink",
    "PRFL": "HotPink",
    "PSYC": "HotPink",
    "PUBL": "HotPink",
    "SOCI": "HotPink",
    "SPSY": "HotPink",
    "STSO": "HotPink",
    "URBS": "HotPink",
    "VISL": "HotPink",
    "WGST": "HotPink",

    "ENGL": "Green",
    "LING": "Green",
    "MLAL": "Green",
    "MLAR": "Green",
    "MLAS": "Green",
    "MLCH": "Green",
    "MLCU": "Green",
    "MLFR": "Green",
    "MLGR": "Green",
    "MLIT": "Green",
    "MLJP": "Green",
    "MLPO": "Green",
    "MLRU": "Green",
    "MLSP": "Green",
    "MLST": "Green",

    // College of Science
    "ASTP": "Crimson",
    "BIOG": "Crimson",
    "BIOL": "Crimson",
    "CGNS": "Crimson",
    "CHEM": "Crimson",
    "CHEN": "Crimson",
    "CHMA": "Crimson",
    "CHMB": "Crimson",
    "CHMC": "Crimson",
    "CHMG": "Crimson",
    "CHMI": "Crimson",
    "CHMO": "Crimson",
    "CHMP": "Crimson",
    "CHPO": "Crimson",
    "CLRS": "Crimson",
    "ENVS": "Crimson",
    "GSCI": "Crimson",
    "HOSM": "Crimson",
    "IMGS": "Crimson",
    "INTS": "Crimson",
    "ITDS": "Crimson",
    "MTSE": "Crimson",
    "PHYS": "Crimson",

    "MATH": "MediumBlue",
    "STAT": "MediumBlue",

    // Golisano College of Computing and Information Sciences
    "CINT": "DarkOrange",
    "CISC": "DarkOrange",
    "CSCI": "DarkOrange",
    "CSEC": "DarkOrange",
    "DSCI": "DarkOrange",
    "GCIS": "DarkOrange",
    "HCIN": "DarkOrange",
    "IDAI": "DarkOrange",
    "IGME": "DarkOrange",
    "ISCH": "DarkOrange",
    "ISTE": "DarkOrange",
    "MEDI": "DarkOrange",
    "NSSA": "DarkOrange",
    "SWEN": "DarkOrange",

    // Golisano Institute for Sustainability
    "ARCH": "DarkSeaGreen",
    "ISUS": "DarkSeaGreen",

    // Kate Gleason College of Engineering
    "BCEP": "DarkOrange",
    "BIME": "DarkOrange",
    "CHME": "DarkOrange",
    "CMPE": "DarkOrange",
    "CMPR": "DarkOrange",
    "CQAS": "DarkOrange",
    "ECEP": "DarkOrange",
    "EEEE": "DarkOrange",
    "EGEN": "DarkOrange",
    "ENGR": "DarkOrange",
    "ISEE": "DarkOrange",
    "MCEE": "DarkOrange",
    "MCSE": "DarkOrange",
    "MECE": "DarkOrange",
    "MIEP": "DarkOrange",

    // National Technical Institute for the Deaf
    "ASLC": "DodgerBlue",
    "DEAF": "DodgerBlue",
    "HCIA": "DodgerBlue",
    "INTP": "DodgerBlue",
    "LEAD": "DodgerBlue",
    "MSSE": "DodgerBlue",
    "N3DG": "DodgerBlue",
    "NACA": "DodgerBlue",
    "NACC": "DodgerBlue",
    "NACT": "DodgerBlue",
    "NAIS": "DodgerBlue",
    "NASL": "DodgerBlue",
    "NAST": "DodgerBlue",
    "NBUS": "DodgerBlue",
    "NCAD": "DodgerBlue",
    "NCAR": "DodgerBlue",
    "NCIM": "DodgerBlue",
    "NCOM": "DodgerBlue",
    "NDLS": "DodgerBlue",
    "NENG": "DodgerBlue",
    "NETS": "DodgerBlue",
    "NGRD": "DodgerBlue",
    "NGRP": "DodgerBlue",
    "NHSS": "DodgerBlue",
    "NLST": "DodgerBlue",
    "NMAD": "DodgerBlue",
    "NMTH": "DodgerBlue",
    "NPMT": "DodgerBlue",
    "NSCI": "DodgerBlue",
    "NSVP": "DodgerBlue",
    "NTID": "DodgerBlue",
    "PRFN": "DodgerBlue",

    // Saunders College of Business
    "ACCT": "SaddleBrown",
    "BANA": "SaddleBrown",
    "BLEG": "SaddleBrown",
    "DECS": "SaddleBrown",
    "ESCB": "SaddleBrown",
    "FINC": "SaddleBrown",
    "HRDE": "SaddleBrown",
    "HSPT": "SaddleBrown",
    "INTB": "SaddleBrown",
    "MGIS": "SaddleBrown",
    "MGMT": "SaddleBrown",
    "MKTG": "SaddleBrown",
    "SCBI": "SaddleBrown",
    "SERQ": "SaddleBrown",

    // School of Individualized Study, [Legacy/Sub] Interdisciplinary Studies 
    "ACBS": "Green",
    "ACDS": "Green",
    "AERO": "Green",
    "ARMY": "Green",
    "BUSI": "Green",
    "CMDS": "Green",
    "EDLI": "Green",
    "HNRS": "Green",
    "INTSD": "Green",
    "IRES": "Green",
    "MGNL": "Green",
    "MTSC": "Green",
    "PMED": "Green",
    "PROF": "Green",
    "QLTM": "Green",
    "RITH": "Green",
    "SAB": "Green",
    "SECU": "Green",
    "SOIS": "Green",
    "TCOM": "Green",
    "UWRT": "Green",

    // Student Affairs, [Legacy/Sub] Wellness Instructional Program
    "ACSC": "OrangeRed",
    "CRPG": "OrangeRed",
    "EDGE": "OrangeRed",
    "ELCA": "OrangeRed",
    "ELCI": "OrangeRed",
    "FYEP": "OrangeRed",
    "SLSA": "OrangeRed",
    "YOPS": "OrangeRed",

    "BTRM": "Gold",
    "WCLB": "Gold",
    "WDAN": "Gold",
    "WFIT": "Gold",
    "WHLS": "Gold",
    "WHWS": "Gold",
    "WINT": "Gold",
    "WMAR": "Gold",
    "WMIL": "Gold",
    "WMUS": "Gold",
    "WREC": "Gold",
    "WVAR": "Gold",
}
