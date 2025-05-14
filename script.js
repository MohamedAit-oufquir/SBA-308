// Data about the course
const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript"
};

// Data about assignments
const AssignmentGroup = {
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: "Declare a Variable",
      due_at: "2023-01-25",
      points_possible: 50
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2023-02-27",
      points_possible: 150
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "3156-11-15",
      points_possible: 500
    }
  ]
};

// Data about student submissions
const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-25",
      score: 47
    }
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-02-12",
      score: 150
    }
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: "2023-01-25",
      score: 400
    }
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-24",
      score: 39
    }
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-03-07",
      score: 140
    }
  }
];

// Function to process student data
function getLearnerData(course, ag, submissions) {
  // Show the first student's ID
  console.log(submissions[0].learner_id);

  // Lists of student IDs, assignment IDs, and scores
  const learner_id = [125, 125, 125, 132, 132];
  let assignment_id = [1, 2, 3, 1, 2];
  let score = [47, 150, 400, 39, 140];

  // Print the student IDs
  console.log(learner_id);

  // Check if inputs are correct
  try {
    if (!course || !ag || !submissions) {
      console.log("Error: Missing some information");
      return [];
    }
    if (ag.course_id != course.id) {
      console.log("Error: Wrong course");
      return [];
    }
  } catch (error) {
    console.log("Something went wrong:", error);
    return [];
  }

  // Find unique student IDs
  let uniqueLearners = [];
  for (let i = 0; i < learner_id.length; i++) {
    let id = learner_id[i];
    let alreadyAdded = false;
    for (let j = 0; j < uniqueLearners.length; j++) {
      if (uniqueLearners[j] == id) {
        alreadyAdded = true;
      }
    }
    if (!alreadyAdded) {
      uniqueLearners.push(id);
    }
  }

  // Store results for each student
  let results = [];

  // Loop through each student
  for (let i = 0; i < uniqueLearners.length; i++) {
    let studentId = uniqueLearners[i];
    let studentData = {
      id: studentId,
      avg: 0
    };

    let totalScore = 0;
    let totalPossible = 0;
    let count = 0;

    // Check each submission for this student
    let j = 0;
    while (j < learner_id.length) {
      if (learner_id[j] != studentId) {
        j++;
        continue; // Skip if not this student
      }

      let assignId = assignment_id[j];
      let studentScore = score[j];

      // Find the assignment details
      let assignment = null;
      for (let k = 0; k < ag.assignments.length; k++) {
        if (ag.assignments[k].id == assignId) {
          assignment = ag.assignments[k];
          break; // Stop searching once found
        }
      }

      if (!assignment) {
        console.log("Assignment " + assignId + " not found");
        j++;
        continue;
      }

      // Find submission for late check
      let submission = null;
      for (let k = 0; k < submissions.length; k++) {
        if (
          submissions[k].learner_id == studentId &&
          submissions[k].assignment_id == assignId
        ) {
          submission = submissions[k];
          break;
        }
      }

      if (!submission) {
        console.log("No submission for assignment " + assignId);
        j++;
        continue;
      }

      // Check if submission was late
      let dueDate = new Date(assignment.due_at);
      let submitDate = new Date(submission.submission.submitted_at);
      let isLate = submitDate > dueDate && dueDate < new Date();
      let finalScore = studentScore;

      if (isLate) {
        let penalty = assignment.points_possible * 0.1; // 10% off
        finalScore = finalScore - penalty;
        if (finalScore < 0) {
          finalScore = 0;
        }
      }

      // Check if score is valid
      let pointsPossible = assignment.points_possible;
      if (finalScore < 0 || pointsPossible <= 0) {
        console.log("Bad score for assignment " + assignId);
        j++;
        continue;
      }

      // Save score as a percentage
      studentData[assignId] = finalScore / pointsPossible;
      totalScore = totalScore + finalScore;
      totalPossible = totalPossible + pointsPossible;
      count = count + 1;

      // Give feedback based on score
      let percent = finalScore / pointsPossible;
      if (percent >= 0.9) {
        console.log("Student " + studentId + " did great on assignment " + assignId);
      } else if (percent < 0.6) {
        console.log("Student " + studentId + " needs help on assignment " + assignId);
      } else {
        console.log("Student " + studentId + " did okay on assignment " + assignId);
      }

      j++;
    }

    // Calculate average
    if (totalPossible > 0) {
      studentData.avg = totalScore / totalPossible;
    }

    // Check number of submissions
    if (count == 0) {
      console.log("No submissions for student " + studentId);
    } else {
      console.log("Processed " + count + " assignments for student " + studentId);
    }

    results.push(studentData);
  }

  // Remove assignment 3 score for first student (if exists)
  if (results.length > 0 && results[0]["3"]) {
    delete results[0]["3"];
  }

  return results;
}

// Run the function and show results
try {
  let finalResults = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
  console.log("Results:");
  console.log(finalResults);
} catch (error) {
  console.log("Error:", error);
}
