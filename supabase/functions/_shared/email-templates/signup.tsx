/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL = 'https://xtkqyjruyuydlbvwduuy.supabase.co/storage/v1/object/public/email-assets/logo.jpeg'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail — Recargas Brasil</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoWrapper}>
          <Img src={LOGO_URL} width="56" height="56" alt="Recargas Brasil" style={logoStyle} />
        </div>
        <Heading style={h1}>Confirme seu e-mail</Heading>
        <Text style={text}>
          Bem-vindo ao <strong>Recargas Brasil</strong>! 🎉
        </Text>
        <Text style={text}>
          Para ativar sua conta, confirme seu endereço de e-mail (
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
          ) clicando no botão abaixo:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar E-mail
        </Button>
        <Text style={divider}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Text style={footer}>
          Se você não criou uma conta, pode ignorar este e-mail com segurança.
        </Text>
        <Text style={brand}>© Recargas Brasil</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const logoWrapper = { textAlign: 'center' as const, marginBottom: '24px' }
const logoStyle = { borderRadius: '14px', display: 'inline-block' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 28px' }
const link = { color: '#1a9a5c', textDecoration: 'underline' }
const button = { backgroundColor: '#1a9a5c', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', textAlign: 'center' as const, display: 'block' as const, width: '100%', boxSizing: 'border-box' as const }
const divider = { fontSize: '8px', color: '#e0e0e0', textAlign: 'center' as const, margin: '28px 0 16px', letterSpacing: '2px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 8px', textAlign: 'center' as const }
const brand = { fontSize: '12px', color: '#1a9a5c', fontWeight: 'bold' as const, textAlign: 'center' as const, margin: '8px 0 0' }
