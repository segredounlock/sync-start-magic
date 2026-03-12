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
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const logoUrl = 'https://xtkqyjruyuydlbvwduuy.supabase.co/storage/v1/object/public/email-assets/logo.jpeg'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinir sua senha — Recargas Brasil</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="Recargas Brasil" width="64" height="64" style={logo} />
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos uma solicitação para redefinir a senha da sua conta no Recargas Brasil.
          Clique no botão abaixo para escolher uma nova senha:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Redefinir Senha
        </Button>
        <Text style={footer}>
          Se você não solicitou a redefinição de senha, pode ignorar este e-mail. Sua senha não será alterada.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '480px', margin: '0 auto' }
const logo = { borderRadius: '12px', marginBottom: '20px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a2e1a', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a5568', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#1D9E5E', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }
