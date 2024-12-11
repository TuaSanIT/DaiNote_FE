// Styles
import '@fortawesome/fontawesome-free/css/all.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/lib/util/colors'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { md } from 'vuetify/iconsets/md'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
      md,
    },
  },
  theme: {
    themes: {
      light: {
        background: colors.grey.lighten2,
      },
      dark: {
        background: colors.shades.white,
      },
    },
  },
});
