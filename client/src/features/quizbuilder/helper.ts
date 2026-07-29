import { type Question } from "./types"

export const uid = () =>
  Math.random().toString(36).slice(2, 8)

export const emptyQuestion = (): Question => ({
  id: uid(),
  text: "",
  answers: [
    { id: uid(), text: "", correct: false },
    { id: uid(), text: "", correct: false },
    { id: uid(), text: "", correct: false },
    { id: uid(), text: "", correct: false }
  ],
  points: 1,
  explanation: ""
})