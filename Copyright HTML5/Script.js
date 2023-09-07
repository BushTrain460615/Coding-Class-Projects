var mainBody = document.body;
var raw = mainBody.innerHTML;

// Remove the script from the input file
var lastScript = findFirstScript(raw);
raw = raw.substring(0, lastScript);
// Erase page text to start over
mainBody.innerHTML = "";
var title;
var headings = [];
var bodies = [];
const style = `.onePager {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    border-style: none;
    padding: 10px;
    background-color: #ccc;
}

html {
    background-color: #ccc;
}

img {
    width: auto;
    max-height: 200px;
}

.img-container {
    height: 200px;
    padding: 5px;
}

.img-container img {
    max-height: 100%;
    max-width: 100%;
}

.row {
    height: auto;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px;
}
.item_half {
    width: 46%;
    padding: 10px 1% 10px 1%;
    border-style: solid;
    border-width: 1.5;
    border-radius: 5px;
    background-color: white;
}

.item_full {
    width: 100%;
    border-style: solid;
    border-radius: 5px;
    border-width: 1.5;
    background-color: white;
    padding: 10px 1% 10px 1%;
}

.title {
    width: 100%;
    text-align: center;
    border-style: solid;
    border-radius: 5px;
    border-width: 1.5;
    background-color: white;
    padding: 10px 1% 10px 1%;
    font-family: Arial, Helvetica, sans-serif;
}
p, h3, li {
    margin: 5px;
    font-family: Arial, Helvetica, sans-serif;
}

h3 {
    padding: 0px 0px 10px 0px;
}`

setHead();
readPage();
writePage();

function findFirstScript(input) {
    var index = 0;
    while (input.indexOf("<script") >= 0) {
        index = input.indexOf("<script");
        input = input.substring(index + 1);
        break;
    }
    return index;
}

function setHead() {
    var head = document.head;
    var styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    head.appendChild(styleTag);
}

function readPage() {
    var headingFound = false;
    var bodyFound = false;
    while (raw.indexOf("::") > -1) {
        var index = raw.indexOf("::"); // initial index of marker
        var endColon = raw.indexOf("::", index + 2); // end index of marker
        var type = raw.substring(index + 2, endColon); // read which mark up
        // The body of the markup goes to the next marker or the end of the file
        var endBody = raw.indexOf("::", endColon + 2);
        if (endBody == -1) {
            endBody = raw.length;
        }
        // Now the text to mark up is defined
        var text = raw.substring(endColon + 2, endBody);

        if (type.toUpperCase().trim() == "TITLE") {
            title = text.trim();
            document.title = title;
        } else if (type.toUpperCase().trim() == "HEADING") {
            // Second heading found without a body
            if (bodyFound == false && headingFound == true) {
                bodies.push("");
            }
            headings.push(text.trim());
            headingFound = true;
            bodyFound = false;
        } else if (type.toUpperCase().trim() == "BODY") {
            // second body found without a heading
            if (bodyFound == true && headingFound == false) {
                headings.push("");
            }
            bodies.push(text.trim());
            bodyFound = true;
            headingFound = false;
        }
        // cut off the part we just read
        raw = raw.substring(endBody);
    }
}

function writePage() {
    // Create the overall class
    var main = document.createElement("div");
    main.className = "OnePager";
    mainBody.appendChild(main);

    // Find out how many boxes. Number of boxes
    // is the max of number of headings and bodies
    // This does not include the title
    var numBoxes = Math.max(headings.length, bodies.length);
    if (numBoxes == 4) {
        create4Box(main);
    } else {
        createGeneric(main, numBoxes);
    }
}

function createTitle() {
    var row = document.createElement("div");
    row.className = "row";
    var titleEl = document.createElement("div");
    titleEl.className = "title";
    var titleText = document.createElement("h1");
    titleText.innerHTML = title;
    titleEl.appendChild(titleText);
    row.appendChild(titleEl);
    return row;
}

function createGeneric(main, numBoxes) {
    // Add title at top
    main.appendChild(createTitle());
    // If num of boxes is odd, first box is full length and remainder
    // are half size
    if (numBoxes % 2 == 1) {
        var firstRow = document.createElement("div");
        firstRow.className = "row";
        firstRow.appendChild(createBox(0, "full"));
        main.appendChild(firstRow);

        for (var i = 1; i < numBoxes; i += 2) {
            main.appendChild(createRow(i));
        }
    } else {
        for (var i = 0; i < numBoxes; i += 2) {
            main.appendChild(createRow(i));
        }
    }
}

function createRow(index) {
    var row = document.createElement("div");
    row.className = "row";
    row.appendChild(createBox(index, "half"));
    row.appendChild(createBox(index + 1, "half"));
    return row;
}

function create4Box(main) {
    var titleEl = createTitle();
    for (var i = 0; i < 4; i += 2) {
        // Add title before the 3rd element
        if (i == 0) {
            main.appendChild(titleEl);
        }
        main.appendChild(createRow(i));
    }
}

function createBox(index, size) {
    var holder = document.createElement("div");
    if (size == "half") {
        holder.className = "item_half";
    } else {
        holder.className = "item_full";
    }

    holder.appendChild(createHeading(index)); // Add heading
    holder.appendChild(createBody(index)); //Adding body

    return holder;
}

function createHeading(index) {
    var headingEl;
    headingEl = document.createElement("h3");

    if (headings.length > index) {
        headingEl.innerHTML = headings[index];
    }
    return headingEl;
}

function createBody(index) {
    var bodyEl = document.createElement("div");
    if (bodies.length > index) {
        var bodyLines = bodies[index].split("\n");
        for (var j = 0; j < bodyLines.length; j++) {
            if (bodyLines[j].indexOf("[[") > -1) {
                bodyEl.appendChild(addImage(bodyLines[j]));
            } else if (bodyLines[j].indexOf("**") > -1) {
                bodyEl.appendChild(addBullet(bodyLines[j]));
            } else {
                bodyEl.appendChild(addLine(bodyLines[j]));
            }
        }
    }
    return bodyEl;
}

function addImage(line) {
    var start = line.indexOf("[[") + 2;
    var end = line.indexOf("]]");
    var src = line.substring(start, end);
    var imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    var imgEl = document.createElement("img");
    imgEl.setAttribute("src", src);
    imgContainer.appendChild(imgEl);
    return imgContainer;
}

function addBullet(line) {
    var start = line.indexOf("**") + 2;
    var bulletEl = document.createElement("li");
    bulletEl.innerHTML = line.substring(start);
    return bulletEl;
}

function addLine(line) {
    var lineEl = document.createElement("p");
    lineEl.innerHTML = line;
    return lineEl;
}
