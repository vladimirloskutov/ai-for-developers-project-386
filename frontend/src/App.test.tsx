import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('рендерится без ошибок и показывает заголовок', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Календарь звонков/i })).toBeInTheDocument();
  });

  it('показывает адрес API из переменных окружения', () => {
    render(<App />);

    expect(screen.getByText('http://localhost:3000')).toBeInTheDocument();
  });
});
