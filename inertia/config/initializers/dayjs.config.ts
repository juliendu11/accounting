import 'dayjs/locale/fr'

import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    d: 'a day',
    dd: '%dd',
    future: 'in %s',
    h: 'an hour',
    hh: '%dh',
    m: 'a minute',
    M: 'a month',
    mm: '%dm',
    MM: '%dm',
    past: '%s ago',
    s: 'Just Now',
    y: 'a year',
    yy: '%dy',
  },
  weekStart: 1,
})

dayjs.updateLocale('fr', {
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
  weekdays: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
  weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  weekStart: 1,
})
