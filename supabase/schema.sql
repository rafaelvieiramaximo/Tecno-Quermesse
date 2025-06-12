-- Extensão necessária para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Tabela profiles para armazenar roles dos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Tabela booths (barracas), uma barraca é um usuário com role 'barraca'
CREATE TABLE IF NOT EXISTS public.booths (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_booths_updated_at
BEFORE UPDATE ON public.booths
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Tabela items para os produtos que cada barraca vai vender
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booth_id UUID NOT NULL REFERENCES public.booths(id),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Tabela cards para armazenar cartões (QR code)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_cards_created_by ON public.cards(created_by);


-- Tabela transactions para armazenar as transações realizadas
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id),
  booth_id UUID REFERENCES public.booths(id),
  item_id UUID REFERENCES public.items(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_processed_by ON public.transactions(processed_by);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_booth_id ON public.transactions(booth_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON public.transactions(item_id);


-- Trigger e função para criação automática do perfil padrão quando criar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- Habilitar RLS e criar policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- Policies profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);


-- Policies items
CREATE POLICY "Ver itens da própria barraca"
  ON public.items FOR SELECT, UPDATE
  USING (booth_id = auth.uid());

CREATE POLICY "Criar itens da própria barraca"
  ON public.items FOR INSERT
  WITH CHECK (booth_id = auth.uid());


-- Policies cards
CREATE POLICY "Cards são visíveis para todos usuários autenticados"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cards podem ser criados por usuários autenticados"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Cards podem ser atualizados por admin ou cashier"
  ON public.cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'cashier')
    )
  );


-- Policies transactions
CREATE POLICY "Transações são visíveis para quem processou ou admin"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = processed_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Transações podem ser criadas por usuários autenticados"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = processed_by);


-- Exemplo de inserção de usuário
INSERT INTO auth.users (id, email, password_hash)
VALUES (
  uuid_generate_v4(),
  'barraca1@festajunina.com',
  crypt('senhaSegura123', gen_salt('bf'))
)
RETURNING id;
