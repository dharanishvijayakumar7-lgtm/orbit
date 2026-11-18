var planetNames = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
var planetTypes = ["Rocky", "Rocky", "Rocky", "Rocky", "Gas giant", "Gas giant", "Ice giant", "Ice giant"];
var planetDays = ["58.6 Earth days", "243 Earth days", "24 hours", "24.6 hours", "9.9 hours", "10.7 hours", "17.2 hours", "16.1 hours"];
var planetYears = ["88 Earth days", "225 Earth days", "365.25 days", "687 Earth days", "11.9 Earth years", "29.4 Earth years", "84 Earth years", "165 Earth years"];
var planetDescriptions = [
    "Mercury is the smallest planet and the closest planet to the Sun. Its surface is covered with craters.",
    "Venus is a rocky planet with a thick atmosphere. It is the hottest planet in our solar system.",
    "Earth is our home planet. It has liquid water on its surface and is known to support life.",
    "Mars is a cold desert world. Its reddish surface gives it the name the Red Planet.",
    "Jupiter is the largest planet. It has powerful storms and many moons.",
    "Saturn is famous for its beautiful rings, which are made mostly of ice and rock.",
    "Uranus is an ice giant that rotates on its side. It has a blue-green colour.",
    "Neptune is the most distant recognized planet from the Sun. It has very strong winds."
];

function showPlanet(name) {
    var i;
    for (i = 0; i < planetNames.length; i++) {
        if (planetNames[i] == name) {
            document.getElementById("planetName").innerHTML = name;
            document.getElementById("planetDescription").innerHTML = planetDescriptions[i];
            document.getElementById("planetType").innerHTML = planetTypes[i];
            document.getElementById("planetDay").innerHTML = planetDays[i];
            document.getElementById("planetYear").innerHTML = planetYears[i];
        }
    }
}

function filterPlanets(type) {
    var cards = document.getElementsByClassName("planet-card");
    var i;
    for (i = 0; i < cards.length; i++) {
        if (type == "all" || cards[i].className.indexOf(type) != -1) {
            cards[i].style.display = "block";
        } else {
            cards[i].style.display = "none";
        }
    }
}

function showAll() {
    filterPlanets("all");
}
function showRocky() {
    filterPlanets("rocky");
}
function showGiants() {
    filterPlanets("giant");
}

window.onload = function() {
    document.getElementById("search").onkeyup = function() {
        var value = document.getElementById("search").value.toLowerCase();
        var cards = document.getElementsByClassName("planet-card");
        var i;
        for (i = 0; i < cards.length; i++) {
            var name = cards[i].getElementsByTagName("h3")[0].innerHTML.toLowerCase();
            if (name.indexOf(value) != -1) {
                cards[i].style.display = "block";
            } else {
                cards[i].style.display = "none";
            }
        }
    };
};

var questions = [
    ["Which planet is known as the Red Planet?", ["Venus", "Mars", "Mercury", "Jupiter"], 1],
    ["Which planet has the most prominent ring system?", ["Earth", "Neptune", "Saturn", "Uranus"], 2],
    ["Which galaxy contains our solar system?", ["Andromeda", "Whirlpool", "Sombrero", "Milky Way"], 3]
];
var currentQuestion = 0;
var score = 0;
var answered = false;

function displayQuestion() {
    var q = questions[currentQuestion];
    document.getElementById("questionNumber").innerHTML = "QUESTION " + (currentQuestion + 1) + " OF " + questions.length;
    document.getElementById("question").innerHTML = q[0];
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("answers").innerHTML = "";
    var i;
    for (i = 0; i < q[1].length; i++) {
        var answerButton = document.createElement("button");
        answerButton.innerHTML = q[1][i];
        answerButton.setAttribute("type", "button");
        answerButton.setAttribute("onclick", "checkAnswer(" + i + ")");
        document.getElementById("answers").appendChild(answerButton);
    }
    answered = false;
}

function checkAnswer(choice) {
    if (answered == true) {
        return;
    }
    answered = true;
    if (choice == questions[currentQuestion][2]) {
        score = score + 1;
        document.getElementById("feedback").innerHTML = "Correct! Great work, space explorer.";
    } else {
        document.getElementById("feedback").innerHTML = "Not quite. Keep learning about the universe!";
    }
    document.getElementById("scoreInput").value = score;
    document.getElementById("totalInput").value = questions.length;
}

function nextQuestion() {
    if (answered == false) {
        document.getElementById("feedback").innerHTML = "Please select an answer first.";
        return;
    }
    if (currentQuestion < questions.length - 1) {
        currentQuestion = currentQuestion + 1;
        displayQuestion();
    } else {
        document.getElementById("question").innerHTML = "Quiz completed! Your score is " + score + " out of " + questions.length + ".";
        document.getElementById("answers").innerHTML = "";
        document.getElementById("feedback").innerHTML = "You can now save your score using the button below.";
        document.getElementById("nextButton").style.display = "none";
        document.getElementById("scoreInput").value = score;
        document.getElementById("totalInput").value = questions.length;
        document.getElementById("scoreForm").style.display = "block";
    }
}

window.onload = function() {
    displayQuestion();
    document.getElementById("search").onkeyup = function() {
        var value = document.getElementById("search").value.toLowerCase();
        var cards = document.getElementsByClassName("planet-card");
        var i;
        for (i = 0; i < cards.length; i++) {
            var name = cards[i].getElementsByTagName("h3")[0].innerHTML.toLowerCase();
            if (name.indexOf(value) != -1) {
                cards[i].style.display = "block";
            } else {
                cards[i].style.display = "none";
            }
        }
    };
};
