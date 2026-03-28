import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { styledToast as toast } from "@/lib/toast";
import { Loader2, Send, Image, Plus, Trash2, Link, Upload, X, Sparkles, Tag, Zap, Bell, Megaphone, TrendingUp } from 'lucide-react';
import { fixExternalUrl } from '@/lib/domain';
import { TextFormatToolbar, renderTelegramHtml } from './TextFormatToolbar';

type ButtonStyle = 'primary' | 'success' | 'danger';

interface BroadcastButton {
  text: string;
  url: string;
  style?: ButtonStyle;
}

const BUTTON_STYLES: { value: ButtonStyle; label: string; color: string; preview: string }[] = [
  { value: 'primary', label: 'Azul', color: 'bg-blue-500', preview: 'bg-blue-500/20 text-blue-400' },
  { value: 'success', label: 'Verde', color: 'bg-green-500', preview: 'bg-green-500/20 text-green-400' },
  { value: 'danger', label: 'Vermelho', color: 'bg-red-500', preview: 'bg-red-500/20 text-red-400' },
];

interface BroadcastFormData {
  title: string;
  message: string;
  image_url: string | null;
  buttons: BroadcastButton[];
  message_effect_id: string | null;
}

interface BroadcastFormProps {
  userCount: number;
  sending: boolean;
  onSubmit: (data: BroadcastFormData) => void;
  onClose?: () => void;
}

const MESSAGE_EFFECTS = [
  { id: 'none', label: 'Sem efeito', emoji: '❌' },
  { id: '5046509860389126442', label: 'Confete', emoji: '🎉' },
  { id: '5159385139981059251', label: 'Corações', emoji: '❤️' },
  { id: '5107584321108051014', label: 'Joinha', emoji: '👍' },
  { id: '5104841245755180586', label: 'Fogo', emoji: '🔥' },
];

const TEMPLATES = [
  { key: 'promo', label: 'Promoção', emoji: '🏷️', color: 'bg-green-600/80', title: '🎉 Promoção Especial!', message: 'Aproveite 20% de desconto em todos os planos! Use o cupom PROMO20. Válido até domingo!' },
  { key: 'novidade', label: 'Novidade', emoji: '✨', color: 'bg-purple-600/80', title: '✨ Novidade!', message: 'Temos novidades incríveis para você! Confira as últimas atualizações.' },
  { key: 'aviso', label: 'Aviso', emoji: '🔔', color: 'bg-yellow-600/80', title: '⚠️ Aviso Importante', message: 'Atenção! Informamos que haverá uma manutenção programada.' },
  { key: 'comunicado', label: 'Comunicado', emoji: '📢', color: 'bg-blue-600/80', title: '📢 Comunicado Oficial', message: 'Comunicamos a todos os nossos clientes sobre as seguintes mudanças.' },
  { key: 'maluca', label: 'Recarga Maluca', emoji: '🤪', color: 'bg-orange-600/80', title: '🤪🔥 RECARGA MALUCA do FDS!', message: '⚡ Todo fim de semana tem RECARGA MALUCA!\n\n💰 Preços EXCLUSIVOS e DIFERENCIADOS que você só encontra aqui!\n\n📱 Recarregue já e aproveite antes que acabe!\n\n⏰ Válido sábado e domingo!' },
  { key: 'tim-lenta', label: 'TIM Lenta', emoji: '⏳', color: 'bg-red-600/80', title: '⏳ TIM com Lentidão', message: '⏳ A operadora <b>TIM</b> está apresentando lentidão no processamento das recargas.\n\n⚠️ Suas recargas serão processadas normalmente, porém com um tempo maior que o habitual.\n\n🔄 Estamos monitorando a situação e atualizaremos assim que normalizar.\n\n📞 Em caso de dúvidas, entre em contato com o suporte.' },
  { key: 'tim-normalizada', label: 'TIM Normalizada', emoji: '✅', color: 'bg-green-600/80', title: '✅ TIM Normalizada', message: '✅ A operadora <b>TIM</b> voltou a operar normalmente!\n\n⚡ As recargas estão sendo processadas no tempo habitual.\n\n🙏 Agradecemos pela paciência de todos!' },
  { key: 'claro-lenta', label: 'CLARO Lenta', emoji: '⏳', color: 'bg-red-600/80', title: '⏳ CLARO com Lentidão', message: '⏳ A operadora <b>CLARO</b> está apresentando lentidão no processamento das recargas.\n\n⚠️ Suas recargas serão processadas normalmente, porém com um tempo maior que o habitual.\n\n🔄 Estamos monitorando a situação e atualizaremos assim que normalizar.\n\n📞 Em caso de dúvidas, entre em contato com o suporte.' },
  { key: 'claro-normalizada', label: 'CLARO Normalizada', emoji: '✅', color: 'bg-green-600/80', title: '✅ CLARO Normalizada', message: '✅ A operadora <b>CLARO</b> voltou a operar normalmente!\n\n⚡ As recargas estão sendo processadas no tempo habitual.\n\n🙏 Agradecemos pela paciência de todos!' },
  { key: 'vivo-lenta', label: 'VIVO Lenta', emoji: '⏳', color: 'bg-purple-600/80', title: '⏳ VIVO com Lentidão', message: '⏳ A operadora <b>VIVO</b> está apresentando lentidão no processamento das recargas.\n\n⚠️ Suas recargas serão processadas normalmente, porém com um tempo maior que o habitual.\n\n🔄 Estamos monitorando a situação e atualizaremos assim que normalizar.\n\n📞 Em caso de dúvidas, entre em contato com o suporte.' },
  { key: 'vivo-normalizada', label: 'VIVO Normalizada', emoji: '✅', color: 'bg-green-600/80', title: '✅ VIVO Normalizada', message: '✅ A operadora <b>VIVO</b> voltou a operar normalmente!\n\n⚡ As recargas estão sendo processadas no tempo habitual.\n\n🙏 Agradecemos pela paciência de todos!' },
  { key: 'suporte', label: 'Suporte', emoji: '📋', color: 'bg-cyan-600/80', title: '📢 Comunicado Oficial', message: '🛠 <b>COMO FUNCIONA O SUPORTE — LEIAM COM ATENÇÃO</b>\n\nQuando ocorrer a situação de:\n"Meu cliente disse que a recarga não caiu"\n\n👉 Nós não vendemos para o cliente final. Vendemos para <b>você</b>.\n👉 O cliente é de responsabilidade do <b>revendedor</b>.\n\nAntes de acionar o suporte, você deve verificar diretamente no app da operadora.\n\n📲 <b>Verificação por operadora:</b>\n\n🔴 <b>CLARO</b>\n• CPF\n• Senha do app Minha Claro\n\n🟣 <b>TIM</b>\n• Número da linha\n• Senha do app Meu TIM\n\n⚠️ Caso o cliente se recuse a fornecer esses dados, não será possível realizar a verificação, e o suporte <b>não poderá prosseguir</b>.\n\n⏱️ <b>Importante:</b>\nAs recargas geralmente aparecem no extrato da operadora até <b>1 hora</b> após a conclusão.\n\n👉 Informe esse prazo ao seu cliente antes de realizar a recarga e confirme se ele está de acordo.\n\nSeguindo esse procedimento, evitamos atrasos, confusão e retrabalho.' },
];

const BATCH_SIZE = 25;

export function BroadcastForm({ userCount, sending, onSubmit, onClose }: BroadcastFormProps) {
  const [formData, setFormData] = useState<BroadcastFormData>({
    title: '', message: '', image_url: null, buttons: [], message_effect_id: null,
  });
  const [enableImage, setEnableImage] = useState(false);
  const [enableButtons, setEnableButtons] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddButton = () => {
    if (formData.buttons.length < 2) {
      setFormData({ ...formData, buttons: [...formData.buttons, { text: '', url: '' }] });
    }
  };

  const handleRemoveButton = (index: number) => {
    setFormData({ ...formData, buttons: formData.buttons.filter((_, i) => i !== index) });
  };

  const handleTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFormData({ ...formData, title: tpl.title, message: tpl.message });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast.error('Imagem inválida ou maior que 5MB');
      return;
    }
    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('broadcast-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('broadcast-images').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (error: any) {
      toast.error('Erro ao enviar imagem: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const fixUrl = (url: string) => fixExternalUrl(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validButtons = formData.buttons
      .filter(b => b.text.trim() && b.url.trim())
      .map(b => ({ ...b, url: fixUrl(b.url) }));
    onSubmit({
      ...formData,
      image_url: enableImage ? formData.image_url : null,
      buttons: enableButtons ? validButtons : [],
      message_effect_id: selectedEffect !== 'none' ? selectedEffect : null,
    });
  };

  const totalBatches = Math.ceil(userCount / BATCH_SIZE);
  const estimatedSeconds = Math.ceil((userCount / BATCH_SIZE) * 1.1);
  const speedPerSecond = BATCH_SIZE;

  return (
    <div className="space-y-5">
      {/* Templates */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Tag className="w-4 h-4" /> Templates Prontos
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => handleTemplate(tpl)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-80 ${tpl.color}`}
            >
              <span>{tpl.emoji}</span> {tpl.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">Ou crie uma mensagem personalizada abaixo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Título da Notificação</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="🎉 Promoção Especial!"
            required
            className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Mensagem</label>
          <TextFormatToolbar
            value={formData.message}
            onChange={(msg) => setFormData({ ...formData, message: msg })}
            placeholder="Aproveite 20% de desconto em todos os planos! Use o cupom PROMO20. Válido até domingo!"
            rows={4}
            required
            className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        {/* Feature toggles */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setEnableImage(!enableImage)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              enableImage ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" /> Imagem
          </button>
          <button
            type="button"
            onClick={() => {
              setEnableButtons(!enableButtons);
              if (!enableButtons && formData.buttons.length === 0) handleAddButton();
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              enableButtons ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <Link className="w-4 h-4" /> Botões
          </button>
        </div>

        {/* Message Effects */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="w-4 h-4" /> Efeito Visual da Mensagem
          </label>
          <div className="flex flex-wrap gap-2">
            {MESSAGE_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                type="button"
                onClick={() => setSelectedEffect(effect.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  selectedEffect === effect.id
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                    : 'border-border/50 glass hover:border-border'
                }`}
              >
                <span>{effect.emoji}</span>
                <span className="text-xs">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image upload */}
        {enableImage && (
          <div className="space-y-2 p-3 rounded-lg glass border border-border/50">
            {formData.image_url ? (
              <div className="relative inline-block">
                <img src={formData.image_url} alt="Preview" className="max-h-32 rounded-lg" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: null })}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingImage ? 'Enviando...' : 'Escolher Imagem'}
                </button>
                <span className="text-xs text-muted-foreground">Máx. 5MB</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        {enableButtons && (
          <div className="space-y-3 p-3 rounded-lg glass border border-border/50">
            {formData.buttons.map((button, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    value={button.text}
                    onChange={(e) => {
                      const nb = [...formData.buttons];
                      nb[index].text = e.target.value;
                      setFormData({ ...formData, buttons: nb });
                    }}
                    placeholder="Texto do botão"
                    className="w-full px-3 py-2 rounded-lg glass-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={button.url}
                    onChange={(e) => {
                      const nb = [...formData.buttons];
                      nb[index].url = e.target.value;
                      setFormData({ ...formData, buttons: nb });
                    }}
                    placeholder="https://exemplo.com"
                    type="url"
                    className="w-full px-3 py-2 rounded-lg glass-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Cor:</span>
                    {BUTTON_STYLES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          const nb = [...formData.buttons];
                          nb[index].style = s.value;
                          setFormData({ ...formData, buttons: nb });
                        }}
                        className={`w-6 h-6 rounded-full ${s.color} border-2 transition-all ${
                          (button.style || 'primary') === s.value ? 'border-foreground scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={s.label}
                      />
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => handleRemoveButton(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.buttons.length < 2 && (
              <button type="button" onClick={handleAddButton} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg glass text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-4 h-4" /> Adicionar Botão
              </button>
            )}
          </div>
        )}

        {/* Preview */}
        {(formData.title || formData.message) && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Prévia no Telegram:</label>
            <div className="p-4 rounded-xl bg-[#1a2332] border border-border/30">
              {formData.image_url && enableImage && (
                <img src={formData.image_url} alt="" className="w-full max-h-40 object-cover rounded-lg mb-3" />
              )}
              <p className="text-sm font-bold text-white">📢 {formData.title || 'Título'}</p>
              <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderTelegramHtml(formData.message || 'Sua mensagem aqui...') }} />
              {enableButtons && formData.buttons.filter(b => b.text).length > 0 && (
                <div className="mt-3 flex gap-2">
                  {formData.buttons.filter(b => b.text).map((b, i) => {
                    const styleObj = BUTTON_STYLES.find(s => s.value === (b.style || 'primary'));
                    return (
                      <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${styleObj?.preview || 'bg-blue-500/20 text-blue-400'}`}>{b.text}</span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estimates */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Estimativa de envio
          </label>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destinatários:</span>
              <span className="font-bold text-primary">{userCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Velocidade:</span>
              <span className="font-bold text-foreground">~{speedPerSecond} msg/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo estimado:</span>
              <span className="font-bold text-foreground">~{estimatedSeconds}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batches:</span>
              <span className="font-bold text-foreground">{totalBatches}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={sending || !formData.title || !formData.message}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 glow-primary text-sm"
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <><Send className="w-4 h-4" /> Enviar para {userCount} usuários</>
          )}
        </button>
      </form>
    </div>
  );
}
