'use client'

import { useEffect } from 'react'
import type { Metadata } from 'next'

// Note: metadata export is in layout.tsx for this client component

const SWAGGER_CSS = 'https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css'
const SWAGGER_JS = 'https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js'

const STYLES = `
  /* ─── Page reset ─────────────────────────────────────────────────────── */
  .api-docs-page {
    min-height: 100vh;
    background: #0f172a;
    color: #e2e8f0;
  }

  /* ─── Top Banner ─────────────────────────────────────────────────────── */
  .ta-banner {
    background: linear-gradient(135deg, #3730a3 0%, #6d28d9 50%, #7c3aed 100%);
    color: white;
    padding: 20px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .ta-banner-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
  }
  .ta-banner h1 {
    margin: 0;
    font-size: 1.35rem;
    font-family: system-ui, sans-serif;
    font-weight: 700;
  }
  .ta-banner p {
    margin: 2px 0 0;
    font-size: 0.8rem;
    opacity: 0.75;
    font-family: system-ui, sans-serif;
  }
  .ta-banner-badge {
    margin-left: auto;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 999px;
    padding: 4px 14px;
    font-size: 0.75rem;
    font-family: monospace;
  }

  /* ─── Swagger UI container ────────────────────────────────────────────── */
  #swagger-ui {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info { margin-bottom: 20px; }
  .swagger-ui .info .title { color: #e2e8f0; font-size: 1.6rem; }
  .swagger-ui .info p,
  .swagger-ui .info li { color: #94a3b8; }
  .swagger-ui .info a { color: #818cf8; }
  .swagger-ui .scheme-container {
    background: #1e293b;
    box-shadow: none;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .swagger-ui select {
    background: #334155;
    color: #e2e8f0;
    border: 1px solid #475569;
  }
  .swagger-ui .opblock-tag {
    color: #c4b5fd;
    border-bottom: 1px solid #1e293b;
    font-size: 1rem;
  }
  .swagger-ui .opblock-tag small { color: #64748b; }
  .swagger-ui .opblock {
    border-radius: 8px;
    border: 1px solid #1e293b;
    background: #1e293b;
    margin-bottom: 8px;
    box-shadow: none;
  }
  .swagger-ui .opblock .opblock-summary { border-bottom: none; }
  .swagger-ui .opblock.is-open .opblock-summary { border-bottom: 1px solid #334155; }
  .swagger-ui .opblock.opblock-get  .opblock-summary-method { background: #0ea5e9; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #10b981; }
  .swagger-ui .opblock.opblock-put  .opblock-summary-method { background: #f59e0b; }
  .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #8b5cf6; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
  .swagger-ui .opblock-summary-path { color: #e2e8f0 !important; }
  .swagger-ui .opblock-summary-description { color: #94a3b8; }
  .swagger-ui .opblock-section-header { background: #0f172a; }
  .swagger-ui .opblock-section-header h4 { color: #94a3b8; }
  .swagger-ui .opblock-body pre.microlight { background: #0f172a; color: #e2e8f0; border-radius: 6px; }
  .swagger-ui .model-box { background: #0f172a; border-radius: 6px; }
  .swagger-ui .model { color: #94a3b8; }
  .swagger-ui table thead tr th {
    color: #94a3b8;
    border-bottom: 1px solid #334155;
  }
  .swagger-ui table tbody tr td { color: #cbd5e1; border-bottom: 1px solid #1e293b; }
  .swagger-ui .parameters-col_description p { color: #94a3b8; }
  .swagger-ui .parameters-col_description input,
  .swagger-ui .parameters-col_description select,
  .swagger-ui textarea {
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #475569;
    border-radius: 4px;
  }
  .swagger-ui .btn.execute {
    background: #6366f1;
    border-color: #6366f1;
    border-radius: 6px;
    color: white;
    font-weight: 600;
  }
  .swagger-ui .btn.execute:hover { background: #4f46e5; }
  .swagger-ui .response-col_status { color: #10b981; font-weight: 600; }
  .swagger-ui .response-col_description p { color: #94a3b8; }
  .swagger-ui section.models {
    border: 1px solid #1e293b;
    border-radius: 8px;
    background: #1e293b;
  }
  .swagger-ui section.models h4 { color: #c4b5fd; }
  .swagger-ui .prop-type { color: #38bdf8; }
  .swagger-ui .prop-format { color: #94a3b8; }
  .swagger-ui .model-title { color: #e2e8f0; }
  .swagger-ui .expand-methods svg, .swagger-ui .expand-operation svg { fill: #94a3b8; }
  .swagger-ui input[type=text], .swagger-ui input[type=password] {
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #475569;
  }
  .swagger-ui .highlight-code { background: #0f172a !important; }
  .swagger-ui .loading-container .loading::after { border-color: #6366f1; }
  /* Filter input */
  .swagger-ui .filter .operation-filter-input {
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #475569;
    border-radius: 6px;
  }
`

export default function ApiDocsPage() {
  useEffect(() => {
    // Inject Swagger UI CSS
    if (!document.querySelector('#swagger-css')) {
      const link = document.createElement('link')
      link.id = 'swagger-css'
      link.rel = 'stylesheet'
      link.href = SWAGGER_CSS
      document.head.appendChild(link)
    }

    // Inject custom styles
    if (!document.querySelector('#swagger-custom-css')) {
      const style = document.createElement('style')
      style.id = 'swagger-custom-css'
      style.textContent = STYLES
      document.head.appendChild(style)
    }

    // Load Swagger UI bundle and init
    if (!document.querySelector('#swagger-bundle-js')) {
      const script = document.createElement('script')
      script.id = 'swagger-bundle-js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = SWAGGER_JS
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SwaggerUIBundle = (window as any).SwaggerUIBundle
        SwaggerUIBundle({
          url: '/api/swagger-spec',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
          deepLinking: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          persistAuthorization: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 2,
          docExpansion: 'list',
          filter: true,
          syntaxHighlight: { theme: 'monokai' },
        })
      }
      document.body.appendChild(script)
    } else {
      // Script already loaded — re-init (e.g. on HMR)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SwaggerUIBundle = (window as any).SwaggerUIBundle
      if (SwaggerUIBundle) {
        SwaggerUIBundle({
          url: '/api/swagger-spec',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
          deepLinking: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          persistAuthorization: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 2,
          docExpansion: 'list',
          filter: true,
          syntaxHighlight: { theme: 'monokai' },
        })
      }
    }
  }, [])

  return (
    <div className="api-docs-page">
      {/* Banner */}
      <div className="ta-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="TAEnglish" className="ta-banner-icon" />
        <div>
          <h1>TAEnglish — API Docs</h1>
          <p>Created by Nguyễn Tài Anh (Leon Nguyen) · OpenAPI 3.0</p>
        </div>
        <span className="ta-banner-badge">v1.0.0</span>
      </div>

      {/* Swagger UI mounts here */}
      <div id="swagger-ui" />
    </div>
  )
}
