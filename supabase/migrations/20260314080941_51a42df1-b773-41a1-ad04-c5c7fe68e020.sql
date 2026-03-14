
-- Scratch cards table
CREATE TABLE public.scratch_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prize_amount numeric NOT NULL DEFAULT 0,
  is_scratched boolean NOT NULL DEFAULT false,
  is_won boolean NOT NULL DEFAULT false,
  scratched_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  card_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Unique constraint: 1 card per user per day
CREATE UNIQUE INDEX scratch_cards_user_date_idx ON public.scratch_cards (user_id, card_date);

-- Enable RLS
ALTER TABLE public.scratch_cards ENABLE ROW LEVEL SECURITY;

-- Users can view own cards
CREATE POLICY "Users can view own scratch cards"
ON public.scratch_cards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own card (daily)
CREATE POLICY "Users can insert own scratch card"
ON public.scratch_cards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own unscratched card (to scratch it)
CREATE POLICY "Users can scratch own card"
ON public.scratch_cards FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND is_scratched = false)
WITH CHECK (auth.uid() = user_id AND is_scratched = true);

-- Admins full access
CREATE POLICY "Admins can manage scratch cards"
ON public.scratch_cards FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
