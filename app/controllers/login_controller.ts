import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login'
import User from '#models/user'
import i18nManager from '@adonisjs/i18n/services/main'
import env from '#start/env'

export default class LoginController {
  async index({ inertia }: HttpContext) {
    const payload: {
      email?: string
      password?: string
    } = {}

    if (env.get('IS_DEMO')) {
      payload.email = 'demo@example.com'
      payload.password = 'Demo1234!'
    }

    return inertia.render('auth/login', payload)
  }

  async store({ response, request, auth, session }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(payload.email, payload.password)
    const i18n = i18nManager.locale(user.locale ?? 'en')

    if (!user.confirmedAt) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.unconfirmed_account_error'),
      })
      return response.redirect().toPath('/login')
    }

    await auth.use('web').login(user)

    session.flash('notification', {
      type: 'success',
      message: i18n.t('messages.login_success'),
    })

    return response.redirect().toRoute('home.index')
  }

  async destroy({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('auth.index')
  }
}
