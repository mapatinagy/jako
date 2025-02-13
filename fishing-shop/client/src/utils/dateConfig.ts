import { huHU } from '@mui/x-date-pickers/locales';
import { hu } from 'date-fns/locale';

export const datePickerConfig = {
  format: 'yyyy/MM/dd',  // This will display as ÉÉÉÉ/HH/NN in Hungarian
  slotProps: { 
    textField: { 
      size: 'small' as const,  // Type assertion to literal 'small'
      fullWidth: true 
    }
  },
  localeText: huHU.components.MuiLocalizationProvider.defaultProps.localeText,
  firstDayOfWeek: 1,  // Monday
  adapterLocale: hu  // Hungarian locale for date-fns
}; 