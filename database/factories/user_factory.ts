import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: 'password123',
      treasury: 0,
      confirmTokenSentAt: DateTime.now(),
      confirmToken: string.random(32),
    }
  })
  .build()
