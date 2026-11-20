import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider, Button, Tabs, Pagination, Dropdown, Modal, Drawer, Toaster, toast, notify, CommandPalette,
  Input, Field, Switch, Checkbox, Segmented, Select, Slider, InputNumber, OtpInput, Autocomplete, Cascader, Transfer, TagInput, Rating,
  Card, Tag, Badge, Avatar, Collapse, DataTable, Calendar, RangePicker, Statistic, StatRow, Alert, Progress, Steps, Tooltip, Carousel,
} from 'aicde-ui';
import 'aicde-ui/style.css';

const THEMES = ['default', 'clean', 'paper', 'ink', 'soft', 'riso', 'brutal', 'stitch', 'ticket', 'block', 'blueprint', 'clinical', 'cute', 'finance', 'editorial'] as const;
const NAMES: Record<string, string> = { default: '預設・紙雕分層', clean: '簡潔', paper: '暖紙雕', ink: '混合媒材', soft: '柔光立體', riso: '網點絲印', brutal: '新粗野', stitch: '手縫布藝', ticket: '水彩票根', block: '啞光積木', blueprint: '藍圖線稿', clinical: '醫療', cute: '可愛', finance: '金融', editorial: '編輯' };
function Swatch({ t }: { t: (typeof THEMES)[number] }) {
  return (
    <ThemeProvider theme={t} mode={location.search.includes("dark") ? "dark" : "light"} className="sw">
      <h2>{NAMES[t]} <small>{t}</small></h2>
      <div className="row"><Button variant="primary">主要</Button><Button variant="secondary">次要</Button><Button variant="outline">外框</Button><Button variant="ghost">文字</Button></div>
      <div className="row"><Input placeholder="輸入框" style={{ flex: 1 }} /><Switch defaultChecked /></div>
      <div className="row"><Tag>設計</Tag><Tag color="coral">熱門</Tag><Tag color="navy">精選</Tag><Checkbox defaultChecked>勾選</Checkbox></div>
      <Card interactive cover={<img src="cover.webp" alt="" />} eyebrow="案例" title="暖白分層剪紙">用少量紙片建立遠近層次。</Card>
      <Tabs items={[{ key: 'a', label: '總覽', children: '共有 59 個元件。' }, { key: 'b', label: '動畫', children: '200ms ease-out。' }]} />
      <Segmented options={['日', '週', '月']} />
      <Progress value={64} />
      <Alert type="error" title="過敏提醒">病患對盤尼西林過敏。</Alert>
      <StatRow><Statistic label="總資產" value={1284023.5} decimals={2} prefix="$" animate={false} trend={{ direction: 'up', value: '2.4%' }} /></StatRow>
    </ThemeProvider>
  );
}
type Row = { id: string; name: string; owner: string; score: number };
const ROWS: Row[] = [
  { id: 'a', name: '官網改版', owner: '小林', score: 82 },
  { id: 'b', name: '會員系統', owner: '阿哲', score: 64 },
  { id: 'c', name: '品牌手冊', owner: 'Mia', score: 91 },
];

function App() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('default');
  if (location.hash === '#gallery') return <div className="gallery">{THEMES.map((t) => <Swatch key={t} t={t} />)}</div>;
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [page, setPage] = useState(1);
  const [log, setLog] = useState('');
  return (
    <ThemeProvider theme={theme} mode="light" style={{ minHeight: '100vh', padding: 32, background: 'var(--a-surface-2)' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <h1 style={{ margin: 0, font: '800 24px var(--a-font)', color: 'var(--a-ink)' }}>aicde-ui 範例</h1>
        <Segmented id="theme" options={[...THEMES]} value={theme} onChange={(v) => setTheme(v as typeof theme)} />
        <output id="log">{log}</output>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 24 }}>
        <section className="box">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="primary" id="b-modal" onClick={() => setModal(true)}>開啟對話框</Button>
            <Button variant="secondary" id="b-drawer" onClick={() => setDrawer(true)}>抽屜</Button>
            <Button variant="outline" id="b-toast" onClick={() => toast('已儲存', { type: 'success' })}>Toast</Button>
            <Button variant="ghost" id="b-notify" onClick={() => notify({ title: '新留言', text: 'Mia 回覆了你' })}>通知</Button>
            <Button variant="outline" id="b-cmd" onClick={() => setCmd(true)}>⌘K</Button>
            <Dropdown trigger={<Button variant="outline" id="b-dd">更多</Button>} items={[{ key: 'edit', label: '編輯' }, { key: 'del', label: '刪除', danger: true }]} onSelect={(k) => setLog('dropdown:' + k)} />
          </div>
          <Tabs id="tabs" items={[{ key: 'a', label: '總覽', children: '共有 59 個元件。' }, { key: 'b', label: '動畫', children: '預設 200ms ease-out。' }, { key: 'c', label: '紀錄', children: '今天 15:30 更新。' }]} />
          <Pagination id="pg" total={12} current={page} onChange={setPage} />
          <Steps items={[{ title: '填寫' }, { title: '確認' }, { title: '完成' }]} current={1} />
        </section>
        <section className="box">
          <Field label="專案名稱"><Input id="name" placeholder="例如：官網改版" /></Field>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Switch id="sw" defaultChecked onChange={(c) => setLog('switch:' + c)}>通知</Switch>
            <Checkbox defaultChecked>同意</Checkbox>
            <Tooltip title="提示文字"><Button size="sm" variant="outline">提示</Button></Tooltip>
          </div>
          <Select options={['台北', '台中', '高雄']} />
          <Slider defaultValue={40} unit="%" showValue />
          <InputNumber id="num" defaultValue={2} min={0} max={3} />
          <OtpInput id="otp" length={6} onComplete={(c) => setLog('otp:' + c)} />
          <Autocomplete id="ac" options={['Taipei 台北', 'Tainan 台南', 'Taichung 台中']} placeholder="搜尋城市" onSelect={(v: string) => setLog('ac:' + v)} />
          <Field label="地區" as="div"><Cascader id="cas" options={[{ label: '台灣', value: 'tw', children: [{ label: '台北', value: 'tpe', children: [{ label: '信義區', value: 'xy' }] }] }]} onChange={(p) => setLog('cas:' + p.join('/'))} /></Field>
          <TagInput id="ti" defaultValue={['設計']} onChange={(t) => setLog('tags:' + t.join(','))} />
          <Rating defaultValue={3} />
        </section>
        <section className="box">
          <Card id="card" interactive cover={<img src="cover.webp" alt="" />} eyebrow="案例" title="暖白分層剪紙" footer={<Tag color="coral">熱門</Tag>}>用少量紙片建立近、中、遠景。</Card>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Tag>設計</Tag><Tag color="navy">精選</Tag><Tag closable>可關閉</Tag>
            <Badge count={120}><Avatar name="林" /></Badge>
          </div>
          <Alert type="success" title="已發布">網站已上線。</Alert>
          <Progress value={64} />
          <StatRow><Statistic label="營收" value={128400} prefix="$" trend={{ direction: 'up', value: '12%' }} /><Statistic label="訂單" value={312} /></StatRow>
        </section>
        <section className="box">
          <DataTable<Row> id="dt" rowKey="id" searchable selectable dataSource={ROWS}
            columns={[{ key: 'name', title: '專案', sortable: 'text' }, { key: 'owner', title: '負責人' }, { key: 'score', title: '分數', align: 'right', sortable: 'number' }]} />
          <Collapse items={[{ key: '1', title: '如何安裝？', content: 'npm i aicde-ui' }, { key: '2', title: '支援深色？', content: '支援。' }]} accordion />
          <Transfer id="tf" items={['首頁', '關於', '服務', '聯絡']} defaultValue={['首頁']} onChange={(v) => setLog('tf:' + v.join(','))} />
        </section>
        <section className="box">
          <Calendar id="cal" defaultValue="2026-11-20" onChange={(d) => setLog('cal:' + d)} />
          <RangePicker id="rp" defaultMonth="2026-11" onChange={(r) => setLog('rp:' + r.join('~'))} />
          <Carousel><img src="cover.webp" alt="1" /><img src="cover.webp" alt="2" /></Carousel>
        </section>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="刪除專案？" footer={<><Button variant="ghost" onClick={() => setModal(false)}>取消</Button><Button variant="primary" id="m-ok" onClick={() => { setModal(false); setLog('modal:ok'); }}>刪除</Button></>}>這個動作無法復原。</Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="設定">抽屜內容</Drawer>
      <CommandPalette open={cmd} onOpenChange={setCmd} hotkey groups={[{ label: '頁面', items: [{ key: 'home', label: '前往首頁', onSelect: () => setLog('cmd:home') }, { key: 'set', label: '開啟設定', onSelect: () => setLog('cmd:set') }] }]} />
      <Toaster />
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
