import { render, screen } from '@testing-library/angular';
import { PanelComponent } from './panel.component';

describe('PanelComponent', () => {
  it('renders projected content', async () => {
    await render('<app-panel>panel content</app-panel>', {
      imports: [PanelComponent],
    });

    expect(screen.getByText('panel content')).toBeInTheDocument();
  });

  it('renders multiple projected elements', async () => {
    await render('<app-panel><span>first</span><span>second</span></app-panel>', {
      imports: [PanelComponent],
    });

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });
});
