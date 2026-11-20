import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useControllable } from '../utils';

export interface TreeNode {
  key: string;
  label: ReactNode;
  children?: TreeNode[];
  icon?: ReactNode;
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: TreeNode[];
  /** 預設展開的資料夾 key */
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpandChange?: (keys: string[]) => void;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string, node: TreeNode) => void;
}

const FOLDER = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
const FILE = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>;

/** 樹狀結構：資料夾用原生 <details>，檔案可選取 */
export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  { data, defaultExpandedKeys = [], expandedKeys, onExpandChange, selectedKey, defaultSelectedKey = '', onSelect, className, ...rest }, ref
) {
  const [open, setOpen] = useControllable<string[]>(expandedKeys, defaultExpandedKeys, onExpandChange);
  const [sel, setSel] = useControllable<string>(selectedKey, defaultSelectedKey);
  const choose = (n: TreeNode) => { setSel(n.key); onSelect?.(n.key, n); };

  const render = (nodes: TreeNode[]): ReactNode => (
    <ul>
      {nodes.map(n => (
        <li key={n.key}>
          {n.children ? (
            <details open={open.includes(n.key)}>
              <summary onClick={e => { e.preventDefault(); setOpen(open.includes(n.key) ? open.filter(k => k !== n.key) : [...open, n.key]); }}>
                {n.icon ?? FOLDER}{n.label}
              </summary>
              {render(n.children)}
            </details>
          ) : (
            <span
              className="a-tree__leaf"
              tabIndex={0}
              role="button"
              aria-current={sel === n.key ? 'true' : undefined}
              onClick={() => choose(n)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(n); } }}
            >
              {n.icon ?? FILE}{n.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return <div ref={ref} className={cx('a-tree', className)} {...rest}>{render(data)}</div>;
});
