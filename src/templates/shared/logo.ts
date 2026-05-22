import { AdapterFile } from '../../adapters/index.js';
import { STACKMINT_LOGO_BASE64 } from '../../generated/logo-base64.js';

export function getStackmintLogoFile(customPath?: string): AdapterFile {
  return {
    path: customPath || 'public/logo.png',
    content: STACKMINT_LOGO_BASE64,
    encoding: 'base64',
    overwrite: true,
  };
}
