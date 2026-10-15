package com.interviewreadiness.interview_readiness.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.interviewreadiness.interview_readiness.entity.Question;
import com.interviewreadiness.interview_readiness.entity.QuestionOption;
import com.interviewreadiness.interview_readiness.entity.TestAnswer;
import com.interviewreadiness.interview_readiness.entity.TestAttempt;
import com.interviewreadiness.interview_readiness.repository.QuestionOptionRepository;
import com.interviewreadiness.interview_readiness.repository.TestAnswerRepository;
import com.interviewreadiness.interview_readiness.repository.TestAttemptRepository;

@RestController
@RequestMapping("/api/attempts")
public class TestAttemptController {

    private final TestAttemptRepository testAttemptRepository;
    private final TestAnswerRepository testAnswerRepository;
    private final QuestionOptionRepository questionOptionRepository;

    public TestAttemptController(
            TestAttemptRepository testAttemptRepository,
            TestAnswerRepository testAnswerRepository,
            QuestionOptionRepository questionOptionRepository) {

        this.testAttemptRepository = testAttemptRepository;
        this.testAnswerRepository = testAnswerRepository;
        this.questionOptionRepository = questionOptionRepository;
    }

    // =============================================================
    // GET ATTEMPTS BY STUDENT
    // =============================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getAttemptsByStudent(
            @PathVariable Long studentId) {

        try {

            List<TestAttempt> attempts =
                    testAttemptRepository.findByStudentId(studentId);

            return ResponseEntity.ok(attempts);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching student attempts");
        }
    }

    // =============================================================
    // GET SINGLE ATTEMPT
    // =============================================================

    @GetMapping("/{attemptId}")
    public ResponseEntity<?> getAttempt(
            @PathVariable Long attemptId) {

        TestAttempt attempt =
                testAttemptRepository
                        .findById(attemptId)
                        .orElse(null);

        if (attempt == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found");
        }

        return ResponseEntity.ok(attempt);
    }

    // =============================================================
    // GET DETAILED RESULT
    // =============================================================

    @GetMapping("/{attemptId}/result")
    public ResponseEntity<?> getDetailedResult(
            @PathVariable Long attemptId) {

        try {

            // -----------------------------------------------------
            // FIND ATTEMPT
            // -----------------------------------------------------

            TestAttempt attempt =
                    testAttemptRepository
                            .findById(attemptId)
                            .orElse(null);

            if (attempt == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Attempt not found");
            }

            // -----------------------------------------------------
            // FIND ANSWERS
            // -----------------------------------------------------

            List<TestAnswer> answers =
                    testAnswerRepository.findByAttempt(attempt);

            // -----------------------------------------------------
            // CREATE RESULT RESPONSE
            // -----------------------------------------------------

            DetailedResultResponse response =
                    new DetailedResultResponse();

            response.setAttemptId(attempt.getId());

            response.setScore(
                    attempt.getScore() == null
                            ? 0
                            : attempt.getScore()
            );

            response.setTotalMarks(
                    attempt.getTotalMarks() == null
                            ? 0
                            : attempt.getTotalMarks()
            );

            response.setStatus(
                    attempt.getStatus()
            );

            // -----------------------------------------------------
            // STUDENT INFORMATION
            // -----------------------------------------------------

            if (attempt.getStudent() != null) {

                response.setStudentId(
                        attempt.getStudent().getId()
                );

                response.setStudentName(
                        attempt.getStudent().getName()
                );

                response.setStudentEmail(
                        attempt.getStudent().getEmail()
                );
            }

            // -----------------------------------------------------
            // TEST INFORMATION
            // -----------------------------------------------------

            if (attempt.getTest() != null) {

                response.setTestId(
                        attempt.getTest().getId()
                );

                response.setTestName(
                        attempt.getTest().getName()
                );
            }

            // -----------------------------------------------------
            // PERCENTAGE
            // -----------------------------------------------------

            double percentage = 0;

            if (response.getTotalMarks() > 0) {

                percentage =
                        ((double) response.getScore()
                                / response.getTotalMarks()) * 100;
            }

            response.setPercentage(percentage);

            // -----------------------------------------------------
            // ANSWER DETAILS
            // -----------------------------------------------------

            List<AnswerDetailResponse> answerDetails =
                    new ArrayList<>();

            if (answers != null) {

                for (TestAnswer testAnswer : answers) {

                    if (testAnswer == null ||
                            testAnswer.getQuestion() == null) {

                        continue;
                    }

                    Question question =
                            testAnswer.getQuestion();

                    AnswerDetailResponse detail =
                            new AnswerDetailResponse();

                    detail.setAnswerId(
                            testAnswer.getId()
                    );

                    detail.setQuestionId(
                            question.getId()
                    );

                    detail.setQuestion(
                            question.getQuestion()
                    );

                    detail.setDifficulty(
                            question.getDifficulty()
                    );

                    detail.setMarks(
                            testAnswer.getMarks() == null
                                    ? 0
                                    : testAnswer.getMarks()
                    );

                    detail.setMaxMarks(
                            question.getMarks() == null
                                    ? 0
                                    : question.getMarks()
                    );

                    // -------------------------------------------------
                    // MCQ OPTIONS
                    // -------------------------------------------------

                    List<QuestionOption> options =
                            questionOptionRepository
                                    .findByQuestionId(
                                            question.getId()
                                    );

                    List<OptionResponse> optionResponses =
                            new ArrayList<>();

                    if (options != null) {

                        for (QuestionOption option : options) {

                            OptionResponse optionResponse =
                                    new OptionResponse();

                            optionResponse.setId(
                                    option.getId()
                            );

                            optionResponse.setOptionText(
                                    option.getOptionText()
                            );

                            optionResponse.setCorrect(
                                    option.isCorrect()
                            );

                            optionResponses.add(
                                    optionResponse
                            );
                        }
                    }

                    detail.setOptions(optionResponses);

                    // -------------------------------------------------
                    // STUDENT ANSWER
                    // -------------------------------------------------

                    String studentAnswer =
                            convertAnswerIdsToText(
                                    testAnswer.getStudentAnswer(),
                                    options
                            );

                    detail.setStudentAnswer(
                            studentAnswer
                    );

                    // -------------------------------------------------
                    // CORRECT ANSWER
                    // -------------------------------------------------

                    String correctAnswer =
                            question.getAnswer();

                    String convertedCorrectAnswer =
                            convertAnswerIdsToText(
                                    correctAnswer,
                                    options
                            );

                    detail.setCorrectAnswer(
                            convertedCorrectAnswer
                    );

                    // -------------------------------------------------
                    // CORRECT / INCORRECT
                    // -------------------------------------------------

                    boolean correct = false;

                    if (testAnswer.getMarks() != null &&
                            question.getMarks() != null &&
                            question.getMarks() > 0) {

                        correct =
                                testAnswer.getMarks()
                                        .equals(question.getMarks());
                    }

                    detail.setCorrect(correct);

                    // -------------------------------------------------
                    // GRADING STATUS / FEEDBACK
                    // -------------------------------------------------

                    detail.setGradingStatus(
                            testAnswer.getGradingStatus() == null
                                    ? "AUTO_GRADED"
                                    : testAnswer.getGradingStatus()
                    );

                    detail.setFeedback(
                            testAnswer.getFeedback()
                    );

                    answerDetails.add(detail);
                }
            }

            response.setAnswers(answerDetails);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Error fetching detailed result: "
                                    + e.getMessage()
                    );
        }
    }

    // =============================================================
    // CONVERT OPTION IDs TO OPTION TEXT
    // =============================================================

    private String convertAnswerIdsToText(
            String answer,
            List<QuestionOption> options) {

        if (answer == null ||
                answer.trim().isEmpty() ||
                options == null ||
                options.isEmpty()) {

            return answer;
        }

        String value = answer.trim();

        // ---------------------------------------------------------
        // Handle multiple selected options
        //
        // Examples:
        // "45,48"
        // "[45,48]"
        // "[45, 48]"
        // ---------------------------------------------------------

        value = value
                .replace("[", "")
                .replace("]", "");

        String[] selectedIds =
                value.split(",");

        List<String> answerTexts =
                new ArrayList<>();

        for (String selectedId : selectedIds) {

            String idValue =
                    selectedId.trim();

            if (idValue.isEmpty()) {
                continue;
            }

            try {

                Long optionId =
                        Long.parseLong(idValue);

                boolean found = false;

                for (QuestionOption option : options) {

                    if (option.getId() != null &&
                            option.getId().equals(optionId)) {

                        answerTexts.add(
                                option.getOptionText()
                        );

                        found = true;
                        break;
                    }
                }

                // -------------------------------------------------
                // If ID doesn't match an option,
                // keep the original value.
                // -------------------------------------------------

                if (!found) {

                    answerTexts.add(idValue);
                }

            } catch (NumberFormatException e) {

                // -------------------------------------------------
                // This is probably already normal text.
                // Example:
                // "String"
                // "Compilation error"
                // -------------------------------------------------

                answerTexts.add(idValue);
            }
        }

        if (answerTexts.isEmpty()) {

            return answer;
        }

        return String.join(", ", answerTexts);
    }

    // =============================================================
    // GET ALL ATTEMPTS
    // =============================================================

    @GetMapping
    public ResponseEntity<?> getAllAttempts() {

        try {

            List<TestAttempt> attempts =
                    testAttemptRepository.findAll();

            return ResponseEntity.ok(attempts);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching attempts");
        }
    }

    // =============================================================
    // CALCULATE SCORE
    // =============================================================

    @PutMapping("/{attemptId}/calculate-score")
    public ResponseEntity<?> calculateScore(
            @PathVariable Long attemptId) {

        try {

            TestAttempt attempt =
                    testAttemptRepository
                            .findById(attemptId)
                            .orElse(null);

            if (attempt == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Attempt not found");
            }

            List<TestAnswer> answers =
                    testAnswerRepository
                            .findByAttempt(attempt);

            int totalScore = 0;

            if (answers != null) {

                for (TestAnswer answer : answers) {

                    if (answer != null &&
                            answer.getMarks() != null) {

                        totalScore += answer.getMarks();
                    }
                }
            }

            int totalMarks =
                    attempt.getTotalMarks() == null
                            ? 0
                            : attempt.getTotalMarks();

            if (totalScore > totalMarks) {
                totalScore = totalMarks;
            }

            if (totalScore < 0) {
                totalScore = 0;
            }

            attempt.setScore(totalScore);

            double percentage = 0;

            if (totalMarks > 0) {

                percentage =
                        ((double) totalScore /
                                totalMarks) * 100;
            }

            boolean hasPendingReview = false;

            if (answers != null) {
                for (TestAnswer a : answers) {
                    if (a != null &&
                            "PENDING_REVIEW".equals(a.getGradingStatus())) {
                        hasPendingReview = true;
                        break;
                    }
                }
            }

            if (hasPendingReview) {
                attempt.setStatus("PENDING_REVIEW");
            } else if (percentage >= 40.0) {
                attempt.setStatus("PASSED");
            } else {
                attempt.setStatus("FAILED");
            }

            TestAttempt savedAttempt =
                    testAttemptRepository.save(attempt);

            return ResponseEntity.ok(
                    new CalculateScoreResponse(
                            savedAttempt.getId(),
                            totalScore,
                            totalMarks,
                            percentage,
                            savedAttempt.getStatus()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Error calculating score: "
                                    + e.getMessage()
                    );
        }
    }

    // =============================================================
    // DETAILED RESULT DTO
    // =============================================================

    public static class DetailedResultResponse {

        private Long attemptId;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private Long testId;
        private String testName;
        private int score;
        private int totalMarks;
        private double percentage;
        private String status;
        private List<AnswerDetailResponse> answers;

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public String getStudentEmail() {
            return studentEmail;
        }

        public void setStudentEmail(String studentEmail) {
            this.studentEmail = studentEmail;
        }

        public Long getTestId() {
            return testId;
        }

        public void setTestId(Long testId) {
            this.testId = testId;
        }

        public String getTestName() {
            return testName;
        }

        public void setTestName(String testName) {
            this.testName = testName;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public int getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(int totalMarks) {
            this.totalMarks = totalMarks;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public List<AnswerDetailResponse> getAnswers() {
            return answers;
        }

        public void setAnswers(
                List<AnswerDetailResponse> answers) {

            this.answers = answers;
        }
    }

    // =============================================================
    // ANSWER DETAIL DTO
    // =============================================================

    public static class AnswerDetailResponse {

        private Long answerId;
        private Long questionId;
        private String question;
        private String studentAnswer;
        private String correctAnswer;
        private String difficulty;
        private int marks;
        private int maxMarks;
        private boolean correct;
        private String gradingStatus;
        private String feedback;
        private List<OptionResponse> options;

        public Long getAnswerId() {
            return answerId;
        }

        public void setAnswerId(Long answerId) {
            this.answerId = answerId;
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public String getStudentAnswer() {
            return studentAnswer;
        }

        public void setStudentAnswer(String studentAnswer) {
            this.studentAnswer = studentAnswer;
        }

        public String getCorrectAnswer() {
            return correctAnswer;
        }

        public void setCorrectAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public int getMarks() {
            return marks;
        }

        public void setMarks(int marks) {
            this.marks = marks;
        }

        public int getMaxMarks() {
            return maxMarks;
        }

        public void setMaxMarks(int maxMarks) {
            this.maxMarks = maxMarks;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }

        public String getGradingStatus() {
            return gradingStatus;
        }

        public void setGradingStatus(String gradingStatus) {
            this.gradingStatus = gradingStatus;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }

        public List<OptionResponse> getOptions() {
            return options;
        }

        public void setOptions(
                List<OptionResponse> options) {

            this.options = options;
        }
    }

    // =============================================================
    // OPTION DTO
    // =============================================================

    public static class OptionResponse {

        private Long id;
        private String optionText;
        private boolean correct;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }
    }

    // =============================================================
    // CALCULATE SCORE RESPONSE
    // =============================================================

    public static class CalculateScoreResponse {

        private Long attemptId;
        private int score;
        private int totalMarks;
        private double percentage;
        private String status;

        public CalculateScoreResponse(
                Long attemptId,
                int score,
                int totalMarks,
                double percentage,
                String status) {

            this.attemptId = attemptId;
            this.score = score;
            this.totalMarks = totalMarks;
            this.percentage = percentage;
            this.status = status;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public int getScore() {
            return score;
        }

        public int getTotalMarks() {
            return totalMarks;
        }

        public double getPercentage() {
            return percentage;
        }

        public String getStatus() {
            return status;
        }
    }
}
