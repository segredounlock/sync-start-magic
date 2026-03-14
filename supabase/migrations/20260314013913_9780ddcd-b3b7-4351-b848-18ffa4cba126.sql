
-- CORREÇÃO 11: reseller_pricing_rules - exigir role revendedor
DROP POLICY IF EXISTS "Users can manage own reseller pricing" ON public.reseller_pricing_rules;

CREATE POLICY "Resellers can manage own pricing"
ON public.reseller_pricing_rules
FOR ALL
TO public
USING (auth.uid() = user_id AND has_role(auth.uid(), 'revendedor'))
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'revendedor'));

-- CORREÇÃO 12: Restringir chat participant profile view
-- Limitar campos sensíveis removendo a policy broad e usando profiles_public
DROP POLICY IF EXISTS "Users can view chat participant profiles" ON public.profiles;
-- Chat agora usa profiles_public (view sem campos sensíveis) - sem policy necessária

-- CORREÇÃO 13: Restringir criação de conversas diretas
-- Impedir que qualquer user crie conversa com qualquer outro sem restrição
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;

CREATE POLICY "Users can create conversations"
ON public.chat_conversations
FOR INSERT
TO public
WITH CHECK (auth.uid() = participant_1);
