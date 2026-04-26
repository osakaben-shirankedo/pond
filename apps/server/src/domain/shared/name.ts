import * as v from 'valibot'
export const nameSchema = v.pipe(v.string(), v.minLength(1, 'You must have a length of at least 1.'))
