import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/fr'

export default {
  install: () => {
    dayjs.extend(updateLocale)

    dayjs.updateLocale('en', {
      weekStart: 1,
    })

    dayjs.updateLocale('fr', {
      weekStart: 1,
      weekdays: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
      weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      monthsShort: [
        'Jan',
        'Fev',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Jui',
        'Aoû',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      months: [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
      ],
    })
  },
}
