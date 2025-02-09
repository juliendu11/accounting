import factory from '@adonisjs/lucid/factories'
import Referent from '#models/referent'

export const ReferentFactory = factory
  .define(Referent, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
    }
  })
  .build()
