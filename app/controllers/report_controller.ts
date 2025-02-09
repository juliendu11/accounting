import { HttpContext } from '@adonisjs/core/http'
import { createReportValidator } from '#validators/report'
import app from '@adonisjs/core/services/app'
import * as fs from 'node:fs/promises'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import UserReportService from '#services/user_report_service'

@inject()
export default class ReportController {
  constructor(protected userReportService: UserReportService) {}

  async index({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(createReportValidator)

    const buffer = await this.userReportService.execute(user, payload.year)

    const filename = `report-${payload.year}-${DateTime.now().toFormat('yyyy-MM-dd')}.xlsx`
    const basePath = app.makePath('uploads', 'users', user.id.toString(), 'report')
    const filePath = app.makePath(basePath, filename)

    await fs.mkdir(basePath, {
      recursive: true,
    })

    await fs.rm(filePath, { force: true })

    await fs.writeFile(filePath, buffer)

    return response.attachment(filePath, filename)
  }
}
