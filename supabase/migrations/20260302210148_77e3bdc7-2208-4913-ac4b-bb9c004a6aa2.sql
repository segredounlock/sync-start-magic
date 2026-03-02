-- Create a function that calls the send-push edge function via pg_net
-- when a deposit is confirmed or a recarga status changes
CREATE OR REPLACE FUNCTION public.notify_push_on_deposit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
  _label TEXT;
BEGIN
  -- Only trigger on status change to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.type = 'deposit' THEN
    SELECT nome, email INTO _profile FROM public.profiles WHERE id = NEW.user_id LIMIT 1;
    _label := COALESCE(_profile.nome, _profile.email, 'Usuário');
    
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'title', '💰 Depósito confirmado',
        'body', 'R$ ' || ROUND(NEW.amount::numeric, 2)::text || ' — ' || _label
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_push_on_recarga()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
  _label TEXT;
  _status_label TEXT;
BEGIN
  -- On INSERT or status change
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
    SELECT nome, email INTO _profile FROM public.profiles WHERE id = NEW.user_id LIMIT 1;
    _label := COALESCE(_profile.nome, _profile.email, 'Usuário');
    
    CASE NEW.status
      WHEN 'completed', 'concluida' THEN _status_label := '✅ Concluída';
      WHEN 'falha' THEN _status_label := '❌ Falhou';
      WHEN 'pending', 'pendente' THEN _status_label := '⏳ Processando';
      WHEN 'processing' THEN _status_label := '⚙️ Processando';
      WHEN 'cancelled' THEN _status_label := '🚫 Cancelada';
      ELSE _status_label := NEW.status;
    END CASE;

    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'title', '📱 Recarga ' || _status_label,
        'body', COALESCE(NEW.operadora, '') || ' R$ ' || ROUND(NEW.valor::numeric, 2)::text || ' — ' || _label
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_push_on_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _label TEXT;
BEGIN
  _label := COALESCE(NULLIF(TRIM(NEW.nome), ''), NULLIF(TRIM(NEW.email), ''), 'Usuário');
  
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'title', '🆕 Novo cadastro Web',
      'body', _label
    )
  );
  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER push_notify_deposit
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_on_deposit();

CREATE TRIGGER push_notify_recarga
AFTER INSERT OR UPDATE ON public.recargas
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_on_recarga();

CREATE TRIGGER push_notify_new_user
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_on_new_user();
