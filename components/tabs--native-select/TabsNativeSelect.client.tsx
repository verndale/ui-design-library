import { useRef } from 'react';

import { TabPanels } from '../tabs/parts/TabPanels.js';
import { useTabsController } from '../tabs/parts/useTabsController.client.js';
import { TabsResponsiveControls } from './parts/TabsResponsiveControls.client.js';
import { useResponsiveTabsFocus } from './parts/useResponsiveTabsFocus.client.js';
import type { TabsNativeSelectProps } from './TabsNativeSelect.types.js';

/** Tabs structural alternate: pills at lg and a native select below lg. */
export function TabsNativeSelect({
  items,
  ariaLabel,
  activeId,
  defaultActiveId,
  onSelect,
  tabIdPrefix,
  className,
  classNames,
}: TabsNativeSelectProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const controller = useTabsController({
    items,
    activeId,
    defaultActiveId,
    onSelect,
    tabIdPrefix,
    orientation: 'horizontal',
  });

  useResponsiveTabsFocus({
    activeIndex: controller.activeIndex,
    desktopRef,
    selectRef,
    tabRefs: controller.tabRefs,
  });

  if (items.length === 0) return null;

  return (
    <div
      data-component="tabs-native-select"
      role="group"
      aria-label={ariaLabel}
      className={['flex flex-col gap-m', classNames?.root, className].filter(Boolean).join(' ')}
    >
      <TabsResponsiveControls
        items={items}
        activeIndex={controller.activeIndex}
        ariaLabel={ariaLabel}
        tabIdPrefix={controller.resolvedPrefix}
        classNames={classNames}
        desktopRef={desktopRef}
        selectRef={selectRef}
        onSelect={controller.select}
        onKeyDown={controller.handleKeyDown}
        registerTab={controller.registerTab}
      />
      <TabPanels
        items={items}
        activeIndex={controller.activeIndex}
        tabIdPrefix={controller.resolvedPrefix}
        className={classNames?.panels}
        panelClassName={classNames?.panel}
      />
    </div>
  );
}
