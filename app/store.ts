import { create } from "zustand";

type UserData = {
  first_name: string;
  last_name: string;
  email: string;
}

type interviewInfo = {
  preInterview: {
    JD: string;
    warmup_depth: number;
    core_depth: number;
  };
  warm_up: {
    questions: string[];
  };
  core: {
    questions: string[];
  };
};

type CounterStore = {
  idea: object;
  setIdea: (new_idea: object) => void;
  userData: object;
  setUserData: (user_data: UserData) => void;
  InterviewInfo: object;
  setInterviewInfo: (interview_info: interviewInfo) => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  idea: {},
  userData: {},
  InterviewInfo: {},
  setIdea: (new_idea) => {
    set((state) => ({idea: new_idea}))
  },
  setUserData: (user_data) => {
    set((state) => ({userData: user_data}))
  },
  setInterviewInfo: (interview_info) => {
    set((state) => ({InterviewInfo: interview_info}))
  },
}))