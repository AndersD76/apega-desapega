// URL do backend - IMPORTANTE: Alterar para URL do Vercel em produção
export const API_URL = __DEV__
  ? 'http://localhost:3001' // Development (Express backend na porta 3001)
  : 'https://seu-app.vercel.app'; // Production (alterar quando fizer deploy)
