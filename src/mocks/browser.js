// src/mocks/browser.js
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Đăng ký các handler chúng ta vừa viết
export const worker = setupWorker(...handlers);