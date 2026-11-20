/* 15 個元件主題。css：data-theme-style 的值（預設主題為空字串）；flutter：AicdeThemeStyle 的名稱 */
window.THEMES = [
  { css:'',          flutter:'paperCut',  name:'紙雕分層', en:'Paper Cut', tagline:'預設主題。元件像一層層剪紙疊起來，底部有紙邊，按下去會沉進紙裡。', fit:['品牌官網','一般產品','行銷頁'], traits:['底部紙邊','按下下沉','中等圓角'] },
  { css:'clean',     flutter:'clean',     name:'簡潔', en:'Clean', tagline:'拿掉所有裝飾，只留下顏色、圓角和細線。最不搶戲，適合內容本身就很重的產品。', fit:['SaaS 後台','工具型產品','內部系統'], traits:['無陰影','細線外框','輕微縮放回饋'] },
  { css:'paper',     flutter:'paper',     name:'暖紙雕', en:'Warm Paper', tagline:'紙雕分層的暖色版，米色紙張和奶油色底，看起來像手工印刷品。', fit:['生活風格品牌','文創','餐飲'], traits:['米色紙張','暖色紙邊','手作感'] },
  { css:'ink',       flutter:'ink',       name:'混合媒材', en:'Mixed Media', tagline:'墨線描邊、手繪般不規則的圓角、實心位移陰影，像貼在手帳裡的剪貼。', fit:['創意工作室','教育','兒童品牌'], traits:['2px 墨線','不規則圓角','實心位移陰影'] },
  { css:'soft',      flutter:'soft',      name:'柔光立體', en:'Soft 3D', tagline:'膠囊形按鈕、柔和陰影和一點光澤，像軟軟的塑膠按鍵。', fit:['消費型 App','健康','金融科技'], traits:['膠囊按鈕','柔和陰影','光澤漸層'] },
  { css:'riso',      flutter:'riso',      name:'網點絲印', en:'Riso Print', tagline:'半色調網點、深藍與珊瑚套色錯位，像獨立出版的孔版印刷。', fit:['獨立出版','活動海報','音樂'], traits:['網點材質','套色錯位','底線輸入框'] },
  { css:'brutal',    flutter:'brutal',    name:'新粗野', en:'Neo Brutal', tagline:'3px 粗黑線、完全直角、大位移陰影和等寬大寫字。直接、大聲、不修飾。', fit:['開發者工具','新創','作品集'], traits:['3px 粗線','直角','等寬大寫標籤'] },
  { css:'stitch',    flutter:'stitch',    name:'手縫布藝', en:'Stitched', tagline:'元件內側一圈車縫虛線，布料般的暖色底，像縫在帆布上的布章。', fit:['手作','親子','寵物'], traits:['車縫虛線','布料暖色','柔和陰影'] },
  { css:'ticket',    flutter:'ticket',    name:'水彩票根', en:'Watercolor Ticket', tagline:'按鈕兩側有打孔缺口、填色帶水彩暈染，像旅行時收集的票根。', fit:['旅遊','展覽','票務'], traits:['打孔缺口','水彩暈染','虛線撕線'] },
  { css:'block',     flutter:'block',     name:'啞光積木', en:'Matte Block', tagline:'厚實的底座加上倒角，左上亮右下暗，像一塊塊可以按的積木。', fit:['遊戲','兒童教育','玩具'], traits:['厚底座','倒角光影','按下下沉'] },
  { css:'blueprint', flutter:'blueprint', name:'藍圖線稿', en:'Blueprint', tagline:'細線外框、四角裁切標記、等寬大寫標籤，像工程圖或建築藍圖。', fit:['工程','建築','硬體產品'], traits:['1.5px 細線','裁切角標','幾乎直角'] },
  { css:'clinical',  flutter:'clinical',  name:'醫療', en:'Clinical', tagline:'深海藍主色、44px 點擊範圍、清楚的 focus 外框。冷靜、可信任、長輩也好按。', fit:['醫療院所','保險','政府服務'], traits:['44px 高度','清楚 focus','海藍主色'] },
  { css:'cute',      flutter:'cute',      name:'可愛', en:'Cute', tagline:'大圓角、貼紙般的白色描邊、滑過會輕輕彈跳。親切、活潑、有點調皮。', fit:['寵物','兒童','社群 App'], traits:['大圓角','貼紙描邊','彈跳動畫'] },
  { css:'finance',   flutter:'finance',   name:'金融', en:'Finance', tagline:'高密度、小圓角、等寬數字、深藍主色。資訊多也排得整齊。', fit:['交易平台','記帳','數據儀表板'], traits:['34px 高密度','等寬數字','深藍主色'] },
  { css:'editorial', flutter:'editorial', name:'編輯', en:'Editorial', tagline:'襯線標題、髮絲線、直角和墨色按鈕，像雜誌或報紙的版面。', fit:['媒體','部落格','出版'], traits:['襯線標題','髮絲線','墨色主按鈕'] }
];
THEMES.forEach(t => t.id = t.css || 'default');
