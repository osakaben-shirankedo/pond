import { useMutation } from '@tanstack/react-query'
import { evaluateChallenge } from '../endpoints/challenge'

export function useEvaluateChallengeMutation() {
  return useMutation({
    mutationFn: (body: {
      field: string
      challengeTitle: string
      challengeDescription: string
      answer: string
      isSubjective: boolean
    }) => evaluateChallenge(body),
  })
}
