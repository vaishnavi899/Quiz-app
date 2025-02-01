import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

const API_URL = "https://api.allorigins.win/raw?url=https://api.jsonserve.com/Uw5CrX";

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [streak, setStreak] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false); 
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [unanswered, setUnanswered] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.questions)) {
          setQuestions(response.data.questions);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load quiz data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (quizStarted && !showSummary && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleAnswer(false);
    }
  }, [timeRemaining, showSummary, quizStarted]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setStreak(0);
      setIncorrectAnswers(incorrectAnswers + 1); 
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setTimeRemaining(10);
    } else {
      setUnanswered(questions.length - correctAnswers - incorrectAnswers);
      setShowSummary(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowSummary(false);
    setStreak(0);
    setTimeRemaining(10);
    setQuizStarted(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setUnanswered(0);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(10); 
  };

  // Data for the pie chart
  const pieChartData = [
    { name: "Correct", value: correctAnswers },
    { name: "Incorrect", value: incorrectAnswers },
    { name: "Unanswered", value: unanswered },
  ];

  const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];

  if (loading) return <div className="loading">Loading Quiz...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-container">
      {!quizStarted ? (
        <div className="start-screen">
          <h1>Welcome to the Quiz!</h1>
          <p>Test your knowledge and see how many questions you can answer correctly.</p>
          <button onClick={startQuiz}>Start Quiz</button>
        </div>
      ) : showSummary ? (
        <div className="summary">
          <h2>Quiz Completed!</h2>
          <p>Your Score: {score} / {questions.length}</p>
          <p>Longest Streak: {streak}</p>

          {/* Pie Chart*/}
          <div className="chart-container">
            <h3>Results Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button onClick={restartQuiz}>Restart Quiz</button>
        </div>
      ) : (
        <div className="question-card">
          <div className="header">
            <h3>Question {currentQuestion + 1}/{questions.length}</h3>
            <div className="timer">Time Left: {timeRemaining}s</div>
            <div className="streak">Streak: {streak} 🔥</div>
          </div>
          <p>{questions[currentQuestion].description}</p>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.is_correct)}
              >
                {option.description}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;