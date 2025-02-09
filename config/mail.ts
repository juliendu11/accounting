import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  from: {
    address: 'no-reply@accounting.fr',
    name: 'no-reply@accounting.fr',
  },
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      auth: (env.get('SMTP_USER') as string | undefined)
        ? {
            type: 'login',
            user: env.get('SMTP_USER') as string,
            pass: env.get('SMTP_PASS') as string,
          }
        : undefined,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
