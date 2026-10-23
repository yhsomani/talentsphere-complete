import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';

export interface CommandItem {
  label: string;
  path: string;
}

interface CommandPaletteProps {
  items: ReadonlyArray<CommandItem>;
}

/**
 * Command search (F-20). Ctrl+K or Cmd+K opens a list of destinations, typing
 * filters it, Arrow keys move, Enter opens the highlighted one, Escape closes
 * and returns focus to whatever had it before.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ items }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? items.filter((item) => item.label.toLowerCase().includes(needle)) : items;
  }, [items, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) {
          setOpen(false);
          returnFocusRef.current?.focus();
        } else {
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    returnFocusRef.current?.focus();
  };

  const choose = (item: CommandItem | undefined) => {
    if (!item) return;
    setOpen(false);
    navigate(item.path);
  };

  if (!open) return null;

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((index) => (matches.length === 0 ? 0 : (index + 1) % matches.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((index) =>
        matches.length === 0 ? 0 : (index - 1 + matches.length) % matches.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(matches[active]);
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '12vh',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command search"
        data-testid="command-palette"
        style={{
          width: 'min(560px, calc(100vw - 32px))',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-palette-list"
          aria-activedescendant={matches[active] ? `command-option-${active}` : undefined}
          aria-label="Search pages"
          placeholder="Go to..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKeyDown}
          data-testid="command-palette-input"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: spacing.md,
            border: 0,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <ul
          id="command-palette-list"
          role="listbox"
          aria-label="Pages"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: spacing.xs,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {matches.length === 0 && (
            <li role="option" aria-selected="false" style={{ padding: spacing.md }}>
              No pages match &quot;{query.trim()}&quot;.
            </li>
          )}
          {matches.map((item, index) => {
            const selected = index === active;
            return (
              <li
                key={item.path}
                id={`command-option-${index}`}
                role="option"
                aria-selected={selected}
                data-testid="command-palette-option"
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: selected ? colors.neutral[100] : 'transparent',
                }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
