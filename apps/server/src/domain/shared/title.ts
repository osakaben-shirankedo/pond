import * as v from 'valibot'
export const titleSchema = v.pipe(
  v.string(),
  v.minLength(1, 'You must have a length of at least 1.'),
  v.maxLength(50, 'You must be 50 characters or less.')
)
