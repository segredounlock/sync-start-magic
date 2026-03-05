

## Plano: Adicionar animações aos ícones de operadoras (Smartphone)

### O que será feito
Adicionar animações nos ícones `Smartphone` dentro dos cards de operadoras (Claro, Tim, Vivo) na aba "Status do Sistema", usando `motion.div` do Framer Motion — cada operadora com uma animação diferente para dar vida ao painel.

### Alteração

**`src/pages/RevendedorPainel.tsx`** (linhas ~1993-1994)

Envolver o ícone `<Smartphone>` em um `<motion.div>` com animação distinta por operadora:
- **Claro** → pulso (scale)
- **Tim** → flutuação (float y)  
- **Vivo** → balanço (wiggle/rotate)

Trocar:
```tsx
<Smartphone className={`h-5 w-5 ${opColor}`} />
```

Por:
```tsx
<motion.div
  animate={
    opName === "CLARO" ? { scale: [1, 1.15, 1] } :
    opName === "TIM"   ? { y: [0, -3, 0] } :
                         { rotate: [0, 8, -8, 0] }
  }
  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: i * 0.15 }}
>
  <Smartphone className={`h-5 w-5 ${opColor}`} />
</motion.div>
```

Isso mantém o mesmo padrão de animações já usado nos indicadores de saúde do sistema (linhas 2029-2036) e nos outros componentes do projeto.

