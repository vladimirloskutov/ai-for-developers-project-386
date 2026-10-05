import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Без globals: true автоочистка не подключается, поэтому чистим DOM явно
afterEach(() => {
  cleanup();
});
