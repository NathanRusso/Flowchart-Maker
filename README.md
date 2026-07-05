# Flowchart Maker

This website provides interactive flowcharts for every GCCIS degree pathway at RIT. Students can organize courses by semester, customize their schedules, and save or reload their progress.

Table of Contents:
* [Features](#features)
* [How Does the Website Work](#how-does-the-website-work)
* [Current Templates Available](#current-templates-available)
* [Abbreviations](#abbreviations)
* [Technologies Used](#technologies-used)

## Features
- Interactive drag-and-drop course planning
- Degree templates for all GCCIS pathways
- Save and load flowcharts
- Customizable electives and course options
- Transfer credit support
- Dynamic year management

## How Does the Website Work?

Each flowchart represents a specific GCCIS pathway that one can pursue while at RIT. Each of the provided [templates](#current-templates-available) is set up with all of the required [courses (classes and co-ops)](#course-types) needed to complete the degree.

Users can choose a template from the [available templates](#current-templates-available). Once selected, they can move the course squares around to match the semesters in which the classes were taken. Then, they can fill in any of the empty course slots or set any of the dropdown courses with classes they have taken. Once satisfied, the flowchart can be saved into the user's file system. Finally, when wanting to view or edit the flowchart again, the user can upload the template back to the website.

### Flowchart Format

Each flowchart is divided into sections by year. Each year has 3 blocks inside of it that represent the Fall, Spring, and Summer semesters. Each semester block can hold any number of [classes](#classes) or a single [co-op](#co-ops). Additionally, a hidden transfer section can be revealed, which exists as its own standalone section with a single block inside. This can be used to allocate the classes that were completed upon transferring credits, such as AP classes or classes from other colleges.

### Buttons and Dropdowns
1. **Choose Template** - A dropdown with all [available templates](#current-templates-available) that will load prebuilt flowcharts
2. **Upload Flowchart** - A button that allows you to upload a saved template flowchart
3. **Save Template** - A button that downloads the current flowchart with all its changes
4. **Add Year** - A button that adds a year section below the lowest year section
5. **Remove Year** - A button that removes the lowest year section, deleting all data inside of it
6. **Show Transfer** - A button that shows the transfer section
7. **Hide Transfer** - A button that hides the transfer section, saving all data inside of it
8. **Clear Flowchart** - A button that deletes the current flowchart and reverts the website to its default state

### Course Types

#### Classes
- **Class Required** - A defined course that must be taken
- **Class Input** - An undefined course slot for which you must pick one course to fill that typically falls into some category
- **Class Option Mix** - A group of defined courses for which you must pick one from
- **Class Option Attribute** - A group of defined courses for which you must pick one from which all fall under the same label
- **(*) Hyper Option** - Both option types may have associated courses that are only required when said option is selected

#### Co-ops
- **Co-op Required** - A cooperative education/internship block that encompasses an entire semester
- **Co-op Option** - A group of courses that qualify as possible co-ops, including co-ops themselves and other pathway specified options

## Current Templates Available

### Artificial Intelligence (AI)
- Artificial Intelligence BS (2025-2026)

### Computing Exploration (CE)
- Computing Exploration (2025-2026)

### Computing and Information Technology (CIT)
- Computing and Information Technology BS (2025-2026)

### Computer Science (CS)
- Computer Science BS (2025-2026)
- Computer Science BS/MS (2025-2026)
- Computer Science/Cybersecurity BS/MS (2025-2026)
- Computer Science/Software Engineering BS/MS (2025-2026)

### Cybersecurity (CSEC)
- Cybersecurity BS (2025-2026)
- Cybersecurity BS/MS (2025-2026)
- Cybersecurity/STPP BS/MS (2025-2026)

### Game Design and Development (GDD)
- Game Design and Development BS (2025-2026)
- Game Design and Development BS/MS (2025-2026)

### Human-Centered Computing (HCC)
- Human-Centered Computing BS (2025-2026)

### Humanities, Computing, and Design (HCD)
- Humanities, Computing, and Design BS (2025-2026)

### New Media Interactive Development (NMID)
- New Media Interactive Development BS (2025-2026)

### Software Engineering (SE)
- Software Engineering BS (2025-2026)
- Software Engineering BS/MS (2025-2026)
- Software Engineering/Computer Science BS/MS (2025-2026)
- Software Engineering/Cybersecurity BS/MS (2025-2026)

## Abbreviations 

### Pathway Abbreviations

- **AI** – Artificial Intelligence  
- **CE** – Computing Exploration  
- **CIT** – Computing and Information Technology  
- **CS** – Computer Science  
- **CSEC** – Cybersecurity  
- **GDD** – Game Design and Development  
- **HCC** – Human-Centered Computing  
- **HCD** – Humanities, Computing, and Design  
- **NMID** – New Media Interactive Development  
- **SE** – Software Engineering  

### Degree Abbreviations

- **BS** - Bachelor of Science
- **MS** - Master of Science

### Other Abbreviations

- **CSH** - [Computer Science House](https://csh.rit.edu/)
- **Co-op** - Cooperative Education
- **GCCIS** - [Golisano College of Computing and Information Sciences](https://www.rit.edu/computing/)
- **RIT** - [Rochester Institute of Technology](https://www.rit.edu/)

## Technologies Used

### Languages
- HyperText Markup Language (HTML)
- Cascading Style Sheets (CSS)
- JavaScript (JS)

### Libraries

- [SortableJS](https://github.com/SortableJS/Sortable) - Allows course blocks to be rearranged with smooth drag-and-drop interactions

### Hosting

- The website is hosted on OpenShift (OKD) by CSH.
