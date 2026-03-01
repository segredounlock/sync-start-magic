-- Add custo_api column to store the actual API cost separately from the charged cost
ALTER TABLE public.recargas ADD COLUMN IF NOT EXISTS custo_api numeric NOT NULL DEFAULT 0;

-- Update existing recargas: for now set custo_api = custo (best estimate for historical data)
-- The actual custo field currently stores chargedCost (what the reseller was charged)
-- We'll need to retroactively fix this based on pricing_rules
UPDATE public.recargas SET custo_api = custo WHERE custo_api = 0;