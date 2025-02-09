import vine from '@vinejs/vine'

export const createReferentValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
  })
)
