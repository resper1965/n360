/**
 * Seed Demo Data for N360 GRC
 * Popula o banco com dados realisticos para demonstração
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de dados demo...\n');

  // ============================================
  // 1. ASSETS (10)
  // ============================================
  console.log('📦 Criando 10 Assets...');
  
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-WEB-001',
        name: 'Servidor Web Principal',
        type: 'Server',
        description: 'Servidor web Apache hospedando portal corporativo',
        confidentiality: 3,
        integrity: 4,
        availability: 5,
        business_impact: 4,
        owner: 'TI - Infraestrutura',
        location: 'Datacenter AWS São Paulo',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-DB-001',
        name: 'Banco de Dados PostgreSQL',
        type: 'Database',
        description: 'PostgreSQL com dados de clientes e transações',
        confidentiality: 5,
        integrity: 5,
        availability: 5,
        business_impact: 5,
        owner: 'TI - DBA',
        location: 'Datacenter AWS São Paulo',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-APP-001',
        name: 'Aplicação CRM',
        type: 'Application',
        description: 'Sistema CRM Salesforce integrado',
        confidentiality: 4,
        integrity: 4,
        availability: 4,
        business_impact: 4,
        owner: 'Comercial',
        location: 'Cloud Salesforce',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-NET-001',
        name: 'Firewall Corporativo',
        type: 'Network Device',
        description: 'Palo Alto Networks PA-5200 Series',
        confidentiality: 3,
        integrity: 5,
        availability: 5,
        business_impact: 5,
        owner: 'TI - Segurança',
        location: 'Datacenter On-Premise',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-DATA-001',
        name: 'Base de Dados de Clientes',
        type: 'Data',
        description: 'Informações PII de 50.000 clientes (LGPD)',
        confidentiality: 5,
        integrity: 5,
        availability: 4,
        business_impact: 5,
        owner: 'Compliance Officer',
        location: 'Banco de Dados PostgreSQL',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-WS-001',
        name: 'Workstation CEO',
        type: 'Workstation',
        description: 'MacBook Pro M3 - CEO',
        confidentiality: 4,
        integrity: 3,
        availability: 3,
        business_impact: 3,
        owner: 'CEO',
        location: 'Escritório São Paulo',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-API-001',
        name: 'API Gateway',
        type: 'Service',
        description: 'Kong API Gateway para microserviços',
        confidentiality: 3,
        integrity: 4,
        availability: 5,
        business_impact: 4,
        owner: 'TI - DevOps',
        location: 'Kubernetes AWS EKS',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-MAIL-001',
        name: 'Servidor de Email',
        type: 'Service',
        description: 'Microsoft Exchange Online',
        confidentiality: 4,
        integrity: 4,
        availability: 4,
        business_impact: 4,
        owner: 'TI - Infraestrutura',
        location: 'Microsoft 365',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-BACKUP-001',
        name: 'Sistema de Backup',
        type: 'Service',
        description: 'Veeam Backup & Replication',
        confidentiality: 5,
        integrity: 5,
        availability: 4,
        business_impact: 5,
        owner: 'TI - Infraestrutura',
        location: 'Datacenter AWS + S3',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.asset.create({
      data: {
        asset_code: 'ASSET-VPN-001',
        name: 'VPN Corporativa',
        type: 'Network Device',
        description: 'OpenVPN Access Server',
        confidentiality: 4,
        integrity: 5,
        availability: 4,
        business_impact: 4,
        owner: 'TI - Segurança',
        location: 'AWS EC2',
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    })
  ]);
  console.log(`✅ ${assets.length} Assets criados\n`);

  // ============================================
  // 2. THREATS (15)
  // ============================================
  console.log('☠️  Criando 15 Threats...');
  
  const threats = await Promise.all([
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-001',
        name: 'Ransomware Attack',
        description: 'Ataque de ransomware que criptografa dados e exige resgate',
        category: 'Malware',
        likelihood_score: 4,
        attack_vector: 'Email phishing, Remote Desktop Protocol (RDP)',
        mitre_attack_id: 'T1486',
        tags: ['ransomware', 'encryption', 'extortion'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-002',
        name: 'Phishing Campaign',
        description: 'Campanha de phishing direcionada a funcionários',
        category: 'Social Engineering',
        likelihood_score: 5,
        attack_vector: 'Email malicioso com link ou anexo',
        mitre_attack_id: 'T1566',
        tags: ['phishing', 'social-engineering', 'credentials'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-003',
        name: 'DDoS Attack',
        description: 'Ataque de negação de serviço distribuído',
        category: 'Network Attack',
        likelihood_score: 3,
        attack_vector: 'Botnet, amplification attacks',
        mitre_attack_id: 'T1498',
        tags: ['ddos', 'availability', 'botnet'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-004',
        name: 'SQL Injection',
        description: 'Injeção de código SQL malicioso em inputs não sanitizados',
        category: 'Network Attack',
        likelihood_score: 3,
        attack_vector: 'Web application inputs, APIs',
        mitre_attack_id: 'T1190',
        cwe_mapping: 'CWE-89',
        tags: ['sql-injection', 'web', 'database'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-005',
        name: 'Insider Threat - Data Exfiltration',
        description: 'Funcionário interno exfiltrando dados confidenciais',
        category: 'Insider Threat',
        likelihood_score: 2,
        attack_vector: 'USB drives, cloud storage, email',
        mitre_attack_id: 'T1567',
        tags: ['insider', 'data-leak', 'exfiltration'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-006',
        name: 'Supply Chain Attack',
        description: 'Comprometimento de fornecedor ou biblioteca de terceiros',
        category: 'Supply Chain',
        likelihood_score: 2,
        attack_vector: 'Compromised software updates, dependencies',
        mitre_attack_id: 'T1195',
        tags: ['supply-chain', 'third-party', 'software'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-007',
        name: 'Zero-Day Exploit',
        description: 'Exploração de vulnerabilidade desconhecida',
        category: 'Malware',
        likelihood_score: 2,
        attack_vector: 'Software vulnerabilities, unpatched systems',
        mitre_attack_id: 'T1203',
        tags: ['zero-day', 'exploit', 'vulnerability'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-008',
        name: 'Credential Stuffing',
        description: 'Uso de credenciais vazadas para acesso não autorizado',
        category: 'Network Attack',
        likelihood_score: 4,
        attack_vector: 'Leaked credentials from breaches',
        mitre_attack_id: 'T1110',
        tags: ['credentials', 'brute-force', 'account-takeover'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-009',
        name: 'Physical Theft',
        description: 'Roubo físico de equipamentos ou mídia',
        category: 'Physical Security',
        likelihood_score: 2,
        attack_vector: 'Unauthorized physical access',
        mitre_attack_id: 'T1200',
        tags: ['physical', 'theft', 'hardware'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-010',
        name: 'Man-in-the-Middle (MITM)',
        description: 'Interceptação de comunicação entre dois pontos',
        category: 'Network Attack',
        likelihood_score: 2,
        attack_vector: 'Unencrypted traffic, rogue wifi',
        mitre_attack_id: 'T1557',
        tags: ['mitm', 'interception', 'network'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-011',
        name: 'Business Email Compromise (BEC)',
        description: 'Comprometimento de email corporativo para fraude',
        category: 'Social Engineering',
        likelihood_score: 3,
        attack_vector: 'Email spoofing, account takeover',
        mitre_attack_id: 'T1534',
        tags: ['bec', 'fraud', 'email'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-012',
        name: 'Cryptojacking',
        description: 'Uso não autorizado de recursos para mineração de criptomoedas',
        category: 'Malware',
        likelihood_score: 2,
        attack_vector: 'Malicious scripts, compromised websites',
        mitre_attack_id: 'T1496',
        tags: ['cryptojacking', 'crypto', 'resource-abuse'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-013',
        name: 'APT (Advanced Persistent Threat)',
        description: 'Ameaça persistente avançada com múltiplas fases',
        category: 'Malware',
        likelihood_score: 1,
        attack_vector: 'Spear phishing, zero-days, lateral movement',
        mitre_attack_id: 'TA0001',
        tags: ['apt', 'targeted', 'persistent'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-014',
        name: 'Natural Disaster - Fire',
        description: 'Incêndio em datacenter ou escritório',
        category: 'Natural Disaster',
        likelihood_score: 1,
        attack_vector: 'Environmental',
        tags: ['fire', 'disaster', 'physical'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    }),
    prisma.threat.create({
      data: {
        threat_code: 'THREAT-2025-015',
        name: 'Human Error - Misconfiguration',
        description: 'Erro humano na configuração de sistemas críticos',
        category: 'Human Error',
        likelihood_score: 4,
        attack_vector: 'Administrative mistakes, lack of training',
        tags: ['human-error', 'misconfiguration', 'operational'],
        org_id: '00000000-0000-0000-0000-000000000000'
      }
    })
  ]);
  console.log(`✅ ${threats.length} Threats criados\n`);

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   - ${assets.length} Assets`);
  console.log(`   - ${threats.length} Threats`);
  console.log('\n🚀 Próximo: Continuar seed com Vulnerabilities, Risks, Incidents, Controls\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

