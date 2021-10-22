$(document).ready(function (){
    var appStates = {
        Initial : "state.initial",
        Questions : "state.questions",
        SubmitScore : "state.submitscore",
        Leaderboard : "state.leaderboard"
    };

    var contElement = $("#content");
    var timrElement = $("#timer");
    var hgscElement = $("#highscores");
    var currState;
    var prevState;
    var score = 0;
    var secondsElapsed = 0;
    var interval;

    var currQuestion = 0;
    var lastSelectedAnswer = "";

    const quizTime = 60;
    const questions = [
        question_1 = {
            textContent: "In the styling rgba (128, 128, 128, 0.9), the value '0.9' refers to what?",
            options : [
               "Amount of red pigment",
               "Amount of green pigment",
               "Amount of blue pigment",
               "Opacity"
            ],
            answer : "Opacity"
        },

        question_2 = {
            textContent: "Which of the following symbols is used in Javascript to indicate 'either or'?",
            options : [
               "&&",
               "++",
               "||",
               ">="
            ],
            answer : "||"
        },

        question_3 = {
            textContent: "To round down to the nearest whole number, the folllowing funtion should be used:",
            options : [
               "Math.random()",
               "Math.ceiling()",
               "Math.floor()",
               "Math.estimate()"
            ],
            answer : "Math.floor()"
        },

        question_4 = {
            textContent: "In order to dictate what colors and fonts to use on a website you would adjust which code?",
            options : [
               "HTML",
               "Javascript",
               "CSS",
               "Python"
            ],
            answer : "CSS"
        },

        question_5 = {
            textContent: "What is the element called that can continue to execute a block of code as long as the specified condition remains true?",
            options : [
               "Debugger",
               "Console.log",
               "Loop",
               "Return"
            ],
            answer : "Loop"
        }
    ];

    startQuiz();

    function startQuiz(){
        $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
        $(hgscElement).html("View High Scores");
        reset();
        createInitialPage();

        $(hgscElement).on("click", function(){
            clearInterval(interval);
            createLeaderboard();
        });
    }

    function reset() {
        secondsElapsed = 0;
        currQuestion = 0;
    }

    function startTimer() {
        clearInterval(interval);

        interval = setInterval(function() {
            secondsElapsed++;
            $(timrElement).html(`Timer: ${getFormattedSeconds()}`);

            if (secondsElapsed >= quizTime) {
                clearInterval(interval);
                if (secondsElapsed > quizTime) 
                    secondsElapsed = quizTime;
                createSubmitPage();
            }
        }, 1000);
    }

    function getFormattedSeconds() {
        return (quizTime - secondsElapsed);
    }

    function createInitialPage() {
        currState = appStates.Initial;
        console.log("App State Transitioning To:", currState);

        $(contElement).empty();
        
        var header = $("<header><h1>Coding Quiz</h1></header>");
        var paragraph = $("<p>Please answer the following questions within the time limit. Your score is calculated based on remaining time and correct answers. Incorrect answers will deduct 10 seconds from your time/score.</p>")
        var button = $("<button id=\"start-quiz-btn\" type=\"button\" class=\"btn btn-blue\">Start Quiz</button>")

        $(contElement).append(header, paragraph, button);

        $("#start-quiz-btn").on("click", function() {
            createNewQuestion();
        });
    }

    function createNewQuestion() {
        if(currQuestion >= questions.length) {
            createSubmitPage();
            return;
        }

        prevState = currState;
        currState = appStates.Questioning;
        console.log("App State Transitioning To:", currState);

        $(contElement).empty();

        var questionObj = questions[currQuestion];
        var header = $(`<h1>${questionObj.textContent}</h1>`);
        var unList = $("<ul>");

        $(questionObj.options).each(function(index, value){
            var btn = $(`<li><button type="button" class="ques-option btn btn-blue" data-ques-option="${value}">${index + 1}. ${value}</button></li>`);
            $(unList).append(btn);
        });

        $(contElement).append(header, unList);

        if(prevState != appStates.Questioning)
            startTimer();

        $(".ques-option").on("click", function(event){
            event.preventDefault();
            lastSelectedAnswer = $(this).attr("data-ques-option");
            var isCorrect = lastSelectedAnswer === questionObj.answer;

            if (isCorrect)
                score += 30;
            else if (!isCorrect) {
                secondsElapsed += 10;
            }

            currQuestion++;
            createNewQuestion();

            if (isCorrect)
                displayMessage("Correct");
            else 
                displayMessage("Incorrect");
        });

        function displayMessage(message) {
            var newMessage = $(`<div class="fade"><hr><h3>${message}</h3></div>`);
            $("#content").append(newMessage);
        }
    }

    function createSubmitPage() {
        clearInterval(interval);
        $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
        currState = appStates.SubmittingScore;
        console.log("App State Transitioning To:", currState);

        var totalScore = score + (Math.floor(getFormattedSeconds() * .15));

        $(contElement).empty();

        var header = $("<h1>Quiz completed.</h1>");
        var paragraph = $(`<p style="text-align: left">Your final score is ${totalScore}.</p>`);
        var submitField = $("<div class=\"submit-field\">Please enter initials: <input id=\"initials\" type=\"text\"> <button id=\"initials-submit\" type=\"button\" class=\"btn btn-blue\">Submit</button></div>");

        $(contElement).append(header, paragraph, submitField);

        $("#initials-submit").on("click", function(event){
            event.preventDefault();
            currState = appStates.Initial;

            var inputInitials = $("#initials").val();

            if(!inputInitials){
                alert("Please provide your initials");
                return;
            }

            var highscores = localStorage.getItem("highscores");

            if(!highscores)
                highscores = {};
            else
                highscores = JSON.parse(highscores);

            highscores[inputInitials] = totalScore;

            localStorage.setItem("highscores", JSON.stringify(highscores));

            createLeaderboard();
            reset();
        });
    }

    function createLeaderboard() {
        if(currState != appStates.Leaderboard)
            prevState = currState;
        currState = appStates.Leaderboard;
        console.log("App State Transitioning To:", currState);

        $(hgscElement).empty();
        $(timrElement).empty();
        $(contElement).empty();

        var header = $("<h1 style=\"margin-top:0;\">Current High Scores</h1>");

        var highscores = localStorage.getItem("highscores");

        $(contElement).append(header);

        if(highscores)
        {
            var parsedHighscores = JSON.parse(highscores);

            var sortedHighscores = sortHighscores();

            var orderScores = $("<ol id=\"highscore-list\"></ol>");

            var counter = 1;
            $.each(sortedHighscores, function(key, value)
            {
                var liElement = $(`<li class="highscore">${counter}. ${key} - ${value}</li>`)

                $(orderScores).append(liElement);
                counter++;
            });

            $(contElement).append(orderScores);

            function sortHighscores() {
                items = Object.keys(parsedHighscores).map(function(key) {
                    return [key, parsedHighscores[key]];
                });
                items.sort(function(first, second) {
                    return second[1] - first[1];
                });
                sorted_obj={}
                $.each(items, function(k, v) {
                    use_key = v[0]
                    use_value = v[1]
                    sorted_obj[use_key] = use_value
                });
                return(sorted_obj);
            } 
        }

        var buttons = $("<div style=\"text-align:left\"><button id=\"hs-back\" type=\"button\" class=\"btn btn-blue\">Go Back</button> <button id=\"hs-clear\" type=\"button\" class=\"btn btn-blue\">Clear High Scores</button></div>");

        $(contElement).append(buttons);

        $("#hs-clear").on("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("highscores");
            $("#highscore-list").empty();
        });

        $("#hs-back").on("click", function(event){
            event.preventDefault();

            switch(prevState)
            {
                case appStates.Initial:
                    createInitialPage();
                    break;
                case appStates.Questioning:
                    createNewQuestion();
                    break; 
                case appStates.SubmittingScore:
                    createSubmitPage();
                    break;
                default:
                    console.log(`state ${prevState} not supported`);
                    break;
            }

            $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
            $(hgscElement).html("View High Scores");
        });
    }
});