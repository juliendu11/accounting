import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      username: env.get('USER_EMAIL').split('@')[0],
      email: env.get('USER_EMAIL'),
      password: env.get('USER_PASSWORD'),
      confirmTokenSentAt: DateTime.now(),
      confirmToken: string.random(32),
      treasury: 0,
    })
  }
}
