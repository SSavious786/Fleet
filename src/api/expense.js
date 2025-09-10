import api from './client';

export async function getCompanyUserExpenses(userId) {
  const response = await api.get(`/expenses/company-user/${userId}`);
  return response.data; // Should be an array of assets
}

export async function createExpense(userId, data) {
    const response = await api.post(`/expenses?userId=${userId}`, data, {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      }
    });
  return response.data;
}

export async function updateExpense(expenseId, userId, data) {
  const response = await api.put(`/expenses/${expenseId}?userId=${userId}`, data, {
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function deleteExpenseById(expenseId) {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data; // Should be an array of assets
}