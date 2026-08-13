import type { InPageNavigationItem } from '../InPageNavigation.types.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';
const linkBase = ['rounded-pill px-s py-2xs text-base no-underline transition-colors', focusRing].join(' ');

export function NavigationLinks({
  items,
  activeId,
  onNavigate,
}: {
  items: InPageNavigationItem[];
  activeId?: string;
  onNavigate?: () => void;
}) {
  return items.map((item) => {
    const active = item.id === activeId;
    return (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          aria-current={active ? 'true' : undefined}
          onClick={onNavigate}
          className={[linkBase, active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'].join(' ')}
        >
          {item.label}
        </a>
      </li>
    );
  });
}
