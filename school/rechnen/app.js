const form = document.getElementById('card-form');
const answers = document.getElementsByName('answers');
const answer1 = document.getElementById('answer1');
const answer1Text = document.getElementById('answer1Text');
const answer2 = document.getElementById('answer2');
const answer2Text = document.getElementById('answer2Text');
const answer3 = document.getElementById('answer3');
const answer3Text = document.getElementById('answer3Text');
const task = document.getElementById('task');
let correctIdx = -1;
let maxVal = 20;
let operation = 'plus';
let allOps = ['plus', 'minus', 'mal', 'geteilt'];

// Set defaults;
setGetDefaults();

// Load event listeners
loadEventListeners();

// Generate a calculation exercise
fillAnswers();

function setGetDefaults() {
    let mv = 20;
    const getString = window.location.search;
    if (getString[0] === '?') {
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === 'max') {
                mv = Number(pair[1]);
            } else if (pair[0] === 'op') {
                if (allOps.includes(pair[1])) {
                    operation = pair[1];
                }
            }
        }
        if (mv < 3) mv = 3;
    }
    return mv;
}

function loadEventListeners() {
    form.addEventListener('submit', submitAnswer);
}

function getRInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillAnswers() {
    let x = maxVal;
    let y = maxVal;
    do {
        x = getRInt(0, maxVal);
        if (operation === "plus") {
            y = getRInt(0, maxVal - x);
            correctVal = x + y;
        } else if (operation === "minus") {
            y = getRInt(0, x);
            correctVal = x - y;
        } else if (operation === "mal") {
            if (x !== 0) {
                y = getRInt(0, maxVal / x);
            } else {
                y = getRInt(0, maxVal);
            }
            correctVal = x * y;
        } else if (operation === "geteilt") {
            do {
                y = getRInt(1, x);
            } while (x % y !== 0);
            correctVal = x / y;
        }
    } while (correctVal > maxVal);
    if (operation === "plus") {
        task.textContent = x.toString() + " + " + y.toString();
    } else if (operation === "minus") {
        task.textContent = x.toString() + " - " + y.toString();
    } else if (operation === "mal") {
        task.textContent = x.toString() + " * " + y.toString();
    } else if (operation === "geteilt") {
        task.textContent = x.toString() + " / " + y.toString();
    }
    correctIdx = getRInt(0, 2);
    let pastValues = [correctVal, correctVal, correctVal]
    for (let i = 0; i < 3; i++) {
        let res;
        if (i !== correctIdx) {
            do {
                res = getRInt(0, maxVal);
            } while (pastValues.includes(res));
            pastValues[i] = res;
        } else {
            res = correctVal;
        }
        if (i === 0) {
            answer1.checked = false;
            answer1.value = res.toString();
            answer1Text.textContent = res.toString();
        } else if (i === 1) {
            answer2.checked = false;
            answer2.value = res.toString();
            answer2Text.textContent = res.toString();
        } else {
            answer3.checked = false;
            answer3.value = res.toString();
            answer3Text.textContent = res.toString();
        }
    }
}

function submitAnswer(e) {
    let answer;
    let idx;
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].checked) {
            idx = i;
            answer = answers[i].value;
        }
    }
    if (idx === correctIdx) {
        showCorrect();
        setTimeout(fillAnswers, 1000);
    } else {
        showIncorrect();
    }
    e.preventDefault();
}

function showIncorrect() {
    const errorDiv = document.createElement('div');
    const card = document.querySelector('.card');
    const heading = document.querySelector('.heading');

    errorDiv.className = 'alert alert-danger';
    errorDiv.appendChild(document.createTextNode("Leider falsch!"));
    card.insertBefore(errorDiv, heading);
    setTimeout(clearMsg, 1000);
}

function showCorrect() {
    const superDiv = document.createElement('div');
    const card = document.querySelector('.card');
    const heading = document.querySelector('.heading');

    superDiv.className = 'alert alert-success';
    superDiv.appendChild(document.createTextNode("Super!"));
    card.insertBefore(superDiv, heading);
    setTimeout(clearMsg, 1000);
}

function clearMsg() {
    document.querySelector('.alert').remove();
}
