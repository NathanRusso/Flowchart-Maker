function dragstartHandler(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function dragoverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    event.currentTarget.appendChild(document.getElementById(data));
}
