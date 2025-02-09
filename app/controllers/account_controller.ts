import { HttpContext } from '@adonisjs/core/http'

export default class AccountController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('account/index', { user })
  }
}
