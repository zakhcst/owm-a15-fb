import { BREAKPOINT } from '@angular/flex-layout';

const CUSTOM_XS_BREAKPOINTS = [{
  // eXtra  Small Vertical
  alias: 'xs300h',
  suffix: 'xs300h',
  mediaQuery: '(max-height: 300px)',
  overlapping: true,
  priority: 1001
}, {
  // eXtra Small Horizontal
  alias: 'xs500w',
  suffix: 'xs500w',
  mediaQuery: '(max-width: 540px)',
  overlapping: true,
  priority: 1002
}];

export const CustomBreakPointsProvider = {
  provide: BREAKPOINT,
  useValue: CUSTOM_XS_BREAKPOINTS,
  multi: true
};
