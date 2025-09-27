#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * Проверяет наличие всех необходимых переменных окружения
 */

const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
  'REACT_APP_BOT_TOKEN',
  'REACT_APP_APP_NAME',
  'REACT_APP_COMPANY_NAME',
  'REACT_APP_SUPPORT_USERNAME'
];

console.log('🔍 Проверка переменных окружения...\n');

let allGood = true;
const issues = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: ОТСУТСТВУЕТ`);
    allGood = false;
    issues.push(varName);
  } else if (value.startsWith('@')) {
    console.log(`⚠️  ${varName}: ССЫЛАЕТСЯ НА СЕКРЕТ (${value}) - ОШИБКА!`);
    allGood = false;
    issues.push(`${varName} (secret reference)`);
  } else {
    const displayValue = varName.includes('KEY') || varName.includes('TOKEN') ? 
      value.substring(0, 10) + '...' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Все переменные окружения настроены правильно!');
  process.exit(0);
} else {
  console.log(`❌ Найдены проблемы с переменными: ${issues.length}`);
  console.log('\n📋 Что нужно исправить:');
  
  issues.forEach(issue => {
    if (issue.includes('secret reference')) {
      console.log(`   • ${issue.split(' ')[0]}: Заменить ссылку на секрет прямым значением`);
    } else {
      console.log(`   • ${issue}: Добавить переменную`);
    }
  });
  
  console.log('\n🔧 Исправление в Vercel:');
  console.log('   1. Settings → Environment Variables');
  console.log('   2. Удалить переменные со значениями @secret_name');
  console.log('   3. Добавить переменные с прямыми значениями');
  console.log('   4. Redeploy проект');
  
  process.exit(1);
}