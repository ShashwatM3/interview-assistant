// Each document in the "interviews" document in the user's document 
// will have the below format

const doc = {
  preInterview: {
    role_interviewer: "",
    goal: "",
    rules: "",
    JD: "",
    warmup_depth: 6,
    core_depth: 10,
  },
  warm_up: {  
    questions: ["...", "...", "...", "..."],
    answers: ["...", "...", "...", "..."],
    feedback: {
      confidence: [8, "..."],
      communication: [7, "..."],
      clarity: [10, "..."],
      tips: "..."
    }
  },
  core: {
    questions: ["...", "...", "...", "...", "...", "..."],
    answers: ["...", "...", "...", "...", "...","..."],
    // follow_up_qs: ["...", "...", "..."],
    // follow_up_answers: ["...", "...", "...", "..."]
  },
  final_report: {
    overall_performance: "...",
    strengths: ["...", "...", "..."],
    areas_for_improvement: ["...", "...", "..."],
    section_scores: {
      Warmup: {
        score: 7,
        comments: "............."
      },
      Core: {
        score: 8,
        comments: "............."
      },
      Followups: {
        score: 9,
        comments: ".............."
      }
    },
    communication_skills: {
      score: 7,
      comments: "..........."
    },
    cultural_alignment: {
      score: 9,
      comments: "..........."
    },
    next_steps_recommendation: "..............."
  }
}