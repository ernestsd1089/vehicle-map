import { render, screen } from '@testing-library/angular';
import { MarkerComponent } from './marker.component';

describe('MarkerComponent', () => {
  describe('template rendering', () => {
    it('renders an icon span when icon input is set', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { icon: 'car', color: '#005cbb' },
      });

      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders the label when label input is set', async () => {
      await render(MarkerComponent, {
        inputs: { label: 4, color: '#005cbb' },
      });

      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('icon color', () => {
    it('uses white icon color on a dark background', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { icon: 'car', color: '#000000' },
      });

      const span = container.querySelector('span') as HTMLElement;
      expect(span.style.backgroundColor).toBe('white');
    });

    it('uses black icon color on a light background', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { icon: 'car', color: '#ffffff' },
      });

      const span = container.querySelector('span') as HTMLElement;
      expect(span.style.backgroundColor).toBe('black');
    });
  });

  describe('host bindings', () => {
    it('applies the provided background color to the host', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { color: '#e74c3c' },
      });

      expect(container).toHaveStyle({ backgroundColor: '#e74c3c' });
    });

    it('adds the selected class when selected is true', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { selected: true },
      });

      expect(container).toHaveClass('selected');
    });

    it('does not add the selected class when selected is false', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { selected: false },
      });

      expect(container).not.toHaveClass('selected');
    });

    it('adds the disabled class when disabled is true', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { disabled: true },
      });

      expect(container).toHaveClass('disabled');
    });

    it('does not add the disabled class when disabled is false', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { disabled: false },
      });

      expect(container).not.toHaveClass('disabled');
    });

    it('adds the sm class when size is sm', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { size: 'sm' },
      });

      expect(container).toHaveClass('sm');
    });

    it('does not add the sm class when size is md', async () => {
      const { container } = await render(MarkerComponent, {
        inputs: { size: 'md' },
      });

      expect(container).not.toHaveClass('sm');
    });
  });
});
