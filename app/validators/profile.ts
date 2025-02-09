import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    locale: vine.enum(['en', 'fr']),
    theme: vine.enum(['dark', 'light']),
  })
)
