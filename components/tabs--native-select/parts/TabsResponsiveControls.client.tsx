import type { KeyboardEventHandler, RefObject } from 'react';

import { TabsList } from '../../tabs/parts/TabsList.client.js';
import type { TabsNativeSelectClassNames, TabsNativeSelectItem } from '../TabsNativeSelect.types.js';

type TabsResponsiveControlsProps = {
  items: TabsNativeSelectItem[];
  activeIndex: number;
  ariaLabel: string;
  tabIdPrefix: string;
  classNames?: TabsNativeSelectClassNames;
  desktopRef: RefObject<HTMLDivElement | null>;
  selectRef: RefObject<HTMLSelectElement | null>;
  onSelect: (id: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  registerTab: (index: number, node: HTMLButtonElement | null) => void;
};

/** CSS owns visibility; both controls share one selection engine and one panel tree. */
export function TabsResponsiveControls({
  items,
  activeIndex,
  ariaLabel,
  tabIdPrefix,
  classNames,
  desktopRef,
  selectRef,
  onSelect,
  onKeyDown,
  registerTab,
}: TabsResponsiveControlsProps) {
  const selectId = `${tabIdPrefix}-select`;
  const selectedId = items[activeIndex]!.id;

  return (
    <>
      <div ref={desktopRef} data-tabs-responsive="tablist" className={['hidden lg:block', classNames?.desktop].filter(Boolean).join(' ')}>
        <TabsList
          items={items}
          activeIndex={activeIndex}
          ariaLabel={ariaLabel}
          tabIdPrefix={tabIdPrefix}
          className={classNames?.list}
          tabClassName={classNames?.tab}
          orientation="horizontal"
          presentation="pills"
          onSelect={onSelect}
          onKeyDown={onKeyDown}
          registerTab={registerTab}
        />
      </div>
      <div data-tabs-responsive="select" className={['lg:hidden', classNames?.mobile].filter(Boolean).join(' ')}>
        <label htmlFor={selectId} className={['sr-only', classNames?.selectLabel].filter(Boolean).join(' ')}>
          {ariaLabel}
        </label>
        <select
          ref={selectRef}
          id={selectId}
          value={selectedId}
          aria-controls={`${tabIdPrefix}-panel-${activeIndex}`}
          className={[
            'min-h-11 w-full rounded-medium border border-border-strong bg-surface-base px-s text-base text-text-primary',
            'outline-none focus-visible:border-border-focus focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
            classNames?.select,
          ].filter(Boolean).join(' ')}
          onChange={(event) => onSelect(event.currentTarget.value)}
        >
          {items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
    </>
  );
}
