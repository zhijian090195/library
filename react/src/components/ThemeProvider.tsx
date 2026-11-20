import * as React from 'react';

/** default＝紙雕分層（AICDE 原色）；clean＝無裝飾簡潔版；paper＝暖米色紙雕 */
export type ThemeStyle = 'default' | 'clean' | 'paper' | 'ink' | 'soft' | 'riso' | 'brutal' | 'stitch' | 'ticket' | 'block' | 'blueprint' | 'clinical' | 'cute' | 'finance' | 'editorial';

export interface ThemeProviderProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 元件主題；預設 default（紙雕分層） */
  theme?: ThemeStyle;
  /** 深淺色；system 跟著系統設定 */
  mode?: 'light' | 'dark' | 'system';
}

/** 用 data-theme-style／data-theme 套用主題，只影響包在裡面的元件 */
export function ThemeProvider({ theme = 'default', mode = 'system', children, ...rest }: ThemeProviderProps) {
  return (
    <div
      data-theme-style={theme === 'default' ? undefined : theme}
      data-theme={mode === 'system' ? undefined : mode}
      {...rest}
    >
      {children}
    </div>
  );
}
