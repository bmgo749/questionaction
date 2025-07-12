import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, AlertTriangle, CheckCircle2, Home, Trophy } from 'lucide-react';
import { getRandomQuestions, getRandomSuddenQuestions, type IQQuestion } from '@/data/iqQuestions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface IQTestResult {
  iqScore: number;
  message: string;
  details: {
    correctAnswers: number;
    totalQuestions: number;
    timeMinutes: number;
    suddenTestCorrect: boolean;
  };
}

export default function IQTest() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Test state
  const [testState, setTestState] = useState<'instruction' | 'test' | 'sudden' | 'loading' | 'result'>('instruction');
  const [questions, setQuestions] = useState<IQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Sudden test state
  const [suddenTestQuestion, setSuddenTestQuestion] = useState<IQQuestion | null>(null);
  const [suddenTestAnswer, setSuddenTestAnswer] = useState<number | null>(null);
  const [suddenTestTriggered, setSuddenTestTriggered] = useState(false);
  
  // Results state
  const [testResult, setTestResult] = useState<IQTestResult | null>(null);
  const [loadingQuote, setLoadingQuote] = useState('');

  const loadingQuotes = [
    "Intelligence is the ability to adapt to change...",
    "The only true wisdom is in knowing you know nothing...",
    "Logic will get you from A to Z; imagination will get you everywhere...",
    "The mind is not a vessel to be filled, but a fire to be kindled...",
    "Knowledge is power, but understanding is wisdom..."
  ];

  // Timer effect
  useEffect(() => {
    if (testState === 'test' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && testState === 'test') {
      handleSubmitTest();
    }
  }, [testState, timeLeft]);

  // Loading quote effect
  useEffect(() => {
    if (testState === 'loading') {
      setLoadingQuote(loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]);
    }
  }, [testState]);

  const submitTestMutation = useMutation({
    mutationFn: async (testData: {
      correctAnswers: number;
      totalQuestions: number;
      timeMinutes: number;
      suddenTestCorrect: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/iq/submit', testData);
      return response.json();
    },
    onSuccess: (data: IQTestResult) => {
      setTestResult(data);
      setTestState('result');
      queryClient.invalidateQueries({ queryKey: ['/api/iq/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      console.error('Error submitting test:', error);
    }
  });

  const startTest = () => {
    const testQuestions = getRandomQuestions(10);
    setQuestions(testQuestions);
    setSelectedAnswers(new Array(10).fill(-1));
    setCurrentQuestion(0);
    setTimeLeft(20 * 60);
    setStartTime(new Date());
    setTestState('test');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      
      // 30% chance of sudden test (only once)
      if (!suddenTestTriggered && Math.random() < 0.3 && currentQuestion >= 3) {
        setSuddenTestTriggered(true);
        const suddenQuestion = getRandomSuddenQuestions(1)[0];
        setSuddenTestQuestion(suddenQuestion);
        setSuddenTestAnswer(null);
        setTestState('sudden');
      }
    } else {
      handleSubmitTest();
    }
  };

  const handleSuddenTestAnswer = (answerIndex: number) => {
    setSuddenTestAnswer(answerIndex);
    setTimeout(() => {
      setTestState('test');
      setSuddenTestQuestion(null);
    }, 1000);
  };

  const handleSubmitTest = () => {
    if (!startTime) return;
    
    setTestState('loading');
    
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    
    const timeElapsed = (new Date().getTime() - startTime.getTime()) / (1000 * 60);
    const suddenTestCorrect = suddenTestQuestion && suddenTestAnswer === suddenTestQuestion.correctAnswer;
    
    // Show loading for 10 seconds
    setTimeout(() => {
      submitTestMutation.mutate({
        correctAnswers,
        totalQuestions: questions.length,
        timeMinutes: timeElapsed,
        suddenTestCorrect: suddenTestCorrect || false
      });
    }, 10000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 140) return 'text-purple-600';
    if (score >= 130) return 'text-blue-600';
    if (score >= 120) return 'text-green-600';
    if (score >= 110) return 'text-yellow-600';
    if (score >= 90) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 140) return 'Genius';
    if (score >= 130) return 'Highly Gifted';
    if (score >= 120) return 'Superior';
    if (score >= 110) return 'Above Average';
    if (score >= 90) return 'Average';
    return 'Below Average';
  };

  if (testState === 'instruction') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-16 w-16 text-purple-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Intelligence Quotient Test
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive cognitive assessment with 10 carefully selected questions
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Test Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Test Structure</h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• 10 questions total</li>
                    <li>• Multiple choice format</li>
                    <li>• 40% Numerical Reasoning</li>
                    <li>• 40% Literacy & Language</li>
                    <li>• 20% Science & Logic</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Time & Scoring</h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• 20 minutes time limit</li>
                    <li>• Time bonus for faster completion</li>
                    <li>• Possible sudden test (30% chance)</li>
                    <li>• Final score: 75-160 range</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">
                  Important Notes
                </h3>
                <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                  <li>• You can only take this test once</li>
                  <li>• Your score will be displayed on your profile</li>
                  <li>• No calculators or external help allowed</li>
                  <li>• Answer all questions to the best of your ability</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={startTest}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Start Intelligence Test
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (testState === 'test') {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Intelligence Test
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Badge variant="secondary">
                  {currentQuestion + 1} / {questions.length}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestion + 1}
                <Badge variant="outline" className="ml-2">
                  {currentQ?.category}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-800 dark:text-gray-200">
                {currentQ?.question}
              </p>
              
              <div className="space-y-2">
                {currentQ?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      selectedAnswers[currentQuestion] === index
                        ? 'bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-200'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === -1}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (testState === 'sudden') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-rose-300 bg-rose-50 dark:bg-rose-900/20">
            <CardHeader>
              <CardTitle className="text-rose-800 dark:text-rose-200 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Sudden Test - Answer Quickly!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-rose-800 dark:text-rose-200">
                {suddenTestQuestion?.question}
              </p>
              
              <div className="space-y-2">
                {suddenTestQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuddenTestAnswer(index)}
                    className="w-full p-3 text-left rounded-lg border border-rose-300 bg-white dark:bg-gray-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all"
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <Badge variant="destructive">
                  Sudden Test - 5 seconds to answer
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (testState === 'loading') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="animate-bounce mb-8">
              <Brain className="h-24 w-24 text-purple-600 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Calculating Your Intelligence Score...
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {loadingQuote}
            </p>
            <div className="w-64 mx-auto">
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (testState === 'result' && testResult) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Test Complete!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your Intelligence Quotient has been calculated
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-6xl font-bold text-purple-600">
                      {testResult.iqScore}
                    </span>
                    <span className="text-2xl text-gray-500 ml-2">IQ</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-lg px-4 py-2 ${getScoreColor(testResult.iqScore)}`}
                  >
                    {getScoreLabel(testResult.iqScore)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Test Results Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Correct Answers:</span>
                        <span>{testResult.details.correctAnswers} / {testResult.details.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span>{Math.round((testResult.details.correctAnswers / testResult.details.totalQuestions) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Taken:</span>
                        <span>{Math.round(testResult.details.timeMinutes)} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sudden Test:</span>
                        <span className={testResult.details.suddenTestCorrect ? 'text-green-600' : 'text-red-600'}>
                          {testResult.details.suddenTestCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Score Range</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average (90-110):</span>
                        <span className="text-gray-500">Standard range</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Above Average (110-120):</span>
                        <span className="text-yellow-600">Good performance</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Superior (120-130):</span>
                        <span className="text-green-600">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Highly Gifted (130+):</span>
                        <span className="text-purple-600">Exceptional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={() => navigate('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}