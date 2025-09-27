#!/usr/bin/env node

/**
 * Скрипт проверки доступности статических ресурсов
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const requiredAssets = [
  'icon-search.png',
  'icon-filter.png', 
  'Avito_logo.svg',
  'inc_icon.png',
  'favicon.ico',
  'placeholder-product.svg'
];

console.log('🔍 Проверка статических ресурсов...\n');

let allGood = true;

requiredAssets.forEach(asset => {
  const assetPath = path.join(publicDir, asset);
  const exists = fs.existsSync(assetPath);
  
  if (exists) {
    const stats = fs.statSync(assetPath);
    const size = (stats.size / 1024).toFixed(1);
    console.log(`✅ ${asset} (${size} KB)`);
  } else {
    console.log(`❌ ${asset} - ОТСУТСТВУЕТ`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Все статические ресурсы найдены!');
  console.log('\n📋 Следующие шаги:');
  console.log('   1. npm run build');
  console.log('   2. Деплой на Vercel');
  console.log('   3. Проверить работу иконок в браузере');
  process.exit(0);
} else {
  console.log('❌ Некоторые ресурсы отсутствуют!');
  console.log('\n🔧 Что нужно сделать:');
  console.log('   1. Добавить недостающие файлы в папку public/');
  console.log('   2. Проверить пути в коде');
  console.log('   3. Повторить проверку: npm run check-assets');
  process.exit(1);
}