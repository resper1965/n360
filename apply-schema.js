const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://hyplrlakowbwntkidtcp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cGxybGFrb3did250a2lkdGNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NjkzMiwiZXhwIjoyMDc3ODUyOTMyfQ.IwPdJtuqXRHjiaC5GeGCGroWj0H6pzy-j45Bjb1h84w'
);

async function applySchema() {
  console.log('Aplicando schema no Supabase...');
  
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  
  // Split por ; e executar cada statement
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  
  console.log(`Total de statements: ${statements.length}`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        console.error(`❌ Erro no statement ${i + 1}:`, error.message);
      } else {
        console.log(`✅ Statement ${i + 1}/${statements.length} executado`);
      }
    } catch (e) {
      console.error(`❌ Erro:`, e.message);
    }
  }
  
  console.log('Schema aplicado!');
}

applySchema();
