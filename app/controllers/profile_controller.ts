import { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'
import User from '#models/user'

export default class ProfileController {
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateProfileValidator)
    const userId = params.id

    const user = await User.findOrFail(userId)
    user.merge({ locale: payload.locale, theme: payload.theme })
    await user.save()

    return response.redirect().withQs().back()
  }

  async show({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('profile/item', {
      user,
    })
  }
}
