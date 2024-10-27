// vite/config.prod.mjs
import { defineConfig } from "file:///D:/Documents/__practical_projects/sunbacked/sunbacked-client/node_modules/vite/dist/node/index.js";
import solid from "file:///D:/Documents/__practical_projects/sunbacked/sunbacked-client/node_modules/vite-plugin-solid/dist/esm/index.mjs";
process.stdout.write(`Building for production...
`);
var line = "---------------------------------------------------------";
var msg = `\u2764\uFE0F\u2764\uFE0F\u2764\uFE0F Tell us about your game! - games@phaser.io \u2764\uFE0F\u2764\uFE0F\u2764\uFE0F`;
process.stdout.write(`${line}
${msg}
${line}
`);
var config_prod_default = defineConfig({
  base: "./",
  plugins: [
    solid()
  ],
  logLevel: "error",
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  },
  esbuild: {
    supported: {
      "top-level-await": true
      //browsers can handle top-level-await features
    }
  }
});
export {
  config_prod_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS9jb25maWcucHJvZC5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2N1bWVudHNcXFxcX19wcmFjdGljYWxfcHJvamVjdHNcXFxcc3VuYmFja2VkXFxcXHN1bmJhY2tlZC1jbGllbnRcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRzXFxcXF9fcHJhY3RpY2FsX3Byb2plY3RzXFxcXHN1bmJhY2tlZFxcXFxzdW5iYWNrZWQtY2xpZW50XFxcXHZpdGVcXFxcY29uZmlnLnByb2QubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Eb2N1bWVudHMvX19wcmFjdGljYWxfcHJvamVjdHMvc3VuYmFja2VkL3N1bmJhY2tlZC1jbGllbnQvdml0ZS9jb25maWcucHJvZC5tanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBzb2xpZCBmcm9tICd2aXRlLXBsdWdpbi1zb2xpZCc7XG5cbnByb2Nlc3Muc3Rkb3V0LndyaXRlKGBCdWlsZGluZyBmb3IgcHJvZHVjdGlvbi4uLlxcbmApO1xuY29uc3QgbGluZSA9IFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCI7XG5jb25zdCBtc2cgPSBgXHUyNzY0XHVGRTBGXHUyNzY0XHVGRTBGXHUyNzY0XHVGRTBGIFRlbGwgdXMgYWJvdXQgeW91ciBnYW1lISAtIGdhbWVzQHBoYXNlci5pbyBcdTI3NjRcdUZFMEZcdTI3NjRcdUZFMEZcdTI3NjRcdUZFMEZgO1xucHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7bGluZX1cXG4ke21zZ31cXG4ke2xpbmV9XFxuYCk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgYmFzZTogJy4vJyxcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHNvbGlkKCksXG4gICAgXSxcbiAgICBsb2dMZXZlbDogJ2Vycm9yJyxcbiAgICBidWlsZDoge1xuICAgICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICAgIHBhc3NlczogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hbmdsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRzOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICAgIHN1cHBvcnRlZDoge1xuICAgICAgICAgICAgJ3RvcC1sZXZlbC1hd2FpdCc6IHRydWUgLy9icm93c2VycyBjYW4gaGFuZGxlIHRvcC1sZXZlbC1hd2FpdCBmZWF0dXJlc1xuICAgICAgICB9LFxuICAgIH1cbn0pO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ZLFNBQVMsb0JBQW9CO0FBQ2hhLE9BQU8sV0FBVztBQUVsQixRQUFRLE9BQU8sTUFBTTtBQUFBLENBQThCO0FBQ25ELElBQU0sT0FBTztBQUNiLElBQU0sTUFBTTtBQUNaLFFBQVEsT0FBTyxNQUFNLEdBQUcsSUFBSTtBQUFBLEVBQUssR0FBRztBQUFBLEVBQUssSUFBSTtBQUFBLENBQUk7QUFFakQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFVBQVU7QUFBQSxFQUNWLE9BQU87QUFBQSxJQUNILFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNYLFVBQVU7QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNaO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsUUFDSixVQUFVO0FBQUEsTUFDZDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxXQUFXO0FBQUEsTUFDUCxtQkFBbUI7QUFBQTtBQUFBLElBQ3ZCO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
