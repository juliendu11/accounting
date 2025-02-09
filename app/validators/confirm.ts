import vine from '@vinejs/vine'

export const confirmValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    token: vine.string().trim().minLength(4).maxLength(256),
  })
)
