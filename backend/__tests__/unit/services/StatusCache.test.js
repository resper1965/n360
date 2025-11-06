/**
 * StatusCache Service Tests
 * Testa cache thread-safe de status das aplicações
 */

const StatusCache = require('../../../services/StatusCache');

describe('StatusCache', () => {
  beforeEach(() => {
    // Limpar cache antes de cada teste
    StatusCache.clear();
  });

  describe('set() and get()', () => {
    test('deve armazenar e recuperar status', () => {
      // Arrange
      const status = {
        online: true,
        version: '4.9.0',
        url: 'https://wazuh.test',
      };
      
      // Act
      StatusCache.set('wazuh', status);
      const result = StatusCache.get('wazuh');
      
      // Assert
      expect(result).toMatchObject(status);
      expect(result.lastCheck).toBeDefined();
    });

    test('deve retornar undefined para chave inexistente', () => {
      // Act
      const result = StatusCache.get('inexistente');
      
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getAll()', () => {
    test('deve retornar todos os status armazenados', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: false });
      
      // Act
      const all = StatusCache.getAll();
      
      // Assert
      expect(Object.keys(all)).toHaveLength(2);
      expect(all.wazuh).toBeDefined();
      expect(all.zabbix).toBeDefined();
    });

    test('deve retornar objeto vazio quando cache vazio', () => {
      // Act
      const all = StatusCache.getAll();
      
      // Assert
      expect(all).toEqual({});
    });
  });

  describe('isOnline()', () => {
    test('deve retornar true para aplicação online', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      
      // Act & Assert
      expect(StatusCache.isOnline('wazuh')).toBe(true);
    });

    test('deve retornar false para aplicação offline', () => {
      // Arrange
      StatusCache.set('wazuh', { online: false });
      
      // Act & Assert
      expect(StatusCache.isOnline('wazuh')).toBe(false);
    });

    test('deve retornar false para aplicação inexistente', () => {
      // Act & Assert
      expect(StatusCache.isOnline('inexistente')).toBe(false);
    });
  });

  describe('countOnline() and countTotal()', () => {
    test('deve contar aplicações online corretamente', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: true });
      StatusCache.set('shuffle', { online: false });
      
      // Act & Assert
      expect(StatusCache.countOnline()).toBe(2);
      expect(StatusCache.countTotal()).toBe(3);
    });
  });

  describe('getHealthPercentage()', () => {
    test('deve calcular percentage corretamente', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: true });
      StatusCache.set('shuffle', { online: false });
      
      // Act
      const percentage = StatusCache.getHealthPercentage();
      
      // Assert
      expect(percentage).toBe(67); // 2/3 = 66.66% → 67%
    });

    test('deve retornar 0 quando cache vazio', () => {
      // Act & Assert
      expect(StatusCache.getHealthPercentage()).toBe(0);
    });

    test('deve retornar 100 quando todos online', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: true });
      
      // Act & Assert
      expect(StatusCache.getHealthPercentage()).toBe(100);
    });
  });

  describe('getSummary()', () => {
    test('deve retornar summary completo', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: false });
      
      // Act
      const summary = StatusCache.getSummary();
      
      // Assert
      expect(summary).toMatchObject({
        overall: 'degraded',
        totalApps: 2,
        onlineApps: 1,
        offlineApps: 1,
        healthPercentage: 50,
      });
      expect(summary.lastUpdate).toBeDefined();
    });

    test('deve marcar overall como online quando todos online', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: true });
      
      // Act
      const summary = StatusCache.getSummary();
      
      // Assert
      expect(summary.overall).toBe('online');
    });
  });

  describe('clear()', () => {
    test('deve limpar todo o cache', () => {
      // Arrange
      StatusCache.set('wazuh', { online: true });
      StatusCache.set('zabbix', { online: true });
      
      // Act
      StatusCache.clear();
      
      // Assert
      expect(StatusCache.countTotal()).toBe(0);
      expect(StatusCache.getAll()).toEqual({});
    });
  });

  describe('Thread Safety', () => {
    test('deve suportar múltiplas escritas simultâneas', async () => {
      // Arrange
      const apps = ['wazuh', 'zabbix', 'shuffle', 'supabase'];
      
      // Act: Simular escritas concorrentes
      await Promise.all(
        apps.map(app => 
          Promise.resolve(StatusCache.set(app, { online: true }))
        )
      );
      
      // Assert
      expect(StatusCache.countTotal()).toBe(4);
      expect(StatusCache.countOnline()).toBe(4);
    });
  });
});


