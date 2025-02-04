/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
