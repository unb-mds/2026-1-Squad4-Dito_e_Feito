import { test, expect } from '@playwright/test';

test.describe('Dito e Feito Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock /api/dashboard-metrics
    await page.route('**/api/dashboard-metrics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fonte: 'arquivo_json',
          total_analisados: 1,
          media_global_coerencia: 85.0,
          partido_mais_coerente: {
            partido: 'PMOCK',
            media_coerencia: 85.0,
            total_senadores: 1,
          },
          metricas_por_partido: [
            {
              partido: 'PMOCK',
              media_coerencia: 85.0,
              total_senadores: 1,
            }
          ],
          senadores: [
            {
              id: '12345',
              nome: 'Senador Mock',
              partido: 'PMOCK',
              uf: 'MK',
              foto: '',
              score_coerencia: 85.0,
              total_scores: 10,
              pares_alinhados: 8,
              total_pares: 10,
              contagem_status: { Coerente: 8, Divergente: 2 },
              detalhes: []
            }
          ]
        })
      });
    });

    // Mock /api/senadores
    await page.route('**/api/senadores', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          dados: [
            { id: '12345', nome: 'Senador Mock', partido: 'PMOCK', uf: 'MK', foto: '' }
          ]
        })
      });
    });

    // Mock /api/deputados
    await page.route('**/api/deputados', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          dados: [
            { id: '54321', nome: 'Deputado Mock', partido: 'PMOCK', uf: 'MK', foto: '' }
          ]
        })
      });
    });
  });

  test('deve renderizar a página inicial com o título do app', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se a barra lateral com o título está presente
    const logo = page.locator('aside');
    await expect(logo).toContainText('Dito e Feito');
    await expect(logo).toContainText('Análise Política com IA');
  });

  test('deve navegar para a página de Políticos através da barra lateral', async ({ page }) => {
    await page.goto('/');
    
    // Clica no link "Políticos" na barra lateral
    await page.click('text=Políticos');
    
    // Verifica a mudança de URL
    await expect(page).toHaveURL(/\/politicos$/);
  });

  test('deve navegar para a página Sobre e exibir o conteúdo explicativo', async ({ page }) => {
    await page.goto('/');
    
    // Clica no link "Sobre"
    await page.click('text=Sobre');
    
    await expect(page).toHaveURL(/\/sobre$/);
  });
});
