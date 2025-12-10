import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next’s recommended sets
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Relax a few rules just for TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Allow quick prototyping with any; tighten later if you want
      "@typescript-eslint/no-explicit-any": "off",
      // Don’t fail the build for unused vars; underscore to intentionally ignore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Don’t block builds on exhaustive-deps; we’ll manage effects manually
      "react-hooks/exhaustive-deps": "warn"
    },
  },

  // Ignore build artifacts
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
