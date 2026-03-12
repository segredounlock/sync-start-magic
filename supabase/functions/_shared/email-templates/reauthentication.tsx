/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://xtkqyjruyuydlbvwduuy.supabase.co/storage/v1/object/public/email-assets/logo.jpeg'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação — Recargas Brasil</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoWrapper}>
          <Img src={LOGO_URL} width="56" height="56" alt="Recargas Brasil" style={logoStyle} />
        </div>
        <Heading style={h1}>Código de verificação</Heading>
        <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={divider}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Text style={footer}>
          Este código expira em breve. Se você não solicitou, ignore este e-mail.
        </Text>
        <Text style={brand}>© Recargas Brasil</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const logoWrapper = { textAlign: 'center' as const, marginBottom: '24px' }
const logoStyle = { borderRadius: '14px', display: 'inline-block' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 28px' }
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: '#1a9a5c',
  margin: '0 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '6px',
  backgroundColor: '#f0faf5',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #d0ece0',
}
const divider = { fontSize: '8px', color: '#e0e0e0', textAlign: 'center' as const, margin: '28px 0 16px', letterSpacing: '2px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 8px', textAlign: 'center' as const }
const brand = { fontSize: '12px', color: '#1a9a5c', fontWeight: 'bold' as const, textAlign: 'center' as const, margin: '8px 0 0' }
