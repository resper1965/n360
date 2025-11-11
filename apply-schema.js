const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos no arquivo .env');
  process.exit(1);
}

if (typeof fetch !== 'function') {
  console.error('❌ Node.js 18+ é obrigatório para executar este script (fetch global ausente)');
  process.exit(1);
}

const pgExecuteUrl = new URL('/pg/execute', supabaseUrl).toString();

async function runStatement(query, index, total) {
  const response = await fetch(pgExecuteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      Prefer: 'tx=commit',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Erro no statement ${index + 1}/${total}:`, error);
    return;
  }

  console.log(`✅ Statement ${index + 1}/${total} executado`);
}

async function applySchema() {
  console.log('Aplicando schema no Supabase...');

  const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
  const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);

  console.log(`Total de statements: ${statements.length}`);

  for (let i = 0; i < statements.length; i++) {
    await runStatement(statements[i], i, statements.length);
  }

  console.log('Schema aplicado!');
}

applySchema().catch((error) => {
  console.error('❌ Erro ao aplicar schema:', error);
  process.exit(1);
});
