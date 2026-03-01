import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, Image, Plus, Trash2, Link, Upload, X, Sparkles } from 'lucide-react';

interface BroadcastButton {
  text: string;
  url: string;
}

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
}

const MESSAGE_EFFECTS = [
  { id: 'none', label: 'Sem efeito', emoji: '❌' },
  { id: '5104841245755180586', label: 'Confete', emoji: '🎉' },
  { id: '5107584321108051014', label: 'Corações', emoji: '❤️' },
  { id: '5104858069142078462', label: 'Joinha', emoji: '👍' },
  { id: '5159385139981059251', label: 'Fogo', emoji: '🔥' },
];

export function BroadcastForm({ userCount, sending, onSubmit }: BroadcastFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validButtons = formData.buttons.filter(b => b.text.trim() && b.url.trim());
    onSubmit({
      ...formData,
      image_url: enableImage ? formData.image_url : null,
      buttons: enableButtons ? validButtons : [],
      message_effect_id: selectedEffect !== 'none' ? selectedEffect : null,
    });
    setFormData({ title: '', message: '', image_url: null, buttons: [], message_effect_id: null });
    setEnableImage(false);
    setEnableButtons(false);
    setSelectedEffect('none');
  };

  return (
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
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Sua mensagem aqui... (suporta HTML: <b>, <i>, <a>)"
          rows={4}
          required
          className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
          <Sparkles className="w-4 h-4" /> Efeito Visual
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

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center">
        Será enviado para <span className="font-bold text-foreground">{userCount}</span> usuários
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={sending}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
      >
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar Broadcast</>
        )}
      </button>
    </form>
  );
}
