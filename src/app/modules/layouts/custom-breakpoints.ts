import {BREAKPOINT} from '@angular/flex-layout';

const XXS_BREAKPOINTS = [{
  // eXtra eXtra Small Vertical
  alias: 'xxsv',
  suffix: 'xxsv',
  mediaQuery: '(max-height: 300px)',
  overlapping: true,
  priority: 1001
}];

export const CustomBreakPointsProvider = {
  provide: BREAKPOINT,
  useValue: XXS_BREAKPOINTS,
  multi: true
};
