import * as v from 'valibot'
export const descriptionSchema = v.pipe(v.string(), v.maxLength(20, 'You must be 20 characters or less.'))
