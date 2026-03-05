import { render, screen } from '@testing-library/angular';
import { DrawerComponent } from './drawer.component';

describe('DrawerComponent', () => {
  it('should render the component', async () => {
    const { container } = await render(DrawerComponent);

    expect(container).toBeTruthy();
  });

  it('should project content correctly', async () => {
    await render(
      `<app-drawer>
        <h1>Test Content</h1>
        <p>This is projected content</p>
      </app-drawer>`,
      {
        imports: [DrawerComponent],
      }
    );

    const heading = screen.getByRole('heading', { level: 1 });
    const paragraph = screen.getByText('This is projected content');

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Content');
    expect(paragraph).toBeInTheDocument();
  });
});
