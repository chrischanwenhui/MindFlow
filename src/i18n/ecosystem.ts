import type { Language } from './index';
import type { EcosystemProductId } from '../data/ecosystemCatalog';

type ProductCopy = { status: string; description: string; action: string };
export type EcosystemCopy = {
  heading: string;
  introduction: string;
  browse: string;
  leavingNotice: string;
  compactHeading: string;
  compactDescription: string;
  cards: Record<EcosystemProductId, ProductCopy>;
};

/** Human-written discovery copy. Never advertise private software as an open demo. */
export const ecosystemCopy: Record<Language, EcosystemCopy> = {
  en: {
    heading: 'Try our other products',
    introduction: 'Discover more from Eirene Stack. Public apps and development projects are clearly identified.',
    browse: 'Explore all EireneOS products',
    leavingNotice: 'Links open in a new tab, so your MindFlow session stays on this page.',
    compactHeading: 'More from Eirene Stack',
    compactDescription: 'Explore other tools and works in progress.',
    cards: {
      cashFlow: { status: 'Public app', description: 'A local-first workspace to organise cash flow, upcoming bills and payment planning. Not financial advice.', action: 'Try Cash Flow' },
      advisorFlow: { status: 'Private pilot', description: 'Advisor servicing and planning workflows in development. Not open for general client use.', action: 'Explore Advisor Flow' },
      retailFlow: { status: 'Private prototype', description: 'Store execution, stock visibility and clearer team handovers. No public demo yet.', action: 'View Retail Flow overview' },
      eireneFall: { status: 'In development', description: 'Explore the progress of an interactive game world. No public game download yet.', action: 'View EireneFall progress' }
    }
  },
  zh: {
    heading: '探索我们的其他产品', introduction: '探索 Eirene Stack 的更多项目。我们会清楚标明公开应用与开发中的项目。',
    browse: '探索所有 EireneOS 产品', leavingNotice: '链接将在新标签页打开，MindFlow 页面会保留在当前标签页。',
    compactHeading: '探索更多 Eirene Stack 项目', compactDescription: '了解其他工具和开发中的项目。',
    cards: {
      cashFlow: { status: '公开应用', description: '用于整理现金流、账单和付款计划的本地优先工具。不提供财务建议。', action: '试用 Cash Flow' },
      advisorFlow: { status: '私人试点', description: '开发中的顾问客户服务与规划工作流程，尚未向普通客户开放。', action: '了解 Advisor Flow' },
      retailFlow: { status: '私人原型', description: '探索门店执行、库存可视化与团队交接；暂无公开演示。', action: '查看 Retail Flow 介绍' },
      eireneFall: { status: '开发中', description: '查看互动游戏世界的开发进度。尚无公开游戏下载。', action: '查看 EireneFall 进度' }
    }
  },
  ms: {
    heading: 'Cuba produk kami yang lain', introduction: 'Terokai lagi produk Eirene Stack. Aplikasi awam dan projek dalam pembangunan dilabel dengan jelas.',
    browse: 'Terokai semua produk EireneOS', leavingNotice: 'Pautan dibuka dalam tab baharu supaya sesi MindFlow anda kekal pada tab ini.',
    compactHeading: 'Lagi daripada Eirene Stack', compactDescription: 'Terokai alat lain dan projek dalam pembangunan.',
    cards: {
      cashFlow: { status: 'Aplikasi awam', description: 'Ruang kerja setempat untuk menyusun aliran tunai, bil dan perancangan bayaran. Bukan nasihat kewangan.', action: 'Cuba Cash Flow' },
      advisorFlow: { status: 'Rintis peribadi', description: 'Aliran kerja khidmat nasihat dalam pembangunan. Belum dibuka untuk pelanggan umum.', action: 'Terokai Advisor Flow' },
      retailFlow: { status: 'Prototaip peribadi', description: 'Pelaksanaan kedai, keterlihatan stok dan serah tugas. Tiada demo awam buat masa ini.', action: 'Lihat Retail Flow' },
      eireneFall: { status: 'Dalam pembangunan', description: 'Lihat perkembangan dunia permainan interaktif. Muat turun awam belum tersedia.', action: 'Lihat kemajuan EireneFall' }
    }
  },
  ja: {
    heading: '他の製品もお試しください', introduction: 'Eirene Stack の製品をご紹介します。公開アプリと開発中のプロジェクトを明確に区別しています。',
    browse: 'EireneOS の全製品を見る', leavingNotice: 'リンクは新しいタブで開き、MindFlow の画面はそのまま残ります。',
    compactHeading: 'Eirene Stack のその他の製品', compactDescription: '他のツールや開発中のプロジェクトをご覧ください。',
    cards: {
      cashFlow: { status: '公開アプリ', description: '家計の収支、請求、支払い計画を整理するローカル優先ツールです。金融助言ではありません。', action: 'Cash Flow を試す' },
      advisorFlow: { status: '非公開パイロット', description: '開発中のアドバイザー業務支援。一般顧客向けには公開されていません。', action: 'Advisor Flow を知る' },
      retailFlow: { status: '非公開プロトタイプ', description: '店舗運営、在庫の可視化、引き継ぎを支援。公開デモはありません。', action: 'Retail Flow の概要を見る' },
      eireneFall: { status: '開発中', description: 'インタラクティブなゲーム世界の開発状況を紹介。一般向けダウンロードはありません。', action: 'EireneFall の進捗を見る' }
    }
  },
  ko: {
    heading: '다른 제품도 살펴보세요', introduction: 'Eirene Stack의 다른 제품을 만나보세요. 공개 앱과 개발 중인 프로젝트를 명확히 구분합니다.',
    browse: 'EireneOS 전체 제품 보기', leavingNotice: '링크는 새 탭에서 열리므로 MindFlow 화면은 현재 탭에 그대로 남습니다.',
    compactHeading: 'Eirene Stack의 다른 제품', compactDescription: '다른 도구와 개발 중인 프로젝트를 둘러보세요.',
    cards: {
      cashFlow: { status: '공개 앱', description: '현금 흐름, 청구서, 결제 계획을 정리하는 로컬 우선 도구입니다. 재무 자문은 아닙니다.', action: 'Cash Flow 사용해 보기' },
      advisorFlow: { status: '비공개 시범 운영', description: '개발 중인 자문 업무 도구로 일반 고객에게 공개되지 않았습니다.', action: 'Advisor Flow 알아보기' },
      retailFlow: { status: '비공개 프로토타입', description: '매장 운영, 재고 현황과 인수인계를 돕는 프로젝트입니다. 공개 데모는 없습니다.', action: 'Retail Flow 소개 보기' },
      eireneFall: { status: '개발 중', description: '인터랙티브 게임 세계의 개발 현황을 확인하세요. 공개 다운로드는 아직 없습니다.', action: 'EireneFall 진행 상황 보기' }
    }
  },
  th: {
    heading: 'ลองสำรวจผลิตภัณฑ์อื่นของเรา', introduction: 'รู้จักโครงการอื่นของ Eirene Stack พร้อมระบุชัดเจนว่าโครงการใดเปิดให้ใช้หรือยังอยู่ระหว่างพัฒนา',
    browse: 'ดูผลิตภัณฑ์ EireneOS ทั้งหมด', leavingNotice: 'ลิงก์จะเปิดในแท็บใหม่ โดยหน้า MindFlow จะยังอยู่ในแท็บเดิม',
    compactHeading: 'ผลิตภัณฑ์อื่นจาก Eirene Stack', compactDescription: 'สำรวจเครื่องมือและโครงการที่กำลังพัฒนา',
    cards: {
      cashFlow: { status: 'แอปสาธารณะ', description: 'เครื่องมือที่เน้นการเก็บข้อมูลในเครื่องสำหรับจัดการกระแสเงินสด บิล และแผนชำระเงิน ไม่ใช่คำแนะนำทางการเงิน', action: 'ลองใช้ Cash Flow' },
      advisorFlow: { status: 'โครงการทดลองแบบส่วนตัว', description: 'ระบบงานที่ปรึกษาซึ่งยังพัฒนาอยู่ และยังไม่เปิดให้ลูกค้าทั่วไปใช้งาน', action: 'รู้จัก Advisor Flow' },
      retailFlow: { status: 'ต้นแบบส่วนตัว', description: 'แนวคิดด้านการดำเนินงานร้านค้า สินค้าคงคลัง และการส่งต่องาน ยังไม่มีเดโมสาธารณะ', action: 'ดูภาพรวม Retail Flow' },
      eireneFall: { status: 'กำลังพัฒนา', description: 'ติดตามความคืบหน้าของเกมโลกเสมือน ยังไม่มีเกมให้ดาวน์โหลดแบบสาธารณะ', action: 'ดูความคืบหน้า EireneFall' }
    }
  }
};
