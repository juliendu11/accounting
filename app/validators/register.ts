import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    username: vine.string().trim(),
    password: vine.string().trim(),
    locale: vine.enum(['en', 'fr']),
    theme: vine.enum(['light', 'dark']),
    treasury: vine.number(),
  })
)
