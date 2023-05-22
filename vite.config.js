import path from "path";
import { defineConfig } from "vite";
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
    plugins: [reactRefresh()],
    publicDir: path.join(__dirname, "assets"),
});
