import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 주소 (soohy00.github.io/bike-guide/) 에서도 파일을 찾도록 상대 경로로 만들어요.
  // 화면 이동은 # 주소라서 페이지는 늘 index.html 하나예요.
  base: './',
  plugins: [react()],
});
