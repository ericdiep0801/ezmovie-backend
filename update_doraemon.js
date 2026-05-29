const fs = require('fs');

const file = 'c:\\Study NestJS\\EZMOVIE\\backend\\src\\cartoon\\cartoon.service.ts';
let content = fs.readFileSync(file, 'utf8');

const newSlugs = [
  'doraemon-tuyen-tap-moi-nhat',
  'doraemon-nobita-va-cuoc-phieu-luu-vao-the-gioi-trong-tranh',
  'doraemon-nobita-tham-hiem-vung-dat-moi-peko-va-5-nha-tham-hiem',
  'doraemon-nobita-va-nhung-dung-si-co-canh',
  'doraemon-nobita-va-chuyen-tau-toc-hanh-ngan-ha',
  'doraemon-nobita-va-me-cung-thiec',
  'doraemon-nobita-du-hanh-bien-phuong-nam',
  'doraemon-nobita-va-cuoc-phieu-luu-o-thanh-pho-day-cot',
  'doraemon-nobita-va-nhung-phap-su-gio-bi-an',
  'doraemon-nobita-va-hon-dao-dieu-ki-cuoc-phieu-luu-cua-loai-thu',
  'doraemon-nobita-va-truyen-thuyet-vua-mat-troi',
  'doraemon-nobita-vu-tru-phieu-luu-ki',
  'doraemon-nobita-va-ba-chang-hiep-si-mong-mo',
  'doraemon-nobita-va-vuong-quoc-tren-may',
  'doraemon-nobita-va-vuong-quoc-robot',
  'doraemon-nobita-o-vuong-quoc-cho-meo',
  'doraemon-nobita-o-xu-so-nghin-le-mot-dem',
  'doraemon-nobita-va-hanh-tinh-muong-thu',
  'doraemon-nobita-va-nuoc-nhat-thoi-nguyen-thuy-1989',
  'doraemon-nobita-tay-du-ki',
  'doraemon-nobita-va-hiep-si-rong',
  'doraemon-nobita-va-binh-doan-nguoi-sat-1986',
  'doraemon-nobita-va-cuoc-chien-vu-tru',
  'doraemon-nobita-va-chuyen-phieu-luu-vao-xu-quy-1984',
  'doraemon-nobita-va-lau-dai-duoi-day-bien',
  'doraemon-nobita-tham-hiem-vung-dat-moi',
  'doraemon-nobita-va-lich-su-khai-pha-vu-tru-1981',
  'doraemon-chu-khung-long-cua-nobita-1980',
  'doraemon-nobita-va-ban-giao-huong-dia-cau',
  'doraemon-nobita-va-vung-dat-ly-tuong-tren-bau-troi',
  'doraemon-nobita-va-cuoc-chien-vu-tru-ti-hon',
  'doraemon-doi-ban-than-2',
  'doraemon-nobita-va-nhung-ban-khung-long-moi',
  'doraemon-nobita-va-mat-trang-phieu-luu-ky',
  'doraemon-nobita-va-dao-giau-vang',
  'doraemon-nobita-va-chuyen-tham-hiem-nam-cuc-kachi-kochi',
  'doraemon-nobita-va-nuoc-nhat-thoi-nguyen-thuy',
  'doraemon-nobita-va-nhung-hiep-si-khong-gian',
  'doraemon-doi-ban-than',
  'doraemon-nobita-va-vien-bao-tang-bao-boi',
  'doraemon-nobita-va-binh-doan-nguoi-sat',
  'doraemon-nobita-va-cuoc-dai-thuy-chien-o-xu-so-nguoi-ca',
  'doraemon-nobita-va-lich-su-khai-pha-vu-tru',
  'doraemon-nobita-va-nguoi-khong-lo-xanh',
  'doraemon-nobita-va-chuyen-phieu-luu-vao-xu-quy',
  'doraemon-chu-khung-long-cua-nobita',
  'doraemon-tuyen-tap-phim-giang-sinh'
];

const oldSlugs = [
  'doraemon-tuyen-tap-moi-nhat',
  'doraemon-doi-ban-than',
  'doraemon-doi-ban-than-2',
  'doraemon-nobita-va-nhung-hiep-si-khong-gian',
  'doraemon-nobita-va-nhung-phap-su-gio-bi-an',
  'doraemon-nobita-va-nhung-ban-khung-long-moi',
  'doraemon-nobita-va-cuoc-chien-vu-tru-ti-hon',
  'doraemon-nobita-va-vung-dat-ly-tuong-tren-bau-troi',
  'doraemon-nobita-va-vien-bao-tang-bao-boi',
  'doraemon-nobita-va-mat-trang-phieu-luu-ky',
  'doraemon-nobita-va-ban-giao-huong-dia-cau',
  'doraemon-nobita-va-binh-doan-nguoi-sat',
  'doraemon-nobita-va-cuoc-dai-thuy-chien-o-xu-so-nguoi-ca',
  'doraemon-nobita-va-chuyen-tham-hiem-nam-cuc-kachi-kochi',
  'doraemon-nobita-va-cuoc-phieu-luu-vao-the-gioi-trong-tranh',
  'doraemon-the-movie-nobita-and-the-green-giant-legend',
  'doraemon-nobita-tham-hiem-vung-dat-moi',
  'doraemon-the-movie-nobitas-new-great-adventure-into-the-underworld'
];

const merged = Array.from(new Set([...oldSlugs, ...newSlugs]));
const newArrayString = "[\n" + merged.map(s => `        '${s}'`).join(',\n') + "\n      ],";

const matchRegex = /ophimSlugs:\s*\[[\s\S]*?\],/;
content = content.replace(matchRegex, `ophimSlugs: ${newArrayString}`);
fs.writeFileSync(file, content);
console.log("Updated successfully!");
