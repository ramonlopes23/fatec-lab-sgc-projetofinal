#!/usr/bin/env node

/**
 * Script para limpar localStorage e validar estado inicial da app
 */

import fs from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'localStorage.json');

// Simular limpeza de localStorage
console.log('\n' + '='.repeat(60));
console.log('🧹 LIMPEZA DE DADOS LOCAIS');
console.log('='.repeat(60));

if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
    console.log('✓ localStorage.json removido');
} else {
    console.log('✓ Nenhum arquivo de localStorage encontrado');
}

console.log('\n✓ Estado local resetado');
console.log('\n📝 Próximos passos:');
console.log('1. Abra o navegador em http://localhost:5173 (ou a porta Vite)');
console.log('2. Acesse a página VerMapa');
console.log('3. Os cemitérios devem ser carregados automaticamente');
console.log('4. Selecione um cemitério no dropdown');
console.log('5. Clique em "Adicionar Quadra"');
console.log('6. Preencha o número (ex: 1) e descrição');
console.log('7. Clique em Salvar');
console.log('\n✨ A quadra deve ser criada com sucesso!\n');

console.log('📊 Estado do db.json:');
const dbPath = path.join(process.cwd(), 'db.json');
try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`  - Cemitérios: ${db.cemeteries?.length || 0}`);
    console.log(`  - Quadras (blocks): ${db.blocks?.length || 0}`);
    console.log(`  - Covas (graves): ${db.graves?.length || 0}`);
    console.log(`  - Sepultamentos: ${db.sepultamentos?.length || 0}`);
} catch (err) {
    console.error('Erro ao ler db.json:', err.message);
}

console.log('\n' + '='.repeat(60) + '\n');
