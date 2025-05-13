function checkData(courseInfo, assignmentGroup, submissions) {
    if (!courseInfo || typeof courseInfo !== "object" || typeof courseInfo.id !== "number" || typeof courseInfo.name !== "string") {
        throw new Error("CourseInfo is not right! Needs id (number) and name (string).");
    }  

    if (
        !assignmentGroup ||typeof assignmentGroup !== "object" ||typeof assignmentGroup.id !== "number" ||typeof assignmentGroup.name !== "string" ||
        typeof assignmentGroup.course_id !== "number" ||typeof assignmentGroup.group_weight !== "number" ||!Array.isArray(assignmentGroup.assignments)
    ) {
        throw new Error("AssignmentGroup is wrong! Needs id, name, course_id, group_weight, and assignments array.");
    }

    if (!Array.isArray(submissions)) {
        throw new Error("Submissions must be an array!");
    }

    if (assignmentGroup.course_id !== courseInfo.id) {
        throw new Error("AssignmentGroup doesn't match the course!");
    }

    for (let i = 0; i < assignmentGroup.assignments.length; i++) {
        let assignment = assignmentGroup.assignments[i];
        if (
            !assignment ||
            typeof assignment.id !== "number" ||
            typeof assignment.name !== "string" ||
            typeof assignment.due_at !== "string" ||
            typeof assignment.points_possible !== "number" ||
            assignment.points_possible <= 0
        ) {
            throw new Error("Assignment " + (assignment.id || "unknown") + " is invalid!");
        }
    }
}

function isDue(dueDate) {
    let now = new Date(); 
    let due = new Date(dueDate); 
    return due <= now; 
}

function isLate(submittedDate, dueDate) {
    let submitted = new Date(submittedDate);
    let due = new Date(dueDate);
    return submitted > due; 
}

function getScore(submission, assignment) {
    let score = submission.submission.score; 
    if (typeof score !== "number") {
        throw new Error("Score for assignment " + assignment.id + " must be a number!");
    }
    if (isLate(submission.submission.submitted_at, assignment.due_at)) {
        score = score - assignment.points_possible * 0.1; 
    }
    if (score < 0) {
        score = 0; 
    }
    return score;
}

function getLearnerData(courseInfo, assignmentGroup, submissions) {
    try {
        checkData(courseInfo, assignmentGroup, submissions);

        let dueAssignments = [];
        for (let i = 0; i < assignmentGroup.assignments.length; i++) {
            let assignment = assignmentGroup.assignments[i];
            if (assignment.points_possible <= 0 || !isDue(assignment.due_at)) {
                continue; 
            }
            dueAssignments.push(assignment);
        }

        let learners = {};
        for (let submission of submissions) {
            if (
                !submission ||
                typeof submission.learner_id !== "number" ||
                typeof submission.assignment_id !== "number" ||
                !submission.submission ||
                typeof submission.submission.submitted_at !== "string" ||
                typeof submission.submission.score !== "number"
            ) {
                console.log("Skipping bad submission:", submission);
                continue;
            }

            let learnerId = submission.learner_id;
            if (!learners[learnerId]) {
                learners[learnerId] = []; 
            }
            learners[learnerId].push(submission);
        }

        let result = [];
        for (let learnerId in learners) {
            let learnerSubmissions = learners[learnerId];
            let learnerData = { id: Number(learnerId) }; 
            let totalScore = 0; 
            let totalPoints = 0; 

            for (let assignment of dueAssignments) {

                let submission = learnerSubmissions.find((sub) => sub.assignment_id === assignment.id);
                if (submission) {
                    let score = getScore(submission, assignment);
                    let percentage = (score / assignment.points_possible) * 100;
                    learnerData[assignment.id] = Number(percentage.toFixed(2)); 
                    totalScore += score * (assignmentGroup.group_weight / 100);
                    totalPoints += assignment.points_possible * (assignmentGroup.group_weight / 100);
                }
            }

            if (totalPoints > 0) {
                learnerData.avg = Number((totalScore / totalPoints * 100).toFixed(2));
            } else {
                learnerData.avg = 0; 
            }

            if (Object.keys(learnerData).length > 2) {
                result.push(learnerData);
            }
        }

        return result;

    } catch (error) {
        console.log("Something went wrong:", error.message);
        throw error; 
    }
}


const courseInfo = {
    id: 1,
    name: "JavaScript Fundamentals",
};

const assignmentGroup = {
    id: 1,
    name: "Homework",
    course_id: 1,
    group_weight: 100,
    assignments: [
        {
            id: 1,
            name: "Assignment 1",
            due_at: "2025-05-10", 
            points_possible: 100,
        },
        {
            id: 2,
            name: "Assignment 2",
            due_at: "2025-05-15", 
            points_possible: 200,
        },
        {
            id: 3,
            name: "Assignment 3",
            due_at: "2025-06-01", 
            points_possible: 50,
        },
    ],
};

const submissions = [
    {
        learner_id: 1,
        assignment_id: 1,
        submission: {
            submitted_at: "2025-05-09", 
            score: 80,
        },
    },
    {
        learner_id: 1,
        assignment_id: 2,
        submission: {
            submitted_at: "2025-05-08", 
            score: 180,
        },
    },
    {
        learner_id: 2,
        assignment_id: 1,
        submission: {
            submitted_at: "2025-05-09", 
            score: 90,
        },
    },
];

try {
    let result = getLearnerData(courseInfo, assignmentGroup, submissions);
    console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
    console.log("Error running program:", error.message);
}
