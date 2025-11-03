import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Verificar que la página cargue
  await expect(page).toHaveTitle(/TicketWise/);
});

test('login page is accessible', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  // Verificar que existe el formulario de login
  await expect(page.getByPlaceholder(/email|correo/i)).toBeVisible();
});
