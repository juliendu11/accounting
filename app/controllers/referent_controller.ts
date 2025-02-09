import { HttpContext } from '@adonisjs/core/http'
import Referent from '#models/referent'
import { createReferentValidator } from '#validators/referent'
import Transaction from '#models/transaction'

export default class ReferentController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const referents = await Referent.query().where('user_id', user.id)

    return inertia.render('referent/index', { referents })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('referent/create')
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createReferentValidator)

    await Referent.create({
      ...payload,
      userId: user.id,
    })

    return response.redirect().toRoute('referent.index')
  }

  async destroy({ params, auth, response, session, i18n }: HttpContext) {
    const user = auth.getUserOrFail()

    const referent = await Referent.findBy({ id: params.id, userId: user.id })

    if (!referent) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.referent_not_found'),
      })
      return response.redirect().back()
    }

    const result = await Transaction.query()
      .where('referent_id', referent.id)
      .andWhere('user_id', user.id)
      .first()

    if (result) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.referent_delete_linked_to_transaction_error'),
      })
      return response.redirect().back()
    }

    await referent.delete()

    return response.redirect().toRoute('referent.index')
  }
}
