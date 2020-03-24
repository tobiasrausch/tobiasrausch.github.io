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
// Mode false: numeric, true: reading
let tm = false;
let operation = 'plus';
let allOps = ['plus', 'minus', 'mal', 'geteilt'];
let textdb = [['Jojo liebt ...', 'kochen', 'Gemüse', 'tauchen', 'Knochen'],
['Ninos Opa schläft im ...', 'Sand', 'Wasser', 'Schrank', 'Bett'],
['Welches Wort passt nicht? Nino und Nina arbeiten spielen zusammen.', 'Nina', 'zusammen', 'Nino', 'arbeiten'],
['Welches Wort passt nicht? Nino klettert auf den Kuchen Baum.', 'Nino', 'auf', 'klettert', 'Kuchen'],
['Welches Wort passt nicht? Nino ist mal wieder Fenster traurig.', 'traurig', 'mal', 'wieder', 'Fenster'],
['Welches Wort passt nicht? Jojo spricht bellt laut.', 'Jojo', 'bellt', 'laut', 'spricht']
]


// Set defaults;
setGetDefaults();

// Load event listeners
loadEventListeners();

// Generate next exercise
fillAnswers();

function setGetDefaults() {
    const getString = window.location.search;
    if (getString[0] === '?') {
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === 'max') {
                let mv = Number(pair[1]);
                if (mv < 3) mv = 3;
                maxVal = mv;
            } else if (pair[0] === 'op') {
                if (allOps.includes(pair[1])) {
                    operation = pair[1];
                }
            } else if (pair[0] === 'tm') {
                if (pair[1] === 'true') tm = true;
                else tm = false;
            }
        }
    }
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
    if (tm) fillAnswersText();
    else fillAnswersNumeric();
}

function fillAnswersText() {
    let idx = getRInt(0, textdb.length - 1);
    task.textContent = textdb[idx][0];
    correctIdx = getRInt(0, 2);
    for (let i = 0; i < 3; i++) {
        let res = textdb[idx][i + 1];
        if (i === correctIdx) {
            res = textdb[idx][4];
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

function fillAnswersNumeric() {
    let x = maxVal;
    let y = maxVal;
    do {
        if (operation === "plus") {
            x = getRInt(0, maxVal);
            y = getRInt(0, maxVal - x);
            correctVal = x + y;
        } else if (operation === "minus") {
            x = getRInt(0, maxVal);
            y = getRInt(0, x);
            correctVal = x - y;
        } else if (operation === "mal") {
            let upperBound = maxVal / 2;
            if (upperBound < 3) upperBound = 3;
            x = getRInt(2, upperBound);
            let penalty;
            do {
                if (x !== 0) {
                    y = getRInt(0, maxVal / x);
                } else {
                    y = getRInt(0, maxVal);
                }
                penalty = 5;
                if ((y === 1) || (y === 0)) penalty = getRInt(0, 10);
            } while (penalty != 5);
            correctVal = x * y;
        } else if (operation === "geteilt") {
            x = getRInt(0, maxVal);
            let penalty;
            do {
                y = getRInt(1, x);
                penalty = 5;
                if ((x === y) || (y === 1)) penalty = getRInt(0, 10);
            } while ((x % y !== 0) || (penalty !== 5));
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
