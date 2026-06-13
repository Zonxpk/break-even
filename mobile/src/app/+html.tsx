import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import { theme } from '../ui/theme';

const { mobileWebWidth } = theme;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content={`width=${mobileWebWidth}, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`}
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body { height: 100%; margin: 0; }
              body {
                display: flex;
                justify-content: center;
                background: #111;
              }
              #root {
                width: 100%;
                max-width: ${mobileWebWidth}px;
                min-height: 100%;
                background: ${theme.bg};
                box-shadow: 0 0 48px rgba(0, 0, 0, 0.35);
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
