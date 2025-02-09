import vine from '@vinejs/vine'

export const createReportValidator = vine.compile(
  vine.object({
    year: vine.number(),
  })
)
