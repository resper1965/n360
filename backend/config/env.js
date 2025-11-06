/**
 * Environment Variables Validation
 * Valida e tipifica todas as variáveis de ambiente
 */

const { z } = require('zod');

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL deve ser uma URL válida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY é obrigatório'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY é obrigatório'),
  
  // Wazuh
  WAZUH_API_URL: z.string().url('WAZUH_API_URL deve ser uma URL válida'),
  WAZUH_USERNAME: z.string().min(1, 'WAZUH_USERNAME é obrigatório'),
  WAZUH_PASSWORD: z.string().min(1, 'WAZUH_PASSWORD é obrigatório'),
  WAZUH_CA_CERT: z.string().optional(),
  
  // Shuffle
  SHUFFLE_API_URL: z.string().url('SHUFFLE_API_URL deve ser uma URL válida'),
  
  // Zabbix
  ZABBIX_API_URL: z.string().url('ZABBIX_API_URL deve ser uma URL válida'),
  ZABBIX_USERNAME: z.string().min(1, 'ZABBIX_USERNAME é obrigatório'),
  ZABBIX_PASSWORD: z.string().min(1, 'ZABBIX_PASSWORD é obrigatório'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('[Config] ✅ Variáveis de ambiente validadas com sucesso');
    return env;
  } catch (error) {
    console.error('[Config] ❌ Erro na validação de variáveis de ambiente:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    console.error('\n💡 Verifique o arquivo .env e certifique-se de que todas as variáveis obrigatórias estão definidas.');
    process.exit(1);
  }
}

module.exports = validateEnv();



