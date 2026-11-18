<!DOCTYPE html>
<html>
<head>
    <title>ORBIT - Quiz Result</title>
    <link rel="stylesheet" type="text/css" href="orbit.css">
</head>
<body>
    <div class="header">
        <a class="logo" href="orbit.html">ORBIT<span>.</span></a>
        <div class="nav"><a href="orbit.html">Back to Home</a></div>
    </div>
    <div class="section">
        <p class="tag">YOUR SPACE QUIZ RESULT</p>
        <h2>Mission completed<span>.</span></h2>
        <div class="quiz-box">
            <?php
            if ($_SERVER["REQUEST_METHOD"] == "POST") {
                $score = $_POST["score"];
                $total = $_POST["total"];

                echo "<h3>Your score: " . $score . " out of " . $total . "</h3>";

                if ($score == $total) {
                    echo "<p>Perfect score! You are a space expert.</p>";
                } else {
                    echo "<p>Well done! Keep exploring and learning about space.</p>";
                }
            } else {
                echo "<p>No quiz result was submitted.</p>";
            }
            ?>
            <a class="main-button" href="orbit.html">RETURN TO ORBIT</a>
        </div>
    </div>
</body>
</html>
