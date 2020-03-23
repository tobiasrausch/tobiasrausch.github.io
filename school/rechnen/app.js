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

// Parse maxVal if present
const getString = window.location.search;
if (getString[0] === '?') {
    let query = window.location.search.substring(1); 
    let vars = query.split("&"); 
    for (let i=0;i<vars.length;i++)
    { 
      let pair = vars[i].split("="); 
      if (pair[0] === 'max')
      { 
        maxVal = Number(pair[1]); 
      } 
    }
    if (maxVal < 3) maxVal = 3;
    console.log(maxVal);
}

// Load event listeners
loadEventListeners();

// Generate a calculation exercise
fillAnswers();

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
        x = getRInt(1,maxVal);
        y = getRInt(1, maxVal - x);
    } while (x + y > maxVal);
    task.textContent = x.toString() + " + " + y.toString();
    let correctVal = x + y;
    correctIdx = getRInt(0, 2);
    let pastValues = [correctVal, correctVal, correctVal] 
    for (let i = 0; i < 3; i++) {
        let res;
        if (i !== correctIdx) {
            do {
                res = getRInt(1, maxVal);
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
