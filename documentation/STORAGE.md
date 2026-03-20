# 📁 Storage Buckets — 8 Buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | ✅ | Fotos de perfil dos usuários |
| `store-logos` | ✅ | Logos das lojas dos revendedores |
| `broadcast-images` | ✅ | Imagens dos broadcasts |
| `chat-audio` | ✅ | Áudios do chat |
| `chat-images` | ✅ | Imagens do chat |
| `receipts` | ✅ | Comprovantes de recarga |
| `email-assets` | ✅ | Assets dos templates de email |
| `login-selfies` | ❌ | Selfies de login (segurança) |

## Políticas de Acesso

### Buckets Públicos
- Qualquer pessoa pode ler (download)
- Apenas usuários autenticados podem fazer upload
- Upload restrito ao próprio diretório do usuário

### Bucket Privado (`login-selfies`)
- Apenas admins podem ler
- Upload vinculado ao user_id do login

## Paths Padrão

```
avatars/{user_id}/avatar.{ext}
store-logos/{user_id}/logo.{ext}
broadcast-images/{notification_id}/{filename}
chat-audio/{conversation_id}/{message_id}.webm
chat-images/{conversation_id}/{message_id}.{ext}
receipts/{user_id}/{recarga_id}.png
login-selfies/{user_id}/{fingerprint_hash}.jpg
```
