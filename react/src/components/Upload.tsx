import * as React from 'react';
import { cx } from '../utils';

export interface UploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** 主要文字，預設「把檔案拖到這裡，或 點擊選擇」 */
  title?: React.ReactNode;
  /** 格式說明，例如「PNG、JPG，單檔 10 MB 以內」 */
  hint?: React.ReactNode;
  /** 選擇或拖入檔案後回傳 */
  onChange?: (files: File[]) => void;
  /** 是否在下方列出已選的檔案，預設是 */
  showList?: boolean;
  /** input 的 name，方便放進表單 */
  name?: string;
}

const fmtSize = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

/** 拖曳上傳區。拖進來時框線變珊瑚紅並微微放大。 */
export const Upload = React.forwardRef<HTMLInputElement, UploadProps>(function Upload(
  { accept, multiple, disabled, title, hint, onChange, showList = true, name, className, ...rest },
  ref
) {
  const [drag, setDrag] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const take = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    const next = multiple ? arr : arr.slice(0, 1);
    setFiles(next);
    onChange?.(next);
  };
  const over = (e: React.DragEvent) => { if (disabled) return; e.preventDefault(); setDrag(true); };
  return (
    <div className={cx('a-upload-wrap', className)} {...rest}>
      <label
        className={cx('a-upload', drag && 'is-drag')}
        aria-disabled={disabled || undefined}
        onDragEnter={over}
        onDragOver={over}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrag(false); }}
        onDrop={e => { e.preventDefault(); setDrag(false); if (!disabled) take(e.dataTransfer.files); }}
      >
        <input ref={ref} type="file" name={name} accept={accept} multiple={multiple} disabled={disabled} onChange={e => take(e.target.files)} />
        <span className="a-upload__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></svg>
        </span>
        <span className="a-upload__title">{title ?? <>把檔案拖到這裡，或 <b>點擊選擇</b></>}</span>
        {hint != null && <span className="a-upload__hint">{hint}</span>}
      </label>
      {showList && files.length > 0 && (
        <ul className="a-upload-list">
          {files.map((f, i) => <li key={f.name + i}><span>{f.name}</span><small>{fmtSize(f.size)}</small></li>)}
        </ul>
      )}
    </div>
  );
});
