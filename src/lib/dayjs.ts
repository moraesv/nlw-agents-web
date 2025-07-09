import dayjslib from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjslib.locale('pt-br')
dayjslib.extend(relativeTime)

export const dayjs = dayjslib
