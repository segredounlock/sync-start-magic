
CREATE OR REPLACE FUNCTION public.increment_saldo(p_user_id uuid, p_tipo text, p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_val numeric;
BEGIN
  UPDATE public.saldos 
  SET valor = valor + p_amount, updated_at = now()
  WHERE user_id = p_user_id AND tipo = p_tipo
  RETURNING valor INTO new_val;
  
  IF new_val IS NULL THEN
    INSERT INTO public.saldos (user_id, tipo, valor)
    VALUES (p_user_id, p_tipo, p_amount)
    ON CONFLICT DO NOTHING;
    new_val := p_amount;
  END IF;
  
  RETURN COALESCE(new_val, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_transaction(p_tx_id uuid, p_from_status text, p_to_status text, p_metadata jsonb DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rows_affected integer;
BEGIN
  IF p_metadata IS NOT NULL THEN
    UPDATE public.transactions 
    SET status = p_to_status, updated_at = now(), metadata = p_metadata
    WHERE id = p_tx_id AND status = p_from_status;
  ELSE
    UPDATE public.transactions 
    SET status = p_to_status, updated_at = now()
    WHERE id = p_tx_id AND status = p_from_status;
  END IF;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;
